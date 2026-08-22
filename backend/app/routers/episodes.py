# app/routers/episodes.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services import cms_service
from app.schemas.episode import EpisodeCreate, EpisodeUpdate, EpisodeResponse
from app.auth import admin_required
from app import models

router = APIRouter(
    prefix="/admin/episodes",
    tags=["CMS Episodes"]
)

@router.get("/", response_model=List[EpisodeResponse])
def get_episodes_list(
    season_id: int = Query(...),
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.get_episodes(db, season_id=season_id)

@router.post("/", response_model=EpisodeResponse)
def create_episode(
    episode: EpisodeCreate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.create_episode(db, episode)

@router.put("/{episode_id}", response_model=EpisodeResponse)
def update_episode(
    episode_id: int,
    episode_data: EpisodeUpdate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.update_episode(db, episode_id, episode_data)

@router.delete("/{episode_id}", response_model=EpisodeResponse)
def delete_episode(
    episode_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.delete_episode(db, episode_id)

@router.patch("/{episode_id}/publish", response_model=EpisodeResponse)
def publish_episode(
    episode_id: int,
    is_published: bool,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    episode_update = EpisodeUpdate(is_published=is_published)
    return cms_service.update_episode(db, episode_id, episode_update)
