"""
Focusly AI microservice.

Standalone FastAPI service responsible for generating task suggestions
using Google Gemma. The main API calls this service over HTTP — it has
no direct access to the database.

POST /suggest  →  returns top 3 task suggestions with motivating reasons
GET  /health   →  liveness check
"""

import json
import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from google import genai
from pydantic import BaseModel

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [ai_service] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GEMMA_MODEL    = os.getenv("GEMMA_MODEL", "gemma-3-27b-it")

app = FastAPI(title="Focusly AI Service", version="1.0.0")


# ── Schemas ───────────────────────────────────────────────────────────────────

class TaskInput(BaseModel):
    id: int
    title: str
    priority: str
    category: str
    estimated_minutes: int | None = None
    deadline: str | None = None
    status: str


class SuggestRequest(BaseModel):
    tasks: list[TaskInput]


class Suggestion(BaseModel):
    task_id: int
    title: str
    emoji: str
    reason: str
    estimated_minutes: int | None


class SuggestResponse(BaseModel):
    suggestions: list[Suggestion]


# ── Prompt ────────────────────────────────────────────────────────────────────

def build_prompt(tasks: list[TaskInput]) -> str:
    task_list = "\n".join(
        f"- ID {t.id}: \"{t.title}\" | priority: {t.priority} | "
        f"category: {t.category} | "
        f"estimated: {t.estimated_minutes or 'unknown'} min | "
        f"deadline: {t.deadline or 'none'}"
        for t in tasks
    )
    n = min(3, len(tasks))
    return f"""You are an enthusiastic, friendly study coach for students.
Pick up to {n} tasks from the list below to focus on TODAY.
For each, write a short (1-2 sentences), fun and motivating reason why to tackle it now.

Rules:
- ONLY use tasks from the list below — never invent or add new tasks
- Return exactly {n} suggestions, one per task in the list (do not create extras)
- Be encouraging and energetic, not robotic
- Keep each reason under 20 words
- Choose a relevant emoji for each task
- If estimated_minutes is unknown, make a reasonable estimate
- task_id must be one of the IDs from the list above

Tasks:
{task_list}

Respond ONLY with valid JSON, no extra text:
{{"suggestions": [{{"task_id": <int>, "title": "<string>", "emoji": "<emoji>", "reason": "<string>", "estimated_minutes": <int or null>}}]}}"""


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/suggest", response_model=SuggestResponse)
def suggest(body: SuggestRequest):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=503, detail="GOOGLE_API_KEY not configured")

    if not body.tasks:
        return SuggestResponse(suggestions=[])

    valid_ids = {t.id for t in body.tasks}
    valid_titles = {t.id: t.title for t in body.tasks}

    try:
        client   = genai.Client(api_key=GOOGLE_API_KEY)
        response = client.models.generate_content(
            model=GEMMA_MODEL,
            contents=build_prompt(body.tasks),
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)

        # Filter out any hallucinated tasks not in the original list
        suggestions = [
            Suggestion(**s)
            for s in data["suggestions"]
            if s.get("task_id") in valid_ids
        ]
        # Ensure titles match the real task titles
        for s in suggestions:
            s.title = valid_titles[s.task_id]

        return SuggestResponse(suggestions=suggestions)
    except Exception as e:
        logger.error("Gemma call failed: %s", e)
        raise HTTPException(status_code=502, detail="Gemma request failed")
