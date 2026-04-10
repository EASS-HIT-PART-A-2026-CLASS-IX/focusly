from datetime import date, datetime
from typing import Optional

from pydantic import field_validator
from sqlmodel import SQLModel

from app.models import Category, EnergyLevel, Priority, Status


# ── Task schemas ──────────────────────────────────────────────────────────────

class TaskCreate(SQLModel):
    title: str
    description: Optional[str] = None
    category: Category
    priority: Priority
    status: Status = Status.todo
    estimated_minutes: Optional[int] = None
    deadline: Optional[date] = None
    energy_required: EnergyLevel

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("title must not be blank")
        return v.strip()

    @field_validator("estimated_minutes")
    @classmethod
    def positive_minutes(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 1:
            raise ValueError("estimated_minutes must be at least 1")
        return v


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[Category] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    estimated_minutes: Optional[int] = None
    deadline: Optional[date] = None
    energy_required: Optional[EnergyLevel] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("title must not be blank")
        return v.strip() if v else v

    @field_validator("estimated_minutes")
    @classmethod
    def positive_minutes(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 1:
            raise ValueError("estimated_minutes must be at least 1")
        return v


class TaskRead(SQLModel):
    id: int
    title: str
    description: Optional[str]
    category: Category
    priority: Priority
    status: Status
    estimated_minutes: Optional[int]
    deadline: Optional[date]
    energy_required: EnergyLevel
    created_at: datetime
    updated_at: datetime
