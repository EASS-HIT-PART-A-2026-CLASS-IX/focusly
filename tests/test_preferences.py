from fastapi.testclient import TestClient


PREFS_PAYLOAD = {
    "display_name": "Alice",
    "age": 22,
    "work_start_hour": 9,
    "work_end_hour": 17,
    "preferred_study_hours_per_day": 4,
    "preferred_break_minutes": 15,
    "peak_focus_time": "morning",
}


def test_create_preferences(client: TestClient, auth_headers: dict):
    response = client.post("/preferences", json=PREFS_PAYLOAD, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["display_name"] == "Alice"
    assert data["peak_focus_time"] == "morning"
    assert "id" in data


def test_list_preferences(client: TestClient, auth_headers: dict):
    client.post("/preferences", json=PREFS_PAYLOAD, headers=auth_headers)
    client.post("/preferences", json={**PREFS_PAYLOAD, "display_name": "Bob"}, headers=auth_headers)

    response = client.get("/preferences", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_preferences(client: TestClient, auth_headers: dict):
    created = client.post("/preferences", json=PREFS_PAYLOAD, headers=auth_headers).json()
    pref_id = created["id"]

    response = client.get(f"/preferences/{pref_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == pref_id


def test_get_preferences_not_found(client: TestClient, auth_headers: dict):
    response = client.get("/preferences/9999", headers=auth_headers)
    assert response.status_code == 404


def test_update_preferences(client: TestClient, auth_headers: dict):
    created = client.post("/preferences", json=PREFS_PAYLOAD, headers=auth_headers).json()
    pref_id = created["id"]

    response = client.put(f"/preferences/{pref_id}", json={"display_name": "Alice Updated", "age": 23}, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "Alice Updated"
    assert data["age"] == 23
    assert data["peak_focus_time"] == "morning"


def test_delete_preferences(client: TestClient, auth_headers: dict):
    created = client.post("/preferences", json=PREFS_PAYLOAD, headers=auth_headers).json()
    pref_id = created["id"]

    response = client.delete(f"/preferences/{pref_id}", headers=auth_headers)
    assert response.status_code == 204

    response = client.get(f"/preferences/{pref_id}", headers=auth_headers)
    assert response.status_code == 404


def test_invalid_hour_range(client: TestClient, auth_headers: dict):
    response = client.post("/preferences", json={**PREFS_PAYLOAD, "work_start_hour": 17, "work_end_hour": 9}, headers=auth_headers)
    assert response.status_code == 422


def test_equal_hour_range(client: TestClient, auth_headers: dict):
    response = client.post("/preferences", json={**PREFS_PAYLOAD, "work_start_hour": 9, "work_end_hour": 9}, headers=auth_headers)
    assert response.status_code == 422


def test_invalid_age(client: TestClient, auth_headers: dict):
    response = client.post("/preferences", json={**PREFS_PAYLOAD, "age": 0}, headers=auth_headers)
    assert response.status_code == 422


def test_invalid_break_minutes(client: TestClient, auth_headers: dict):
    response = client.post("/preferences", json={**PREFS_PAYLOAD, "preferred_break_minutes": 3}, headers=auth_headers)
    assert response.status_code == 422


def test_invalid_study_hours(client: TestClient, auth_headers: dict):
    response = client.post("/preferences", json={**PREFS_PAYLOAD, "preferred_study_hours_per_day": 15}, headers=auth_headers)
    assert response.status_code == 422


def test_blank_display_name(client: TestClient, auth_headers: dict):
    response = client.post("/preferences", json={**PREFS_PAYLOAD, "display_name": "  "}, headers=auth_headers)
    assert response.status_code == 422
