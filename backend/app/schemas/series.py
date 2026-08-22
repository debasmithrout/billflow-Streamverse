# app/schemas/series.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.season import SeasonResponse

class SeriesBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    genres: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    poster: Optional[str] = None
    banner: Optional[str] = None
    thumbnail: Optional[str] = None
    trailer_url: Optional[str] = None
    is_featured: bool = False
    is_published: bool = False

class SeriesCreate(SeriesBase):
    pass

class SeriesUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    genres: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    poster: Optional[str] = None
    banner: Optional[str] = None
    thumbnail: Optional[str] = None
    trailer_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None

class SeriesResponse(SeriesBase):
    id: int
    created_at: datetime
    updated_at: datetime
    seasons: List[SeasonResponse] = []

    class Config:
        from_attributes = True
