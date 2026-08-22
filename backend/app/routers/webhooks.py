from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app import models
from app.auth import admin_required
from app.services import webhook_service

router = APIRouter(
    prefix="/admin/webhooks",
    tags=["Admin Webhooks"]
)

@router.get("/logs")
def get_webhook_logs(
    limit: int = 50,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return webhook_service.get_webhook_logs(db, limit, event_type)

@router.post("/logs/{event_id}/replay")
def replay_webhook_event(
    event_id: str,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return webhook_service.replay_webhook_event(db, event_id)
