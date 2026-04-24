"""
Tests for the security baseline:
- Register + login flow
- JWT-protected routes require a valid token
- Expired token → 401
- Any authenticated user can delete their own task
"""

from datetime import timedelta

from fastapi.testclient import TestClient

from app.auth import create_access_token


TASK_PAYLOAD = {
    "title": "Test task",
    "category": "study",
    "priority": "low",
    "status": "todo",
    "energy_required": "low",
}


def register_and_login(client: TestClient, username: str, password: str, role: str = "user") -> str:
    client.post("/auth/register", json={"username": username, "password": password, "role": role})
    response = client.post("/auth/token", data={"username": username, "password": password})
    return response.json()["access_token"]


# ── Auth flow ─────────────────────────────────────────────────────────────────

def test_register_and_login(client: TestClient):
    response = client.post(
        "/auth/register",
        json={"username": "alice", "password": "secret123", "role": "user"},
    )
    assert response.status_code == 201
    assert response.json()["username"] == "alice"

    response = client.post("/auth/token", data={"username": "alice", "password": "secret123"})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client: TestClient):
    client.post("/auth/register", json={"username": "bob", "password": "correct", "role": "user"})
    response = client.post("/auth/token", data={"username": "bob", "password": "wrong"})
    assert response.status_code == 401


# ── Protected routes ──────────────────────────────────────────────────────────

def test_tasks_require_auth(client: TestClient):
    """GET /tasks without token → 401."""
    response = client.get("/tasks")
    assert response.status_code == 401


def test_create_task_requires_auth(client: TestClient):
    """POST /tasks without token → 401."""
    response = client.post("/tasks", json=TASK_PAYLOAD)
    assert response.status_code == 401


def test_delete_task_requires_auth(client: TestClient):
    """DELETE without token → 401."""
    token = register_and_login(client, "alice", "pass123")
    headers = {"Authorization": f"Bearer {token}"}
    task = client.post("/tasks", json=TASK_PAYLOAD, headers=headers).json()

    response = client.delete(f"/tasks/{task['id']}")
    assert response.status_code == 401


def test_authenticated_user_can_delete_own_task(client: TestClient):
    """Any authenticated user can delete their own task → 204."""
    token = register_and_login(client, "charlie", "pass123", role="user")
    headers = {"Authorization": f"Bearer {token}"}
    task = client.post("/tasks", json=TASK_PAYLOAD, headers=headers).json()

    response = client.delete(f"/tasks/{task['id']}", headers=headers)
    assert response.status_code == 204


def test_user_cannot_delete_another_users_task(client: TestClient):
    """User cannot delete a task belonging to a different user → 404."""
    token_a = register_and_login(client, "alice", "pass123")
    token_b = register_and_login(client, "bob", "pass456")

    task = client.post("/tasks", json=TASK_PAYLOAD, headers={"Authorization": f"Bearer {token_a}"}).json()

    response = client.delete(
        f"/tasks/{task['id']}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 404


def test_expired_token(client: TestClient):
    """Expired token → 401."""
    token = register_and_login(client, "dave", "pass123")
    headers = {"Authorization": f"Bearer {token}"}
    task = client.post("/tasks", json=TASK_PAYLOAD, headers=headers).json()

    expired = create_access_token({"sub": "dave"}, expires_delta=timedelta(seconds=-1))
    response = client.delete(
        f"/tasks/{task['id']}",
        headers={"Authorization": f"Bearer {expired}"},
    )
    assert response.status_code == 401
