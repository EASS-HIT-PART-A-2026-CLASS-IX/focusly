from typing import Optional

from sqlmodel import Session, select

from app.models import Category, Priority, Status, Task
from app.schemas import TaskCreate, TaskUpdate


# ── Task repository ───────────────────────────────────────────────────────────

def get_task(db: Session, task_id: int) -> Optional[Task]:
    return db.get(Task, task_id)


def list_tasks(
    db: Session,
    status: Optional[Status] = None,
    category: Optional[Category] = None,
    priority: Optional[Priority] = None,
) -> list[Task]:
    query = select(Task)
    if status is not None:
        query = query.where(Task.status == status)
    if category is not None:
        query = query.where(Task.category == category)
    if priority is not None:
        query = query.where(Task.priority == priority)
    return list(db.exec(query).all())


def create_task(db: Session, data: TaskCreate) -> Task:
    task = Task.model_validate(data)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task: Task, data: TaskUpdate) -> Task:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(task, key, value)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()
