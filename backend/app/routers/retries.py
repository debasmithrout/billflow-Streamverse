from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from pydantic import BaseModel

from app.core.database import get_db
from app import models, schemas
from app.auth import admin_required
from app.services.retry_service import RetryService
from app.repositories import retry_repository

router = APIRouter(
    prefix="/admin/retries",
    tags=["Payment Retries"]
)


class RetryTriggerRequest(BaseModel):
    result: Optional[str] = "SUCCESS"


@router.get("/stats")
def get_retry_stats(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    """
    Return dashboard widget KPIs computed from the RetryQueue table.
    This is the same underlying dataset used by the retry table list endpoint,
    guaranteeing a single source of truth for widgets and table data.
    """
    return RetryService.get_retry_stats(db)


@router.get("/", response_model=List[schemas.RetryQueueResponse])
def list_retries(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    """
    List all retry entries ordered by created_at desc.
    """
    return RetryService.get_all_retries(db)


@router.get("/history", response_model=List[schemas.RetryQueueResponse])
def get_retry_history(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    """
    List all processed retries (SUCCESS or FAILED).
    """
    return RetryService.get_retry_history_list(db)


@router.get("/{retry_id}", response_model=schemas.RetryQueueResponse)
def get_retry_by_id(
    retry_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    """
    Retrieve specific retry queue entry details by ID.
    """
    entry = RetryService.get_retry_by_id(db, retry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Retry entry not found")
    return entry


@router.post("/{retry_id}/retry", response_model=schemas.RetryQueueResponse)
def trigger_retry_manually(
    retry_id: int,
    req: Optional[RetryTriggerRequest] = None,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    """
    Manually trigger a retry attempt for a failed payment.
    - result: SUCCESS or FAILED
    """
    res_val = req.result if req else "SUCCESS"
    if res_val not in ["SUCCESS", "FAILED"]:
        raise HTTPException(status_code=400, detail="Invalid result value. Must be SUCCESS or FAILED.")

    try:
        res = RetryService.trigger_retry(db, retry_id, res_val)
        db.commit()
        return RetryService.get_retry_by_id(db, res.id)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

