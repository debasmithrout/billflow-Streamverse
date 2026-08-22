# app/schemas/season.py
from pydantic import BaseModel
from typing import List, Optional
from app.schemas.episode import EpisodeResponse

class SeasonBase(BaseModel):
    season_number: int
    title: Optional[str] = None
    description: Optional[str] = None
    poster: Optional[str] = None
    order: int = 0

class SeasonCreate(SeasonBase):
    series_id: int

class SeasonUpdate(BaseModel):
    season_number: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    poster: Optional[str] = None
    order: Optional[int] = None

class SeasonResponse(SeasonBase):
    id: int
    series_id: int
    episodes: List[EpisodeResponse] = []

    class Config:
        from_attributes = True
