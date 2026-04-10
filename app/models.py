from datetime import UTC, date, datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class Category(str, Enum):
    study = "study"
    work = "work"
    leisure = "leisure"
    personal = "personal"


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Status(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class EnergyLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    category: Category
    priority: Priority
    status: Status = Field(default=Status.todo)
    estimated_minutes: Optional[int] = Field(default=None, ge=1)
    deadline: Optional[date] = None
    energy_required: EnergyLevel
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
