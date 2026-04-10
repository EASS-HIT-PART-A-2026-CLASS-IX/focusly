# Focusly – Smart Daily Planner for Students

Focusly is a lightweight task management backend for students.
It helps manage study, work, leisure, and personal tasks while storing user preferences for smarter planning in future exercises.

**EX1** delivers the FastAPI backend with SQLite persistence, full CRUD for tasks and user preferences, task filtering, and a test suite.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Python 3.12 |
| Framework | FastAPI |
| ORM | SQLModel |
| Database | SQLite |
| Tests | pytest + httpx |
| Package manager | uv |

---

## Requirements

- Python 3.12+
- uv (package manager)

---

## Setup

```bash
# 1. Install uv (if not already installed)
#    https://docs.astral.sh/uv/getting-started/installation/
#    Windows (PowerShell): powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 2. Create the virtual environment and install all dependencies
uv sync --extra dev
```

---

## Run the API

```bash
uv run uvicorn app.main:app --reload
```

API available at `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

---

## Run Tests

```bash
uv run pytest -v
```

---

## Seed the Database

```bash
uv run python scripts/seed.py
```

Populates the database with 5 sample tasks and 1 user preferences record.
The script is idempotent — running it twice will not duplicate data.

---

## Endpoints

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Check if the API is running |

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | List tasks (supports filtering) |
| GET | `/tasks/{id}` | Get task by ID |
| POST | `/tasks` | Create task |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |

**Task filtering query parameters:**

| Parameter | Values |
|-----------|--------|
| `status` | `todo`, `in_progress`, `done` |
| `category` | `study`, `work`, `leisure`, `personal` |
| `priority` | `low`, `medium`, `high` |

Example: `GET /tasks?status=todo&priority=high`

### Preferences

| Method | Path | Description |
|--------|------|-------------|
| GET | `/preferences` | List all preferences |
| GET | `/preferences/{id}` | Get preferences by ID |
| POST | `/preferences` | Create preferences |
| PUT | `/preferences/{id}` | Update preferences |
| DELETE | `/preferences/{id}` | Delete preferences |

---

## Example Requests

### Create a task

```bash
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Finish OS homework",
    "description": "Solve scheduling exercises",
    "category": "study",
    "priority": "high",
    "status": "todo",
    "estimated_minutes": 90,
    "energy_required": "high"
  }'
```

### Filter tasks

```bash
curl "http://localhost:8000/tasks?status=todo&priority=high"
```

### Create user preferences

```bash
curl -X POST http://localhost:8000/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "Alice",
    "age": 22,
    "work_start_hour": 9,
    "work_end_hour": 18,
    "preferred_study_hours_per_day": 5,
    "preferred_break_minutes": 15,
    "peak_focus_time": "morning"
  }'
```

---

## Project Structure

```
focusly/
├── app/
│   ├── main.py          # FastAPI app, router registration, lifespan
│   ├── db.py            # SQLite engine and session
│   ├── models.py        # SQLModel database models + enums
│   ├── schemas.py       # Pydantic request/response schemas with validation
│   ├── repositories.py  # Database access functions
│   ├── services.py      # Business logic layer
│   └── routers/
│       ├── tasks.py     # /tasks endpoints
│       └── preferences.py  # /preferences endpoints
├── tests/
│   ├── conftest.py      # Test fixtures (in-memory SQLite, TestClient)
│   ├── test_tasks.py    # Task CRUD + filtering tests
│   └── test_preferences.py  # Preferences CRUD + validation tests
├── scripts/
│   └── seed.py          # Sample data seed script
├── pyproject.toml
└── README.md
```

---

## AI Assistance

This project was developed with assistance from Claude (Anthropic).

**How AI was used:**
- Bouncing ideas on project structure and design decisions
- Getting feedback on validation rules and edge cases
- Clarifying FastAPI and SQLModel patterns during development

**How outputs were verified:**
- All code was reviewed and understood before being included
- Tests were run locally with `uv run pytest -v` to confirm everything passes
- Endpoints were manually tested via the Swagger UI at `/docs`
