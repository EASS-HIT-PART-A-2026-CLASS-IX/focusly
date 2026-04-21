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


class PeakFocusTime(str, Enum):
    morning = "morning"
    afternoon = "afternoon"
    evening = "evening"


class Role(str, Enum):
    admin = "admin"
    user = "user"


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
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


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, min_length=3, max_length=50)
    hashed_password: str
    role: Role = Field(default=Role.user)


class UserPreferences(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    display_name: str = Field(min_length=1, max_length=100)
    age: int = Field(ge=1, le=120)
    work_start_hour: int = Field(ge=0, le=23)
    work_end_hour: int = Field(ge=0, le=23)
    preferred_study_hours_per_day: int = Field(ge=1, le=12)
    preferred_break_minutes: int = Field(ge=5, le=60)
    peak_focus_time: PeakFocusTime
