# app/models/movie.py
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, JSON
from datetime import datetime
from app.core.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    short_description = Column(String, nullable=True)
    genres = Column(JSON, nullable=True) # list of genres, e.g. ["Action", "Sci-Fi"]
    language = Column(String, nullable=True)
    release_date = Column(Date, nullable=True)
    runtime = Column(String, nullable=True) # e.g. "2h 49m"
    age_rating = Column(String, nullable=True)
    imdb_rating = Column(Float, nullable=True)
    cast = Column(String, nullable=True)
    director = Column(String, nullable=True)
    producer = Column(String, nullable=True)
    studio = Column(String, nullable=True)
    country = Column(String, nullable=True)
    poster = Column(String, nullable=True)
    banner = Column(String, nullable=True)
    thumbnail = Column(String, nullable=True)
    trailer_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    is_trending = Column(Boolean, default=False, nullable=False)
    is_popular = Column(Boolean, default=False, nullable=False)
    is_new_release = Column(Boolean, default=False, nullable=False)
    is_premium_only = Column(Boolean, default=False, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    visibility = Column(String, default="public", nullable=False) # public, hidden
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
