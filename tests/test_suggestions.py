"""
Tests for GET /suggestions — AI task suggestion endpoint.
Mocks the Gemma API call to avoid requiring a real API key.
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


TASK_PAYLOAD = {
    "title": "Finish OS homework",
    "category": "study",
    "priority": "high",
    "status": "todo",
    "energy_required": "high",
    "estimated_minutes": 90,
}

MOCK_GEMMA_RESPONSE = """{
  "suggestions": [
    {
      "task_id": 1,
      "title": "Finish OS homework",
      "emoji": "💻",
      "reason": "Knock it out now and enjoy guilt-free evenings!",
      "estimated_minutes": 90
    }
  ]
}"""


def make_mock_genai(text: str):
    mock_response = MagicMock()
    mock_response.text = text
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response
    mock_genai = MagicMock()
    mock_genai.Client.return_value = mock_client
    return mock_genai


def test_suggestions_returns_list(client: TestClient):
    client.post("/tasks", json=TASK_PAYLOAD)

    with patch("app.routers.suggestions.GOOGLE_API_KEY", "fake-key"), \
         patch("app.routers.suggestions.genai", make_mock_genai(MOCK_GEMMA_RESPONSE)):
        response = client.get("/suggestions")

    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data
    assert len(data["suggestions"]) == 1
    assert data["suggestions"][0]["emoji"] == "💻"
    assert data["suggestions"][0]["estimated_minutes"] == 90


def test_suggestions_empty_when_no_tasks(client: TestClient):
    with patch("app.routers.suggestions.GOOGLE_API_KEY", "fake-key"):
        response = client.get("/suggestions")

    assert response.status_code == 200
    assert response.json()["suggestions"] == []


def test_suggestions_503_when_no_api_key(client: TestClient):
    with patch("app.routers.suggestions.GOOGLE_API_KEY", ""):
        response = client.get("/suggestions")

    assert response.status_code == 503
