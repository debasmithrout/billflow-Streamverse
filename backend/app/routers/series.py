# app/routers/series.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services import cms_service
from app.schemas.series import SeriesCreate, SeriesUpdate, SeriesResponse
from app.auth import admin_required
from app import models

router = APIRouter(
    prefix="/admin/series",
    tags=["CMS Series"]
)

@router.get("/", response_model=List[SeriesResponse])
def get_series_list(
    search: Optional[str] = Query(None),
    is_published: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.get_series_list(db, search=search, is_published=is_published)

@router.get("/{series_id}", response_model=SeriesResponse)
def get_series(
    series_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.get_series_by_id(db, series_id)

@router.post("/", response_model=SeriesResponse)
def create_series(
    series: SeriesCreate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.create_series(db, series)

@router.put("/{series_id}", response_model=SeriesResponse)
def update_series(
    series_id: int,
    series_data: SeriesUpdate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.update_series(db, series_id, series_data)

@router.delete("/{series_id}", response_model=SeriesResponse)
def delete_series(
    series_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.delete_series(db, series_id)

@router.patch("/{series_id}/publish", response_model=SeriesResponse)
def publish_series(
    series_id: int,
    is_published: bool,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    series_update = SeriesUpdate(is_published=is_published)
    return cms_service.update_series(db, series_id, series_update)
