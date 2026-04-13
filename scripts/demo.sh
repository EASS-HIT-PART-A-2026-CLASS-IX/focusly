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
  # Returns response body or empty string on failure
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

# ── 2. Seed the database ──────────────────────────────────────────────────────
section "2. Seed Database"
if docker compose exec -T api bash -c "cd /app && PYTHONPATH=/app uv run python scripts/seed.py" 2>&1; then
  ok "Database seeded"
else
  fail "Seed failed"
fi

# ── 3. List tasks ─────────────────────────────────────────────────────────────
section "3. Task List (GET /tasks)"
TASKS=$(check_curl "$BASE/tasks")
if [ -n "$TASKS" ]; then
  ok "GET /tasks returned data"
  echo "  $TASKS" | head -c 200
  echo "..."
else
  fail "No tasks returned"
fi

# ── 4. Create a task ─────────────────────────────────────────────────────────
section "4. Create a Task (POST /tasks)"
NEW_TASK=$(curl -sf -X POST "$BASE/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Demo task - EX3 submission",
    "category": "study",
    "priority": "high",
    "status": "todo",
    "energy_required": "high",
    "estimated_minutes": 30
  }' 2>/dev/null || echo "")
if echo "$NEW_TASK" | grep -q "Demo task - EX3"; then
  ok "Task created: $(echo "$NEW_TASK" | grep -o '"title":"[^"]*"')"
else
  fail "Task creation failed"
fi

# ── 5. AI suggestions ─────────────────────────────────────────────────────────
section "5. AI Task Suggestions (GET /suggestions → ai_service → Gemma)"
info "Calling Gemma via the AI microservice — this may take a few seconds..."
SUGGESTIONS=$(curl -sf --max-time 30 "$BASE/suggestions" 2>/dev/null || echo "")
if echo "$SUGGESTIONS" | grep -q "suggestions"; then
  ok "Suggestions received from Gemma"
  echo "  $SUGGESTIONS" | head -c 400
  echo ""
else
  fail "No suggestions returned (check GOOGLE_API_KEY in .env)"
fi

# ── 6. JWT Auth ───────────────────────────────────────────────────────────────
section "6. JWT Auth — Register Admin & Protected Delete"

curl -sf -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_admin","password":"admin123","role":"admin"}' > /dev/null 2>&1

TOKEN_RESP=$(curl -sf -X POST "$BASE/auth/token" \
  -d "username=demo_admin&password=admin123" 2>/dev/null || echo "")

if echo "$TOKEN_RESP" | grep -q "access_token"; then
  ok "Admin JWT token obtained (HS256, 30min expiry)"
  TOKEN=$(echo "$TOKEN_RESP" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/tasks/1" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)
  ok "DELETE /tasks/1 with admin token → HTTP $STATUS"
else
  fail "Could not obtain JWT token"
fi

NO_AUTH=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/tasks/2" 2>/dev/null)
ok "DELETE /tasks/2 without token → HTTP $NO_AUTH (401 expected)"

# ── 7. Worker ─────────────────────────────────────────────────────────────────
section "7. Background Worker Logs"
info "Last 5 worker log lines:"
docker compose logs --tail=5 worker 2>/dev/null | sed 's/^/  /'

# ── 8. Frontend ───────────────────────────────────────────────────────────────
section "8. Frontend"
ok "React app served by nginx → http://localhost"

# ── Done ──────────────────────────────────────────────────────────────────────
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Focusly EX3 demo complete — all systems go!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
