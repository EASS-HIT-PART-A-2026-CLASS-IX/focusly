"""
Seed script — populates the database with sample tasks and preferences.

Usage:
    uv run python scripts/seed.py
"""

from sqlmodel import Session, select

from app.db import create_db_and_tables, engine
from app.models import (
    Category,
    EnergyLevel,
    PeakFocusTime,
    Priority,
    Status,
    Task,
    UserPreferences,
)


def seed_tasks(db: Session) -> None:
    existing = db.exec(select(Task)).all()
    if existing:
        print(f"Tasks table already has {len(existing)} rows — skipping.")
        return

    tasks = [
        Task(
            title="Finish Operating Systems homework",
            description="Solve 3 scheduling exercises from chapter 5",
            category=Category.study,
            priority=Priority.high,
            status=Status.todo,
            estimated_minutes=90,
            energy_required=EnergyLevel.high,
        ),
        Task(
            title="Review pull request for team project",
            description="Check the auth module changes",
            category=Category.work,
            priority=Priority.medium,
            status=Status.in_progress,
            estimated_minutes=30,
            energy_required=EnergyLevel.medium,
        ),
        Task(
            title="Read ML paper on attention mechanisms",
            category=Category.study,
            priority=Priority.low,
            status=Status.todo,
            estimated_minutes=60,
            energy_required=EnergyLevel.medium,
        ),
        Task(
            title="Gym session",
            category=Category.personal,
            priority=Priority.medium,
            status=Status.todo,
            estimated_minutes=60,
            energy_required=EnergyLevel.high,
        ),
        Task(
            title="Watch lecture recording",
            description="Missed session 4",
            category=Category.study,
            priority=Priority.high,
            status=Status.done,
            estimated_minutes=75,
            energy_required=EnergyLevel.low,
        ),
    ]
    for task in tasks:
        db.add(task)
    db.commit()
    print(f"Seeded {len(tasks)} tasks.")


def seed_preferences(db: Session) -> None:
    existing = db.exec(select(UserPreferences)).all()
    if existing:
        print(f"UserPreferences already has {len(existing)} rows — skipping.")
        return

    prefs = UserPreferences(
        display_name="Student",
        age=22,
        work_start_hour=9,
        work_end_hour=18,
        preferred_study_hours_per_day=5,
        preferred_break_minutes=15,
        peak_focus_time=PeakFocusTime.morning,
    )
    db.add(prefs)
    db.commit()
    print("Seeded 1 UserPreferences record.")


def main() -> None:
    create_db_and_tables()
    with Session(engine) as db:
        seed_tasks(db)
        seed_preferences(db)
    print("Done.")


if __name__ == "__main__":
    main()
