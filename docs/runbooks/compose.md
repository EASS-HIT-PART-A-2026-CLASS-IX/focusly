# Compose Runbook

## Start the full stack

```bash
docker compose up --build
```

This starts four services:
| Service  | URL                        | Description              |
|----------|----------------------------|--------------------------|
| api      | http://localhost:8000      | FastAPI backend          |
| redis    | localhost:6379             | Redis (worker store)     |
| worker   | —                          | Background task worker   |
| frontend | http://localhost           | React app (nginx)        |

> First run takes longer — Docker builds all images. Subsequent runs use the cache.

---

## Verify each service is healthy

**API:**
```bash
curl http://localhost:8000/health
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

## Seed the database

```bash
docker compose exec api uv run python scripts/seed.py
```

---

## Run backend tests against the running stack

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
docker compose up --build frontend
```
