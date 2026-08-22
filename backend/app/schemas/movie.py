# app/schemas/movie.py
from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional

class MovieBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    genres: Optional[List[str]] = None
    language: Optional[str] = None
    release_date: Optional[date] = None
    runtime: Optional[str] = None
    age_rating: Optional[str] = None
    imdb_rating: Optional[float] = None
    cast: Optional[str] = None
    director: Optional[str] = None
    producer: Optional[str] = None
    studio: Optional[str] = None
    country: Optional[str] = None
    poster: Optional[str] = None
    banner: Optional[str] = None
    thumbnail: Optional[str] = None
    trailer_url: Optional[str] = None
    video_url: Optional[str] = None
    is_featured: bool = False
    is_trending: bool = False
    is_popular: bool = False
    is_new_release: bool = False
    is_premium_only: bool = False
    is_published: bool = False
    visibility: str = "public"

class MovieCreate(MovieBase):
    pass

class MovieUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    genres: Optional[List[str]] = None
    language: Optional[str] = None
    release_date: Optional[date] = None
    runtime: Optional[str] = None
    age_rating: Optional[str] = None
    imdb_rating: Optional[float] = None
    cast: Optional[str] = None
    director: Optional[str] = None
    producer: Optional[str] = None
    studio: Optional[str] = None
    country: Optional[str] = None
    poster: Optional[str] = None
    banner: Optional[str] = None
    thumbnail: Optional[str] = None
    trailer_url: Optional[str] = None
    video_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None
    is_popular: Optional[bool] = None
    is_new_release: Optional[bool] = None
    is_premium_only: Optional[bool] = None
    is_published: Optional[bool] = None
    visibility: Optional[str] = None

class MovieResponse(MovieBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
