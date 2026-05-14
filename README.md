# Focusly – Smart Daily Planner for Students

Focusly is a smart task management app for students — track study, work, leisure, and personal tasks, manage your schedule preferences, and get AI-powered focus suggestions.

**EX1** delivers the FastAPI backend with SQLite persistence, full CRUD for tasks and user preferences, task filtering, and a test suite.

**EX2** adds a React + TypeScript frontend — a modern single-page app with a dark sidebar, dashboard overview, full task management (create, edit, delete, filter), and a preferences profile page.

**EX3** integrates everything into a local multi-service Docker Compose stack: JWT authentication with bcrypt passwords, PostgreSQL database, an async overdue-task worker with Redis idempotency, and an AI-powered "Today's Focus" feature powered by Google Gemma.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Python 3.12 |
| Backend framework | FastAPI |
| ORM | SQLModel |
| Database | PostgreSQL 16 |
| Tests | pytest + httpx (in-memory SQLite) |
| Package manager | uv |
| Frontend | React 18 + TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| Containerisation | Docker + Docker Compose |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| AI | Google Gemma via google-genai SDK |
| Async worker | anyio + Redis |

---

## Requirements

- Docker Desktop (includes Docker Compose)
- A Google API key (for AI suggestions) — get one at https://aistudio.google.com

---

## Setup

```bash
# 1. Copy the example env file and set your Google API key
cp .env.example .env
# Edit .env and fill in GOOGLE_API_KEY
```

---

## Run the App

```bash
docker compose up --build
```

This starts five services:

| Service    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost           |
| API        | http://localhost:8000      |
| API docs   | http://localhost:8000/docs |
| AI service | http://localhost:8001      |

> First run takes longer — Docker builds all images. Subsequent runs use the cache.

To run in the background:
```bash
docker compose up --build -d
```

To stop:
```bash
docker compose down
```

---

## Run Tests

Tests use an in-memory SQLite database — no Docker needed:

```bash
uv run pytest -v
```

---

## Seed the Database

```bash
docker compose exec api bash -c "cd /app && PYTHONPATH=/app uv run python scripts/seed.py"
```

Populates the database with 5 sample tasks and 1 user preferences record.
The script is idempotent — running it twice will not duplicate data.

---

## Demo Script

Walks through health checks → register/login → seed → create task → AI suggestions → JWT auth → worker logs:

```bash
bash scripts/demo.sh
```

---

## Endpoints

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Check if the API is running |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/token` | No | Login — returns JWT token |

### Tasks

All task endpoints require a valid JWT (`Authorization: Bearer <token>`).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | List your tasks (supports filtering) |
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

All preferences endpoints require a valid JWT.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/preferences` | List your preferences |
| GET | `/preferences/{id}` | Get preferences by ID |
| POST | `/preferences` | Create preferences |
| PUT | `/preferences/{id}` | Update preferences |
| DELETE | `/preferences/{id}` | Delete preferences |

### Suggestions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/suggestions` | Yes | AI-powered task focus suggestions (Gemma) |

---

## Example Requests

### Register and login

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "secret123", "role": "user"}'

TOKEN=$(curl -s -X POST http://localhost:8000/auth/token \
  -d "username=alice&password=secret123" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
```

### Create a task

```bash
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
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
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/tasks?status=todo&priority=high"
```

### Get AI suggestions

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/suggestions
```

---

## Project Structure

```
focusly/
├── app/
│   ├── main.py          # FastAPI app, router registration, lifespan, CORS
│   ├── db.py            # Database engine (PostgreSQL in Docker, SQLite for tests)
│   ├── models.py        # SQLModel database models + enums (Task, User, UserPreferences)
│   ├── schemas.py       # Pydantic request/response schemas with validation
│   ├── repositories.py  # Database access functions
│   ├── services.py      # Business logic layer
│   └── routers/
│       ├── auth.py         # /auth/register and /auth/token
│       ├── tasks.py        # /tasks endpoints (JWT protected)
│       ├── preferences.py  # /preferences endpoints (JWT protected)
│       └── suggestions.py  # /suggestions endpoint (JWT protected)
├── ai_service/
│   └── main.py          # Standalone FastAPI service — calls Google Gemma
├── frontend/
│   ├── src/
│   │   ├── api/            # API client + endpoint functions
│   │   ├── components/     # UI components (layout, tasks, dashboard, auth, common)
│   │   ├── context/        # AuthContext (JWT token + login/logout)
│   │   ├── hooks/          # useTasks, usePreferences
│   │   ├── pages/          # Dashboard, Tasks, Preferences, Login, Register
│   │   ├── types/          # TypeScript interfaces mirroring backend schemas
│   │   └── utils/          # formatters (date, time, duration)
│   ├── index.html
│   └── vite.config.ts      # Proxies /api → http://localhost:8000
├── scripts/
│   ├── seed.py          # Sample data seed script
│   ├── refresh.py       # Async background worker (overdue task detector)
│   └── demo.sh          # End-to-end demo walkthrough
├── tests/
│   ├── conftest.py      # Test fixtures (in-memory SQLite, TestClient, auth_headers)
│   ├── test_tasks.py    # Task CRUD + filtering + auth tests
│   ├── test_preferences.py  # Preferences CRUD + validation tests
│   ├── test_auth.py     # JWT auth, ownership enforcement tests
│   └── test_suggestions.py  # AI suggestions endpoint tests
├── docs/
│   ├── EX3-notes.md     # Architecture overview, security baseline, worker trace
│   └── runbooks/
│       └── compose.md   # Docker Compose runbook
├── compose.yaml         # All five services: api, ai_service, postgres, redis, frontend
├── Dockerfile           # API + worker image
├── .env.example         # Environment variable template
├── pyproject.toml
└── README.md
```

---

## AI Assistance

This project was developed with assistance from Claude (Anthropic).

**How AI was used:**
- Bouncing ideas on project structure and design decisions
- Getting feedback on validation logic and edge cases
- Clarifying FastAPI, SQLModel, and React patterns during development
- Designing the UI layout (sidebar, dashboard, task cards, filter bar, preferences form)
- Architecting the EX3 multi-service stack (Docker Compose, async worker, JWT auth, AI microservice, PostgreSQL migration)

**How outputs were verified:**
- All code was reviewed and understood before being included
- Backend tests run with `uv run pytest -v` (all passing, use in-memory SQLite)
- Endpoints manually tested via Swagger UI at `http://localhost:8000/docs`
- Full stack verified end-to-end with `bash scripts/demo.sh`
