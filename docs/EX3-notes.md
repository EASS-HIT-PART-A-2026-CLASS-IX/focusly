# EX3 Notes

## Architecture Overview

Focusly EX3 is a local multi-service stack with five cooperating processes:

| Service    | Technology          | Role                                        |
|------------|---------------------|---------------------------------------------|
| api        | FastAPI + SQLModel  | REST backend, business logic, auth          |
| ai_service | FastAPI + Gemma     | Dedicated LLM microservice (task suggestions) |
| redis      | Redis 7             | Worker idempotency store                    |
| worker     | Python + anyio      | Background overdue-task detection           |
| frontend   | React + nginx       | Single-page app served as static files      |

All services are orchestrated via `compose.yaml` and run locally with `docker compose up --build`.

### Request flow for AI suggestions
```
browser → frontend (nginx) → api (GET /suggestions)
                                  → ai_service (POST /suggest)
                                        → Google Gemma API
```

The main API never calls Gemma directly — it delegates to `ai_service`,
which is the only service that holds the `GOOGLE_API_KEY`.

---

## Security Baseline

### Password hashing
User passwords are hashed with **bcrypt** via `passlib`. Plain-text passwords are never stored or logged.

### JWT authentication
- Algorithm: **HS256**
- Expiry: **30 minutes**
- Secret key loaded from the `SECRET_KEY` environment variable (defaults to a dev placeholder — must be changed in any real deployment)
- Protected route: `DELETE /tasks/{id}` — requires a valid JWT with `role: admin`

### Role-based access control
Two roles: `admin` and `user`.  
Only `admin` tokens can delete tasks. All other endpoints are public.

### JWT rotation steps
To rotate the secret key (e.g. after a suspected compromise):

1. Generate a new secret:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
2. Update `SECRET_KEY` in your environment / `.env` file
3. Restart the API container:
   ```bash
   docker compose restart api
   ```
4. All existing tokens are immediately invalidated — users must log in again via `POST /auth/token`

> Note: for zero-downtime rotation in production, support two active keys temporarily (old + new) before removing the old one. Out of scope for this local project.

---

## Async Worker — Redis Trace (Session 09)

The worker (`scripts/refresh.py`) runs every 30 seconds, finds overdue tasks, and records each processed task ID in Redis with a 24-hour TTL.

### Sample log output (worker detecting an overdue task)

```
2026-04-14 10:00:00 [refresh] Found 1 overdue task(s). Processing...
2026-04-14 10:00:00 [refresh] Overdue task #3: 'Submit OS homework' (deadline: 2026-04-13, status: todo)
2026-04-14 10:00:30 [refresh] Skipping task 3 (already processed today).
```

### Redis idempotency key
```
Key:   processed:3
Value: 1
TTL:   86400 seconds (24 hours)
```

To inspect live in Redis:
```bash
docker compose exec redis redis-cli keys "processed:*"
docker compose exec redis redis-cli get "processed:3"
docker compose exec redis redis-cli ttl "processed:3"
```
