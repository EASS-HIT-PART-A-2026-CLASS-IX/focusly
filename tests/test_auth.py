"""
Tests for the security baseline:
- Register + login flow
- JWT-protected DELETE requires admin role
- Expired token → 401
- Missing/wrong role → 403
"""

from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from app.auth import create_access_token


def register_and_login(client: TestClient, username: str, password: str, role: str = "user") -> str:
    client.post("/auth/register", json={"username": username, "password": password, "role": role})
    response = client.post("/auth/token", data={"username": username, "password": password})
    return response.json()["access_token"]


def create_task_payload():
    return {
        "title": "Test task",
        "category": "study",
        "priority": "low",
        "status": "todo",
        "energy_required": "low",
    }


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


# ── Protected DELETE ──────────────────────────────────────────────────────────

def test_delete_task_requires_auth(client: TestClient):
    """DELETE without token → 401."""
    task = client.post("/tasks", json=create_task_payload()).json()
    response = client.delete(f"/tasks/{task['id']}")
    assert response.status_code == 401


def test_delete_task_requires_admin_role(client: TestClient):
    """DELETE with user role → 403."""
    token = register_and_login(client, "charlie", "pass123", role="user")
    task = client.post("/tasks", json=create_task_payload()).json()
    response = client.delete(
        f"/tasks/{task['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_delete_task_as_admin(client: TestClient):
    """DELETE with admin role → 204."""
    token = register_and_login(client, "dave", "pass123", role="admin")
    task = client.post("/tasks", json=create_task_payload()).json()
    response = client.delete(
        f"/tasks/{task['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 204


def test_expired_token(client: TestClient):
    """Expired token → 401."""
    token = create_access_token({"sub": "dave"}, expires_delta=timedelta(seconds=-1))
    task = client.post("/tasks", json=create_task_payload()).json()
    response = client.delete(
        f"/tasks/{task['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 401
