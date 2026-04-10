from datetime import date, datetime
from typing import Optional

from pydantic import field_validator, model_validator
from sqlmodel import SQLModel

from app.models import Category, EnergyLevel, PeakFocusTime, Priority, Status


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


# ── UserPreferences schemas ───────────────────────────────────────────────────

class PreferencesCreate(SQLModel):
    display_name: str
    age: int
    work_start_hour: int
    work_end_hour: int
    preferred_study_hours_per_day: int
    preferred_break_minutes: int
    peak_focus_time: PeakFocusTime

    @field_validator("display_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("display_name must not be blank")
        return v.strip()

    @field_validator("age")
    @classmethod
    def valid_age(cls, v: int) -> int:
        if not (1 <= v <= 120):
            raise ValueError("age must be between 1 and 120")
        return v

    @field_validator("work_start_hour", "work_end_hour")
    @classmethod
    def valid_hour(cls, v: int) -> int:
        if not (0 <= v <= 23):
            raise ValueError("hour must be between 0 and 23")
        return v

    @field_validator("preferred_study_hours_per_day")
    @classmethod
    def valid_study_hours(cls, v: int) -> int:
        if not (1 <= v <= 12):
            raise ValueError("preferred_study_hours_per_day must be between 1 and 12")
        return v

    @field_validator("preferred_break_minutes")
    @classmethod
    def valid_break(cls, v: int) -> int:
        if not (5 <= v <= 60):
            raise ValueError("preferred_break_minutes must be between 5 and 60")
        return v

    @model_validator(mode="after")
    def end_after_start(self) -> "PreferencesCreate":
        if self.work_end_hour <= self.work_start_hour:
            raise ValueError("work_end_hour must be greater than work_start_hour")
        return self


class PreferencesUpdate(SQLModel):
    display_name: Optional[str] = None
    age: Optional[int] = None
    work_start_hour: Optional[int] = None
    work_end_hour: Optional[int] = None
    preferred_study_hours_per_day: Optional[int] = None
    preferred_break_minutes: Optional[int] = None
    peak_focus_time: Optional[PeakFocusTime] = None

    @field_validator("display_name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("display_name must not be blank")
        return v.strip() if v else v

    @field_validator("age")
    @classmethod
    def valid_age(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (1 <= v <= 120):
            raise ValueError("age must be between 1 and 120")
        return v

    @field_validator("work_start_hour", "work_end_hour")
    @classmethod
    def valid_hour(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (0 <= v <= 23):
            raise ValueError("hour must be between 0 and 23")
        return v

    @field_validator("preferred_study_hours_per_day")
    @classmethod
    def valid_study_hours(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (1 <= v <= 12):
            raise ValueError("preferred_study_hours_per_day must be between 1 and 12")
        return v

    @field_validator("preferred_break_minutes")
    @classmethod
    def valid_break(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (5 <= v <= 60):
            raise ValueError("preferred_break_minutes must be between 5 and 60")
        return v

    @model_validator(mode="after")
    def end_after_start(self) -> "PreferencesUpdate":
        start = self.work_start_hour
        end = self.work_end_hour
        if start is not None and end is not None and end <= start:
            raise ValueError("work_end_hour must be greater than work_start_hour")
        return self


class PreferencesRead(SQLModel):
    id: int
    display_name: str
    age: int
    work_start_hour: int
    work_end_hour: int
    preferred_study_hours_per_day: int
    preferred_break_minutes: int
    peak_focus_time: PeakFocusTime
