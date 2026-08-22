from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app import models, schemas
from app.auth import get_current_user, admin_required
from app.services.refund_service import RefundService

router = APIRouter(
    tags=["Refunds"]
)

@router.post("/refunds/request", response_model=schemas.RefundResponse)
def request_refund(
    data: schemas.RefundCreate,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    payment = db.query(models.Payment).filter(models.Payment.id == data.payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    # Check ownership
    if current_user.role != models.UserRole.ADMIN and payment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only request refunds for your own payments.")
        
    refund_service = RefundService(db)
    return refund_service.request_refund(data)

@router.get("/refunds/my-refunds", response_model=List[schemas.RefundResponse])
def get_my_refunds(
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    # Retrieve all refunds for current customer
    refunds = db.query(models.Refund).filter(models.Refund.customer_id == current_user.id).all()
    return refunds

@router.get("/admin/refunds", response_model=List[schemas.RefundResponse])
def get_admin_refunds(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    # Admin only retrieval of all refunds
    refunds = db.query(models.Refund).order_by(models.Refund.created_at.desc()).all()
    return refunds

@router.post("/admin/refunds/{refund_id}/approve", response_model=schemas.RefundResponse)
def approve_refund(
    refund_id: int,
    action: schemas.RefundAdminAction,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    # Admin only approve action
    refund_service = RefundService(db)
    return refund_service.approve_refund(refund_id, action)

@router.post("/admin/refunds/{refund_id}/reject", response_model=schemas.RefundResponse)
def reject_refund(
    refund_id: int,
    action: schemas.RefundAdminAction,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    # Admin only reject action
    refund_service = RefundService(db)
    return refund_service.reject_refund(refund_id, action)
