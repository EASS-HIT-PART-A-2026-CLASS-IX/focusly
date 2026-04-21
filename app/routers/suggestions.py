"""
Suggestions router.

Fetches non-done tasks from the database and forwards them to the
dedicated AI microservice (ai_service) which calls Gemma and returns
motivating task suggestions.
"""

import logging
import os

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.auth import get_current_user
from app.db import get_session
from app.models import Status, Task, User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/suggestions", tags=["suggestions"])

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8001")


class Suggestion(BaseModel):
    task_id: int
    title: str
    emoji: str
    reason: str
    estimated_minutes: int | None


class SuggestionsResponse(BaseModel):
    suggestions: list[Suggestion]


@router.get("", response_model=SuggestionsResponse)
def get_suggestions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    tasks = session.exec(
        select(Task).where(Task.status != Status.done, Task.user_id == current_user.id)
    ).all()

    if not tasks:
        return SuggestionsResponse(suggestions=[])

    payload = {
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "priority": t.priority,
                "category": t.category,
                "estimated_minutes": t.estimated_minutes,
                "deadline": str(t.deadline) if t.deadline else None,
                "status": t.status,
            }
            for t in tasks
        ]
    }

    try:
        response = httpx.post(f"{AI_SERVICE_URL}/suggest", json=payload, timeout=30)
        response.raise_for_status()
        return SuggestionsResponse(**response.json())
    except httpx.HTTPStatusError as e:
        logger.error("AI service returned error: %s", e)
        raise HTTPException(status_code=502, detail="AI service error")
    except httpx.RequestError as e:
        logger.error("AI service unreachable: %s", e)
        raise HTTPException(status_code=503, detail="AI service unavailable")
