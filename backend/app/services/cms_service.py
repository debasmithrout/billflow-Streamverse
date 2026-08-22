# app/services/cms_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional
from app import models, schemas
from app.models.movie import Movie
from app.models.series import Series
from app.models.season import Season
from app.models.episode import Episode
from app.models.media_item import MediaItem
import re
from datetime import datetime

def slugify(title: str) -> str:
    # Convert spaces/special chars to lowercase-dashed slug
    title = title.lower().strip()
    title = re.sub(r'[^\w\s-]', '', title)
    title = re.sub(r'[\s_-]+', '-', title)
    return title

# --- MOVIES CRUD ---
def get_movies(db: Session, search: Optional[str] = None, genre: Optional[str] = None, is_published: Optional[bool] = None) -> List[Movie]:
    query = db.query(Movie)
    if search:
        query = query.filter(Movie.title.ilike(f"%{search}%") | Movie.description.ilike(f"%{search}%"))
    if is_published is not None:
        query = query.filter(Movie.is_published == is_published)
    
    movies = query.all()
    # Simple post-query filter for JSON genres list
    if genre:
        movies = [m for m in movies if m.genres and genre in m.genres]
    return movies

def get_movie_by_id(db: Session, movie_id: int) -> Movie:
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

def create_movie(db: Session, movie_data: schemas.MovieCreate) -> Movie:
    # Auto-generate unique slug if not provided
    slug = movie_data.slug or slugify(movie_data.title)
    existing = db.query(Movie).filter(Movie.slug == slug).first()
    if existing:
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
    
    db_movie = Movie(**movie_data.dict())
    db_movie.slug = slug
    db.add(db_movie)
    db.commit()
    db.refresh(db_movie)
    return db_movie

def update_movie(db: Session, movie_id: int, movie_data: schemas.MovieUpdate) -> Movie:
    db_movie = get_movie_by_id(db, movie_id)
    update_dict = movie_data.dict(exclude_unset=True)
    
    for key, value in update_dict.items():
        setattr(db_movie, key, value)
        
    db.commit()
    db.refresh(db_movie)
    return db_movie

def delete_movie(db: Session, movie_id: int) -> Movie:
    db_movie = get_movie_by_id(db, movie_id)
    db.delete(db_movie)
    db.commit()
    return db_movie

# --- SERIES CRUD ---
def get_series_list(db: Session, search: Optional[str] = None, is_published: Optional[bool] = None) -> List[Series]:
    query = db.query(Series)
    if search:
        query = query.filter(Series.title.ilike(f"%{search}%") | Series.description.ilike(f"%{search}%"))
    if is_published is not None:
        query = query.filter(Series.is_published == is_published)
    return query.all()

def get_series_by_id(db: Session, series_id: int) -> Series:
    series = db.query(Series).filter(Series.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    return series

def create_series(db: Session, series_data: schemas.SeriesCreate) -> Series:
    slug = series_data.slug or slugify(series_data.title)
    existing = db.query(Series).filter(Series.slug == slug).first()
    if existing:
        import time
        slug = f"{slug}-{int(time.time())}"
        
    db_series = Series(**series_data.dict())
    db_series.slug = slug
    db.add(db_series)
    db.commit()
    db.refresh(db_series)
    return db_series

def update_series(db: Session, series_id: int, series_data: schemas.SeriesUpdate) -> Series:
    db_series = get_series_by_id(db, series_id)
    update_dict = series_data.dict(exclude_unset=True)
    
    for key, value in update_dict.items():
        setattr(db_series, key, value)
        
    db.commit()
    db.refresh(db_series)
    return db_series

def delete_series(db: Session, series_id: int) -> Series:
    db_series = get_series_by_id(db, series_id)
    db.delete(db_series)
    db.commit()
    return db_series

# --- SEASONS CRUD ---
def get_seasons(db: Session, series_id: int) -> List[Season]:
    return db.query(Season).filter(Season.series_id == series_id).order_by(Season.order.asc(), Season.season_number.asc()).all()

def get_season_by_id(db: Session, season_id: int) -> Season:
    season = db.query(Season).filter(Season.id == season_id).first()
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    return season

def create_season(db: Session, season_data: schemas.SeasonCreate) -> Season:
    # Ensure Series exists
    get_series_by_id(db, season_data.series_id)
    
    db_season = Season(**season_data.dict())
    db.add(db_season)
    db.commit()
    db.refresh(db_season)
    return db_season

def update_season(db: Session, season_id: int, season_data: schemas.SeasonUpdate) -> Season:
    db_season = get_season_by_id(db, season_id)
    update_dict = season_data.dict(exclude_unset=True)
    
    for key, value in update_dict.items():
        setattr(db_season, key, value)
        
    db.commit()
    db.refresh(db_season)
    return db_season

def delete_season(db: Session, season_id: int) -> Season:
    db_season = get_season_by_id(db, season_id)
    db.delete(db_season)
    db.commit()
    return db_season

# --- EPISODES CRUD ---
def get_episodes(db: Session, season_id: int) -> List[Episode]:
    return db.query(Episode).filter(Episode.season_id == season_id).order_by(Episode.episode_number.asc()).all()

def get_episode_by_id(db: Session, episode_id: int) -> Episode:
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    return episode

def create_episode(db: Session, episode_data: schemas.EpisodeCreate) -> Episode:
    # Ensure Season exists
    get_season_by_id(db, episode_data.season_id)
    
    db_episode = Episode(**episode_data.dict())
    db.add(db_episode)
    db.commit()
    db.refresh(db_episode)
    return db_episode

def update_episode(db: Session, episode_id: int, episode_data: schemas.EpisodeUpdate) -> Episode:
    db_episode = get_episode_by_id(db, episode_id)
    update_dict = episode_data.dict(exclude_unset=True)
    
    for key, value in update_dict.items():
        setattr(db_episode, key, value)
        
    db.commit()
    db.refresh(db_episode)
    return db_episode

def delete_episode(db: Session, episode_id: int) -> Episode:
    db_episode = get_episode_by_id(db, episode_id)
    db.delete(db_episode)
    db.commit()
    return db_episode

# --- MEDIA ITEM CRUD ---
def get_media_items(db: Session, category: Optional[str] = None, search: Optional[str] = None) -> List[MediaItem]:
    query = db.query(MediaItem)
    if category:
        query = query.filter(MediaItem.category == category)
    if search:
        query = query.filter(MediaItem.filename.ilike(f"%{search}%"))
    return query.order_by(MediaItem.created_at.desc()).all()

def create_media_item(db: Session, media_data: schemas.MediaItemCreate) -> MediaItem:
    db_media = MediaItem(**media_data.dict())
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media

def delete_media_item(db: Session, media_id: int) -> MediaItem:
    db_media = db.query(MediaItem).filter(MediaItem.id == media_id).first()
    if not db_media:
        raise HTTPException(status_code=404, detail="Media item not found")
    db.delete(db_media)
    db.commit()
    return db_media
