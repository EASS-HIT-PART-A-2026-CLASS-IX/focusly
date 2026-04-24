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


def test_create_task(client: TestClient, auth_headers: dict):
    response = client.post("/tasks", json=TASK_PAYLOAD, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == TASK_PAYLOAD["title"]
    assert data["category"] == "study"
    assert data["priority"] == "high"
    assert "id" in data
    assert "created_at" in data


def test_list_tasks(client: TestClient, auth_headers: dict):
    client.post("/tasks", json=TASK_PAYLOAD, headers=auth_headers)
    client.post("/tasks", json={**TASK_PAYLOAD, "title": "Read ML paper"}, headers=auth_headers)

    response = client.get("/tasks", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_task(client: TestClient, auth_headers: dict):
    created = client.post("/tasks", json=TASK_PAYLOAD, headers=auth_headers).json()
    task_id = created["id"]

    response = client.get(f"/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == task_id


def test_get_task_not_found(client: TestClient, auth_headers: dict):
    response = client.get("/tasks/9999", headers=auth_headers)
    assert response.status_code == 404


def test_update_task(client: TestClient, auth_headers: dict):
    created = client.post("/tasks", json=TASK_PAYLOAD, headers=auth_headers).json()
    task_id = created["id"]

    response = client.put(f"/tasks/{task_id}", json={"status": "done", "priority": "low"}, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "done"
    assert data["priority"] == "low"
    assert data["title"] == TASK_PAYLOAD["title"]


def test_delete_task(client: TestClient, auth_headers: dict):
    created = client.post("/tasks", json=TASK_PAYLOAD, headers=auth_headers).json()
    task_id = created["id"]

    response = client.delete(f"/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 204

    response = client.get(f"/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 404


def test_filter_by_status(client: TestClient, auth_headers: dict):
    client.post("/tasks", json={**TASK_PAYLOAD, "status": "todo"}, headers=auth_headers)
    client.post("/tasks", json={**TASK_PAYLOAD, "title": "Another task", "status": "done"}, headers=auth_headers)

    response = client.get("/tasks?status=todo", headers=auth_headers)
    assert response.status_code == 200
    results = response.json()
    assert all(t["status"] == "todo" for t in results)
    assert len(results) == 1


def test_filter_by_category(client: TestClient, auth_headers: dict):
    client.post("/tasks", json={**TASK_PAYLOAD, "category": "study"}, headers=auth_headers)
    client.post("/tasks", json={**TASK_PAYLOAD, "title": "Fix bug", "category": "work"}, headers=auth_headers)

    response = client.get("/tasks?category=study", headers=auth_headers)
    assert response.status_code == 200
    results = response.json()
    assert all(t["category"] == "study" for t in results)
    assert len(results) == 1


def test_filter_by_priority(client: TestClient, auth_headers: dict):
    client.post("/tasks", json={**TASK_PAYLOAD, "priority": "high"}, headers=auth_headers)
    client.post("/tasks", json={**TASK_PAYLOAD, "title": "Low task", "priority": "low"}, headers=auth_headers)

    response = client.get("/tasks?priority=high", headers=auth_headers)
    assert response.status_code == 200
    results = response.json()
    assert all(t["priority"] == "high" for t in results)
    assert len(results) == 1


def test_invalid_create_task_missing_title(client: TestClient, auth_headers: dict):
    payload = {k: v for k, v in TASK_PAYLOAD.items() if k != "title"}
    response = client.post("/tasks", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_invalid_create_task_blank_title(client: TestClient, auth_headers: dict):
    response = client.post("/tasks", json={**TASK_PAYLOAD, "title": "   "}, headers=auth_headers)
    assert response.status_code == 422


def test_invalid_estimated_minutes(client: TestClient, auth_headers: dict):
    response = client.post("/tasks", json={**TASK_PAYLOAD, "estimated_minutes": 0}, headers=auth_headers)
    assert response.status_code == 422
