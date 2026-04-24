"""
Tests for GET /suggestions.
Mocks the HTTP call to the AI microservice so no real service is needed.
"""

from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient


TASK_PAYLOAD = {
    "title": "Finish OS homework",
    "category": "study",
    "priority": "high",
    "status": "todo",
    "energy_required": "high",
    "estimated_minutes": 90,
}

MOCK_AI_RESPONSE = {
    "suggestions": [
        {
            "task_id": 1,
            "title": "Finish OS homework",
            "emoji": "💻",
            "reason": "Knock it out now and enjoy guilt-free evenings!",
            "estimated_minutes": 90,
        }
    ]
}


def mock_httpx_post(url, **kwargs):
    response = MagicMock()
    response.status_code = 200
    response.json.return_value = MOCK_AI_RESPONSE
    response.raise_for_status = MagicMock()
    return response


def test_suggestions_returns_list(client: TestClient, auth_headers: dict):
    client.post("/tasks", json=TASK_PAYLOAD, headers=auth_headers)

    with patch("app.routers.suggestions.httpx.post", side_effect=mock_httpx_post):
        response = client.get("/suggestions", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data
    assert len(data["suggestions"]) == 1
    assert data["suggestions"][0]["emoji"] == "💻"
    assert data["suggestions"][0]["estimated_minutes"] == 90


def test_suggestions_empty_when_no_tasks(client: TestClient, auth_headers: dict):
    response = client.get("/suggestions", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["suggestions"] == []


def test_suggestions_503_when_ai_service_unreachable(client: TestClient, auth_headers: dict):
    import httpx as real_httpx

    client.post("/tasks", json=TASK_PAYLOAD, headers=auth_headers)

    with patch("app.routers.suggestions.httpx.post",
               side_effect=real_httpx.RequestError("connection refused")):
        response = client.get("/suggestions", headers=auth_headers)

    assert response.status_code == 503
