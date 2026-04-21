from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.auth import get_current_user
from app.db import get_session
from app.models import User
from app.schemas import PreferencesCreate, PreferencesRead, PreferencesUpdate
from app.services import (
    service_create_preferences,
    service_delete_preferences,
    service_get_preferences,
    service_list_preferences,
    service_update_preferences,
)

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("", response_model=list[PreferencesRead])
def list_preferences(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return service_list_preferences(db, user_id=current_user.id)


@router.get("/{pref_id}", response_model=PreferencesRead)
def get_preferences(
    pref_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return service_get_preferences(db, pref_id, user_id=current_user.id)


@router.post("", response_model=PreferencesRead, status_code=status.HTTP_201_CREATED)
def create_preferences(
    data: PreferencesCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return service_create_preferences(db, data, user_id=current_user.id)


@router.put("/{pref_id}", response_model=PreferencesRead)
def update_preferences(
    pref_id: int,
    data: PreferencesUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return service_update_preferences(db, pref_id, data, user_id=current_user.id)


@router.delete("/{pref_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_preferences(
    pref_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    service_delete_preferences(db, pref_id, user_id=current_user.id)
