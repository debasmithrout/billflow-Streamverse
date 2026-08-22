from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app import models
from app.auth import admin_required
from app.services import invoice_service

router = APIRouter(
    tags=["Admin Dashboard"]
)


@router.get("/admin/invoices")
def admin_invoices(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required),
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 5
):
    return invoice_service.get_admin_invoices(db, search, status, page, limit)


@router.get("/admin/invoices/{invoice_id}")
def admin_invoice_by_id(
    invoice_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    res = invoice_service.get_admin_invoice_by_id(db, invoice_id)
    if not res:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return res
