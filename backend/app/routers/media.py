# app/routers/media.py
from fastapi import APIRouter, Depends, Query, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from app.core.database import get_db
from app.services import cms_service, storage_service
from app.schemas.media_item import MediaItemResponse, MediaItemCreate
from app.auth import admin_required
from app import models

router = APIRouter(
    prefix="/admin/media",
    tags=["CMS Media Library"]
)

@router.get("/", response_model=List[MediaItemResponse])
def get_media_library(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return cms_service.get_media_items(db, category=category, search=search)

@router.post("/upload", response_model=MediaItemResponse)
async def upload_media(
    category: str = Query(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    # Allowed categories matching subfolders
    allowed_categories = ["movies", "series", "episodes", "trailers", "posters", "banners", "thumbnails", "subtitles"]
    if category not in allowed_categories:
        raise HTTPException(status_code=400, detail="Invalid media category")

    try:
        # 1. Save file stream locally
        saved_file_info = storage_service.save_uploaded_file(file, category)
        
        # 2. Register media in database
        media_create = MediaItemCreate(**saved_file_info)
        return cms_service.create_media_item(db, media_create)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload media: {str(e)}")

@router.delete("/{media_id}", response_model=MediaItemResponse)
def delete_media_asset(
    media_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    # 1. Delete record from DB
    db_media = cms_service.delete_media_item(db, media_id)
    
    # 2. Attempt to delete physical file from disk
    try:
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        abs_path = os.path.join(BASE_DIR, db_media.filepath.lstrip("/"))
        if os.path.exists(abs_path):
            os.remove(abs_path)
    except Exception as e:
        print(f"Error removing media file from disk: {e}")
        
    return db_media
