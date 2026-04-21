from datetime import UTC, datetime
from typing import Optional

from fastapi import HTTPException
from sqlmodel import Session

from app.models import Category, Priority, Status, Task, UserPreferences
from app.repositories import (
    create_preferences,
    create_task,
    delete_preferences,
    delete_task,
    get_preferences,
    get_task,
    list_preferences,
    list_tasks,
    update_preferences,
    update_task,
)
from app.schemas import PreferencesCreate, PreferencesUpdate, TaskCreate, TaskUpdate


# ── Task service ──────────────────────────────────────────────────────────────

def service_list_tasks(
    db: Session,
    user_id: int,
    status: Optional[Status] = None,
    category: Optional[Category] = None,
    priority: Optional[Priority] = None,
) -> list[Task]:
    return list_tasks(db, user_id=user_id, status=status, category=category, priority=priority)


def service_get_task(db: Session, task_id: int, user_id: int) -> Task:
    task = get_task(db, task_id)
    if task is None or task.user_id != user_id:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return task


def service_create_task(db: Session, data: TaskCreate, user_id: int) -> Task:
    return create_task(db, data, user_id=user_id)


def service_update_task(db: Session, task_id: int, data: TaskUpdate, user_id: int) -> Task:
    task = service_get_task(db, task_id, user_id=user_id)
    task.updated_at = datetime.now(UTC)
    return update_task(db, task, data)


def service_delete_task(db: Session, task_id: int, user_id: int) -> None:
    task = service_get_task(db, task_id, user_id=user_id)
    delete_task(db, task)


# ── UserPreferences service ───────────────────────────────────────────────────

def service_list_preferences(db: Session) -> list[UserPreferences]:
    return list_preferences(db)


def service_get_preferences(db: Session, pref_id: int) -> UserPreferences:
    prefs = get_preferences(db, pref_id)
    if prefs is None:
        raise HTTPException(status_code=404, detail=f"Preferences {pref_id} not found")
    return prefs


def service_create_preferences(db: Session, data: PreferencesCreate) -> UserPreferences:
    return create_preferences(db, data)


def service_update_preferences(db: Session, pref_id: int, data: PreferencesUpdate) -> UserPreferences:
    prefs = service_get_preferences(db, pref_id)
    return update_preferences(db, prefs, data)


def service_delete_preferences(db: Session, pref_id: int) -> None:
    prefs = service_get_preferences(db, pref_id)
    delete_preferences(db, prefs)
