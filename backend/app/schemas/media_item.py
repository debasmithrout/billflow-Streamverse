# app/schemas/media_item.py
from pydantic import BaseModel
from datetime import datetime

class MediaItemBase(BaseModel):
    filename: str
    filepath: str
    category: str
    content_type: str
    file_size: int

class MediaItemCreate(MediaItemBase):
    pass

class MediaItemResponse(MediaItemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
