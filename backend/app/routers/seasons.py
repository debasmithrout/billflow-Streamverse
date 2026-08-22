# app/routers/seasons.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services import cms_service
from app.schemas.season import SeasonCreate, SeasonUpdate, SeasonResponse
from app.auth import admin_required
from app import models

router = APIRouter(
    prefix="/admin/seasons",
    tags=["CMS Seasons"]
)

@router.get("/", response_model=List[SeasonResponse])
def get_seasons_list(
    series_id: int = Query(...),
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.get_seasons(db, series_id=series_id)

@router.post("/", response_model=SeasonResponse)
def create_season(
    season: SeasonCreate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.create_season(db, season)

@router.put("/{season_id}", response_model=SeasonResponse)
def update_season(
    season_id: int,
    season_data: SeasonUpdate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.update_season(db, season_id, season_data)

@router.delete("/{season_id}", response_model=SeasonResponse)
def delete_season(
    season_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.delete_season(db, season_id)
