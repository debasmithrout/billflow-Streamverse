# app/models/media_item.py
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base

class MediaItem(Base):
    __tablename__ = "media_items"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    category = Column(String, nullable=False) # e.g. movies, series, posters
    content_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
