# Compose Runbook

## Start the full stack

```bash
docker compose up --build
```

This starts five services:

| Service    | URL                        | Description                        |
|------------|----------------------------|------------------------------------|
| api        | http://localhost:8000      | FastAPI backend                    |
| ai_service | http://localhost:8001      | Gemma AI microservice              |
| redis      | localhost:6379             | Redis (worker idempotency store)   |
| worker     | —                          | Background overdue-task detector   |
| frontend   | http://localhost           | React app (nginx)                  |

> First run takes longer — Docker builds all images. Subsequent runs use the cache.

---

## Prerequisites

Create a `.env` file in the project root before starting:

```bash
cp .env.example .env
# then edit .env and set your GOOGLE_API_KEY
```

---

## Verify each service is healthy

**API:**
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

**AI service:**
```bash
curl http://localhost:8001/health
# Expected: {"status":"ok"}
```

**API docs (Swagger UI):**
```
http://localhost:8000/docs
```

**Frontend:**
```
http://localhost
```

**Redis:**
```bash
docker compose exec redis redis-cli ping
# Expected: PONG
```

**Worker logs:**
```bash
docker compose logs worker
```

---

## Run the demo script

```bash
bash scripts/demo.sh
```

Walks through: health checks → seed → create task → AI suggestions → JWT auth → worker logs → frontend.

---

## Seed the database

```bash
docker compose exec api uv run python scripts/seed.py
```

---

## Run backend tests

```bash
uv run pytest -v
```

---

## Stop the stack

```bash
docker compose down
```

To also delete the database volume:
```bash
docker compose down -v
```

---

## Rebuild a single service

```bash
docker compose up --build api
docker compose up --build ai_service
docker compose up --build frontend
```
