from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.auth import require_admin
from app.db import get_session
from app.models import Category, Priority, Status, User
from app.schemas import TaskCreate, TaskRead, TaskUpdate
from app.services import (
    service_create_task,
    service_delete_task,
    service_get_task,
    service_list_tasks,
    service_update_task,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskRead])
def list_tasks(
    status: Optional[Status] = None,
    category: Optional[Category] = None,
    priority: Optional[Priority] = None,
    db: Session = Depends(get_session),
):
    return service_list_tasks(db, status=status, category=category, priority=priority)


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Session = Depends(get_session)):
    return service_get_task(db, task_id)


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate, db: Session = Depends(get_session)):
    return service_create_task(db, data)


@router.put("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_session)):
    return service_update_task(db, task_id, data)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_session),
    _: User = Depends(require_admin),
):
    service_delete_task(db, task_id)
