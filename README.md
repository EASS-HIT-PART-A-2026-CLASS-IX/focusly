# Focusly – Smart Daily Planner for Students

Focusly is a smart task management app for students — track study, work, leisure, and personal tasks, manage your schedule preferences, and stay on top of your workload.

**EX1** delivers the FastAPI backend with SQLite persistence, full CRUD for tasks and user preferences, task filtering, and a test suite.

**EX2** adds a React + TypeScript frontend — a modern single-page app with a dark sidebar, dashboard overview, full task management (create, edit, delete, filter), and a preferences profile page.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Python 3.12 |
| Backend framework | FastAPI |
| ORM | SQLModel |
| Database | SQLite |
| Tests | pytest + httpx |
| Package manager | uv |
| Frontend | React 18 + TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |

---

## Requirements

- Python 3.12+
- uv (package manager)
- Node.js 18+ and npm (for the frontend)

---

## Setup

```bash
# 1. Install uv (if not already installed)
#    https://docs.astral.sh/uv/getting-started/installation/
#    Windows (PowerShell): powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 2. Install backend dependencies
uv sync --extra dev

# 3. Install frontend dependencies
cd frontend && npm install
```

---

## Run the App

**Backend** (runs on port 8000):
```bash
uv run uvicorn app.main:app --reload
```

API available at `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

**Frontend** (runs on port 5173):
```bash
cd frontend && npm run dev
```

Open `http://localhost:5173` in your browser.
> Both backend and frontend must be running at the same time.

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
│   ├── main.py          # FastAPI app, router registration, lifespan, CORS
│   ├── db.py            # SQLite engine and session
│   ├── models.py        # SQLModel database models + enums
│   ├── schemas.py       # Pydantic request/response schemas with validation
│   ├── repositories.py  # Database access functions
│   ├── services.py      # Business logic layer
│   └── routers/
│       ├── tasks.py        # /tasks endpoints
│       └── preferences.py  # /preferences endpoints
├── frontend/
│   ├── src/
│   │   ├── api/            # API client + endpoint functions
│   │   ├── components/     # UI components (layout, tasks, dashboard, common)
│   │   ├── hooks/          # useTasks, usePreferences
│   │   ├── pages/          # DashboardPage, TasksPage, PreferencesPage
│   │   ├── types/          # TypeScript interfaces mirroring backend schemas
│   │   └── utils/          # formatters (date, time, duration)
│   ├── index.html
│   └── vite.config.ts      # Proxies /api → http://localhost:8000
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
- Designing the UI layout (sidebar, dashboard, task cards, filter bar, preferences form)

**How outputs were verified:**
- All code was reviewed and understood before being included
- Tests were run locally with `uv run pytest -v` to confirm everything passes
- Endpoints were manually tested via the Swagger UI at `/docs`
- Frontend unit tests run with `npm run test` (21 tests passing)
