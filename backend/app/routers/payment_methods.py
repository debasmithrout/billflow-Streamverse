from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app import models
from app.auth import get_current_user
from app.schemas.payment_method import (
    PaymentMethodCreate,
    PaymentMethodUpdate,
    PaymentMethodResponse,
    PaymentSummaryResponse
)
from app.services import payment_method_service

router = APIRouter(
    prefix="/payment-methods",
    tags=["Payment Methods Management"]
)

@router.get("/", response_model=List[PaymentMethodResponse])
def list_payment_methods(
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    methods = payment_method_service.get_customer_methods(db, current_user.id)
    # Format expiry_date helper attribute on ORM objects
    for m in methods:
        if m.expiry_month and m.expiry_year:
            m.expiry_date = f"{m.expiry_month:02d}/{str(m.expiry_year)[-2:]}"
        else:
            m.expiry_date = None
    return methods

@router.get("/default")
def get_default_payment_method(
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return payment_method_service.get_default_method_adapter(db, current_user)

@router.get("/summary", response_model=PaymentSummaryResponse)
def get_payment_summary(
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return payment_method_service.get_payment_summary(db, current_user.id)

@router.post("/", response_model=PaymentMethodResponse, status_code=status.HTTP_201_CREATED)
def create_payment_method(
    req: PaymentMethodCreate,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    method = payment_method_service.create_payment_method(db, current_user.id, req.dict())
    if method.expiry_month and method.expiry_year:
        method.expiry_date = f"{method.expiry_month:02d}/{str(method.expiry_year)[-2:]}"
    return method

@router.put("/{method_id}", response_model=PaymentMethodResponse)
def update_payment_method(
    method_id: int,
    req: PaymentMethodUpdate,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    method = payment_method_service.update_payment_method(db, method_id, current_user.id, req.dict(exclude_unset=True))
    if method.expiry_month and method.expiry_year:
        method.expiry_date = f"{method.expiry_month:02d}/{str(method.expiry_year)[-2:]}"
    return method

@router.post("/{method_id}/set-default")
def set_default_payment_method(
    method_id: int,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    method = payment_method_service.set_default_payment_method(db, method_id, current_user.id)
    return {"message": "Payment method set as default successfully", "id": method.id}

@router.delete("/{method_id}")
def delete_payment_method(
    method_id: int,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return payment_method_service.delete_payment_method(db, method_id, current_user.id)
