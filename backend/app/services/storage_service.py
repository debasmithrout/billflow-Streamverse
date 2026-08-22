# app/services/storage_service.py
import os
import shutil
import re
from fastapi import UploadFile
from datetime import datetime

# Root folder for uploads relative to backend project path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

def sanitize_filename(filename: str) -> str:
    # Sanitize special characters and whitespace
    name, ext = os.path.splitext(filename)
    name = name.lower().strip()
    name = re.sub(r'[^\w\s-]', '', name)
    name = re.sub(r'[\s_-]+', '_', name)
    return f"{name}{ext}"

def save_uploaded_file(file: UploadFile, category: str) -> dict:
    # Ensure category folder exists
    cat_dir = os.path.join(UPLOAD_DIR, category)
    os.makedirs(cat_dir, exist_ok=True)

    sanitized = sanitize_filename(file.filename)
    # Add unique timestamp collision guard
    timestamp = int(datetime.utcnow().timestamp())
    name, ext = os.path.splitext(sanitized)
    filename = f"{name}_{timestamp}{ext}"

    filepath = os.path.join(cat_dir, filename)
    
    # Write stream locally
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Calculate exact file size
    file_size = os.path.getsize(filepath)
    
    return {
        "filename": filename,
        "filepath": f"/uploads/{category}/{filename}",
        "content_type": file.content_type or "application/octet-stream",
        "file_size": file_size,
        "category": category
    }
