import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

import app.models  # noqa: F401 — ensures all tables are registered in metadata
from app.db import get_session
from app.main import app


@pytest.fixture(name="db")
def db_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(db: Session):
    def override_get_session():
        yield db

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(name="auth_headers")
def auth_headers_fixture(client: TestClient) -> dict:
    """Register a test user and return Authorization headers."""
    client.post("/auth/register", json={"username": "testuser", "password": "testpass", "role": "user"})
    token = client.post("/auth/token", data={"username": "testuser", "password": "testpass"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
