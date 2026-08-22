# app/schemas/episode.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EpisodeBase(BaseModel):
    episode_number: int
    title: str
    description: Optional[str] = None
    runtime: Optional[str] = None
    thumbnail: Optional[str] = None
    video_url: Optional[str] = None
    preview_image: Optional[str] = None
    is_published: bool = False

class EpisodeCreate(EpisodeBase):
    season_id: int

class EpisodeUpdate(BaseModel):
    episode_number: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    runtime: Optional[str] = None
    thumbnail: Optional[str] = None
    video_url: Optional[str] = None
    preview_image: Optional[str] = None
    is_published: Optional[bool] = None

class EpisodeResponse(EpisodeBase):
    id: int
    season_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
