"""
AI-powered task suggestions using Google Gemma.
GET /suggestions → top 3 tasks to focus on today, with motivating reasons.
"""

import json
import logging
import os

from fastapi import APIRouter, Depends, HTTPException
from google import genai
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db import get_session
from app.models import Status, Task

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/suggestions", tags=["suggestions"])

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GEMMA_MODEL = os.getenv("GEMMA_MODEL", "gemma-3-27b-it")


class Suggestion(BaseModel):
    task_id: int
    title: str
    emoji: str
    reason: str
    estimated_minutes: int | None


class SuggestionsResponse(BaseModel):
    suggestions: list[Suggestion]


def build_prompt(tasks: list[Task]) -> str:
    task_list = "\n".join(
        f"- ID {t.id}: \"{t.title}\" | priority: {t.priority} | "
        f"category: {t.category} | "
        f"estimated: {t.estimated_minutes or 'unknown'} min | "
        f"deadline: {t.deadline or 'none'}"
        for t in tasks
    )
    return f"""You are an enthusiastic, friendly study coach for students.
Pick the top 3 tasks from the list below to focus on TODAY.
For each, write a short (1-2 sentences), fun and motivating reason why to tackle it now.

Rules:
- Be encouraging and energetic, not robotic
- Keep each reason under 20 words
- Choose a relevant emoji for each task
- If estimated_minutes is unknown, make a reasonable estimate

Tasks:
{task_list}

Respond ONLY with valid JSON, no extra text:
{{"suggestions": [{{"task_id": <int>, "title": "<string>", "emoji": "<emoji>", "reason": "<string>", "estimated_minutes": <int or null>}}]}}"""


@router.get("", response_model=SuggestionsResponse)
def get_suggestions(session: Session = Depends(get_session)):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=503, detail="GOOGLE_API_KEY not configured")

    tasks = session.exec(
        select(Task).where(Task.status != Status.done)
    ).all()

    if not tasks:
        return SuggestionsResponse(suggestions=[])

    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
        response = client.models.generate_content(
            model=GEMMA_MODEL,
            contents=build_prompt(tasks),
        )
        raw = response.text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
        return SuggestionsResponse(suggestions=[Suggestion(**s) for s in data["suggestions"]])
    except Exception as e:
        logger.error("Gemma suggestion failed: %s", e)
        raise HTTPException(status_code=502, detail="AI suggestion service unavailable")
