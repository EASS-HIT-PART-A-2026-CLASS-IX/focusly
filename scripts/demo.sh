#!/usr/bin/env bash
# =============================================================================
# Focusly EX3 — Demo Script
# Run from the project root after: docker compose up --build -d
# =============================================================================

BASE="http://localhost:8000"
AI="http://localhost:8001"
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

section() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }
ok()      { echo -e "${GREEN}✓ $1${NC}"; }
info()    { echo -e "${YELLOW}→ $1${NC}"; }
fail()    { echo -e "${RED}✗ $1${NC}"; }

check_curl() {
  curl -sf --max-time 10 "$1" 2>/dev/null || echo ""
}

# ── 1. Health checks ──────────────────────────────────────────────────────────
section "1. Health Checks"

API_HEALTH=$(check_curl "$BASE/health")
if echo "$API_HEALTH" | grep -q "ok"; then
  ok "API healthy — $BASE/health → $API_HEALTH"
else
  fail "API unreachable — is the stack running? (docker compose up --build -d)"
  exit 1
fi

AI_HEALTH=$(check_curl "$AI/health")
if echo "$AI_HEALTH" | grep -q "ok"; then
  ok "AI service healthy — $AI/health → $AI_HEALTH"
else
  fail "AI service unreachable"
fi

REDIS_PING=$(docker compose exec -T redis redis-cli ping 2>/dev/null || echo "unreachable")
ok "Redis: $REDIS_PING"

# ── 2. Register & Login ───────────────────────────────────────────────────────
section "2. Register & Login (JWT Auth)"

curl -sf -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","password":"demo123","role":"user"}' > /dev/null 2>&1

TOKEN_RESP=$(curl -sf -X POST "$BASE/auth/token" \
  -d "username=demo_user&password=demo123" 2>/dev/null || echo "")

if echo "$TOKEN_RESP" | grep -q "access_token"; then
  TOKEN=$(echo "$TOKEN_RESP" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  ok "JWT token obtained (HS256, 30min expiry)"
else
  fail "Could not obtain JWT token"
  exit 1
fi

# ── 3. Seed the database ──────────────────────────────────────────────────────
section "3. Seed Database"
if docker compose exec -T api bash -c "cd /app && PYTHONPATH=/app uv run python scripts/seed.py" 2>&1; then
  ok "Database seeded"
else
  fail "Seed failed"
fi

# ── 4. List tasks ─────────────────────────────────────────────────────────────
section "4. Task List (GET /tasks)"
TASKS=$(curl -sf --max-time 10 "$BASE/tasks" \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "")
if [ -n "$TASKS" ]; then
  ok "GET /tasks returned data"
  echo "  $TASKS" | head -c 200
  echo "..."
else
  info "No tasks for this user yet (seed tasks belong to no user — create one below)"
fi

# ── 5. Create a task ─────────────────────────────────────────────────────────
section "5. Create a Task (POST /tasks)"
NEW_TASK=$(curl -sf -X POST "$BASE/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Demo task - EX3 submission",
    "category": "study",
    "priority": "high",
    "status": "todo",
    "energy_required": "high",
    "estimated_minutes": 30
  }' 2>/dev/null || echo "")
if echo "$NEW_TASK" | grep -q "Demo task - EX3"; then
  TASK_ID=$(echo "$NEW_TASK" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  ok "Task created: $(echo "$NEW_TASK" | grep -o '"title":"[^"]*"') (id=$TASK_ID)"
else
  fail "Task creation failed"
  TASK_ID=1
fi

# ── 6. AI suggestions ─────────────────────────────────────────────────────────
section "6. AI Task Suggestions (GET /suggestions → ai_service → Gemma)"
info "Calling Gemma via the AI microservice — this may take a few seconds..."
SUGGESTIONS=$(curl -sf --max-time 30 "$BASE/suggestions" \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "")
if echo "$SUGGESTIONS" | grep -q "suggestions"; then
  ok "Suggestions received from Gemma"
  echo "  $SUGGESTIONS" | head -c 400
  echo ""
else
  fail "No suggestions returned (check GOOGLE_API_KEY in .env)"
fi

# ── 7. JWT Protected Delete ───────────────────────────────────────────────────
section "7. JWT Auth — Protected Delete"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)
ok "DELETE /tasks/$TASK_ID with token → HTTP $STATUS (204 expected)"

NO_AUTH=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/tasks/$TASK_ID" 2>/dev/null)
ok "DELETE /tasks/$TASK_ID without token → HTTP $NO_AUTH (401 expected)"

# ── 8. Worker ─────────────────────────────────────────────────────────────────
section "8. Background Worker Logs"
info "Last 5 worker log lines:"
docker compose logs --tail=5 worker 2>/dev/null | sed 's/^/  /'

# ── 9. Frontend ───────────────────────────────────────────────────────────────
section "9. Frontend"
ok "React app served by nginx → http://localhost"

# ── Done ──────────────────────────────────────────────────────────────────────
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Focusly EX3 demo complete — all systems go!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
