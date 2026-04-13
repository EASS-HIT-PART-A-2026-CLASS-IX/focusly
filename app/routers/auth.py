from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import Session, select

from app.auth import create_access_token, hash_password, verify_password
from app.db import get_session
from app.models import Role, User

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: Role = Role.user


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.username == body.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(
        username=body.username,
        hashed_password=hash_password(body.password),
        role=body.role,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "username": user.username, "role": user.role}


@router.post("/token", response_model=TokenResponse)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.username == form.username)).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.username, "role": user.role})
    return TokenResponse(access_token=token)
