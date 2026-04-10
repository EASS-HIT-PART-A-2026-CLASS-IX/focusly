from datetime import UTC, datetime
from typing import Optional

from fastapi import HTTPException
from sqlmodel import Session

from app.models import Category, Priority, Status, Task
from app.repositories import (
    create_task,
    delete_task,
    get_task,
    list_tasks,
    update_task,
)
from app.schemas import TaskCreate, TaskUpdate


# ── Task service ──────────────────────────────────────────────────────────────

def service_list_tasks(
    db: Session,
    status: Optional[Status] = None,
    category: Optional[Category] = None,
    priority: Optional[Priority] = None,
) -> list[Task]:
    return list_tasks(db, status=status, category=category, priority=priority)


def service_get_task(db: Session, task_id: int) -> Task:
    task = get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return task


def service_create_task(db: Session, data: TaskCreate) -> Task:
    return create_task(db, data)


def service_update_task(db: Session, task_id: int, data: TaskUpdate) -> Task:
    task = service_get_task(db, task_id)
    task.updated_at = datetime.now(UTC)
    return update_task(db, task, data)


def service_delete_task(db: Session, task_id: int) -> None:
    task = service_get_task(db, task_id)
    delete_task(db, task)
