# app/routers/movies.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services import cms_service
from app.schemas.movie import MovieCreate, MovieUpdate, MovieResponse
from app.auth import admin_required
from app import models

router = APIRouter(
    prefix="/admin/movies",
    tags=["CMS Movies"]
)

@router.get("/", response_model=List[MovieResponse])
def get_movies_list(
    search: Optional[str] = Query(None),
    genre: Optional[str] = Query(None),
    is_published: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.get_movies(db, search=search, genre=genre, is_published=is_published)

@router.get("/{movie_id}", response_model=MovieResponse)
def get_movie(
    movie_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.get_movie_by_id(db, movie_id)

@router.post("/", response_model=MovieResponse)
def create_movie(
    movie: MovieCreate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.create_movie(db, movie)

@router.put("/{movie_id}", response_model=MovieResponse)
def update_movie(
    movie_id: int,
    movie_data: MovieUpdate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.update_movie(db, movie_id, movie_data)

@router.delete("/{movie_id}", response_model=MovieResponse)
def delete_movie(
    movie_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.delete_movie(db, movie_id)

@router.patch("/{movie_id}/publish", response_model=MovieResponse)
def publish_movie(
    movie_id: int,
    is_published: bool,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    movie_update = MovieUpdate(is_published=is_published)
    return cms_service.update_movie(db, movie_id, movie_update)
