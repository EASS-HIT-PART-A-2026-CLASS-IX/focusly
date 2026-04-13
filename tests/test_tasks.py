from fastapi.testclient import TestClient


TASK_PAYLOAD = {
    "title": "Study for OS exam",
    "description": "Review chapters 4-6",
    "category": "study",
    "priority": "high",
    "status": "todo",
    "estimated_minutes": 90,
    "energy_required": "high",
}


def test_create_task(client: TestClient):
    response = client.post("/tasks", json=TASK_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == TASK_PAYLOAD["title"]
    assert data["category"] == "study"
    assert data["priority"] == "high"
    assert "id" in data
    assert "created_at" in data


def test_list_tasks(client: TestClient):
    client.post("/tasks", json=TASK_PAYLOAD)
    client.post("/tasks", json={**TASK_PAYLOAD, "title": "Read ML paper"})

    response = client.get("/tasks")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_task(client: TestClient):
    created = client.post("/tasks", json=TASK_PAYLOAD).json()
    task_id = created["id"]

    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["id"] == task_id


def test_get_task_not_found(client: TestClient):
    response = client.get("/tasks/9999")
    assert response.status_code == 404


def test_update_task(client: TestClient):
    created = client.post("/tasks", json=TASK_PAYLOAD).json()
    task_id = created["id"]

    response = client.put(f"/tasks/{task_id}", json={"status": "done", "priority": "low"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "done"
    assert data["priority"] == "low"
    assert data["title"] == TASK_PAYLOAD["title"]


def test_delete_task(client: TestClient):
    client.post("/auth/register", json={"username": "admin", "password": "admin123", "role": "admin"})
    token = client.post("/auth/token", data={"username": "admin", "password": "admin123"}).json()["access_token"]

    created = client.post("/tasks", json=TASK_PAYLOAD).json()
    task_id = created["id"]

    response = client.delete(f"/tasks/{task_id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 204

    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == 404


def test_filter_by_status(client: TestClient):
    client.post("/tasks", json={**TASK_PAYLOAD, "status": "todo"})
    client.post("/tasks", json={**TASK_PAYLOAD, "title": "Another task", "status": "done"})

    response = client.get("/tasks?status=todo")
    assert response.status_code == 200
    results = response.json()
    assert all(t["status"] == "todo" for t in results)
    assert len(results) == 1


def test_filter_by_category(client: TestClient):
    client.post("/tasks", json={**TASK_PAYLOAD, "category": "study"})
    client.post("/tasks", json={**TASK_PAYLOAD, "title": "Fix bug", "category": "work"})

    response = client.get("/tasks?category=study")
    assert response.status_code == 200
    results = response.json()
    assert all(t["category"] == "study" for t in results)
    assert len(results) == 1


def test_filter_by_priority(client: TestClient):
    client.post("/tasks", json={**TASK_PAYLOAD, "priority": "high"})
    client.post("/tasks", json={**TASK_PAYLOAD, "title": "Low task", "priority": "low"})

    response = client.get("/tasks?priority=high")
    assert response.status_code == 200
    results = response.json()
    assert all(t["priority"] == "high" for t in results)
    assert len(results) == 1


def test_invalid_create_task_missing_title(client: TestClient):
    payload = {k: v for k, v in TASK_PAYLOAD.items() if k != "title"}
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422


def test_invalid_create_task_blank_title(client: TestClient):
    response = client.post("/tasks", json={**TASK_PAYLOAD, "title": "   "})
    assert response.status_code == 422


def test_invalid_estimated_minutes(client: TestClient):
    response = client.post("/tasks", json={**TASK_PAYLOAD, "estimated_minutes": 0})
    assert response.status_code == 422
