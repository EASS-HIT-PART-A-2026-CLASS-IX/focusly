from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.db import get_session
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
def list_preferences(db: Session = Depends(get_session)):
    return service_list_preferences(db)


@router.get("/{pref_id}", response_model=PreferencesRead)
def get_preferences(pref_id: int, db: Session = Depends(get_session)):
    return service_get_preferences(db, pref_id)


@router.post("", response_model=PreferencesRead, status_code=status.HTTP_201_CREATED)
def create_preferences(data: PreferencesCreate, db: Session = Depends(get_session)):
    return service_create_preferences(db, data)


@router.put("/{pref_id}", response_model=PreferencesRead)
def update_preferences(pref_id: int, data: PreferencesUpdate, db: Session = Depends(get_session)):
    return service_update_preferences(db, pref_id, data)


@router.delete("/{pref_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_preferences(pref_id: int, db: Session = Depends(get_session)):
    service_delete_preferences(db, pref_id)
