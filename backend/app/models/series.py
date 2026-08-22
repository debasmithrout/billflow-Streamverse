# app/models/series.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Series(Base):
    __tablename__ = "series"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    short_description = Column(String, nullable=True)
    genres = Column(JSON, nullable=True) # list of genres
    languages = Column(JSON, nullable=True) # list of languages
    poster = Column(String, nullable=True)
    banner = Column(String, nullable=True)
    thumbnail = Column(String, nullable=True)
    trailer_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    seasons = relationship("Season", back_populates="series", cascade="all, delete-orphan")
