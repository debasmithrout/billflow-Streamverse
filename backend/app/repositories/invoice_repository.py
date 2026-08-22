from sqlalchemy.orm import Session
from typing import Optional, Tuple, List
from app import models

def create_invoice(db: Session, invoice_data: dict) -> models.Invoice:
    invoice = models.Invoice(**invoice_data)
    db.add(invoice)
    db.flush()
    return invoice

def get_subscription_by_id(db: Session, subscription_id: int) -> Optional[models.Subscription]:
    return db.query(models.Subscription).filter(models.Subscription.id == subscription_id).first()

def get_invoice_by_id(db: Session, invoice_id: int) -> Optional[models.Invoice]:
    return db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()

def get_invoices_paginated(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 5
) -> Tuple[List[models.Invoice], int, dict]:
    query = db.query(models.Invoice).join(models.Customer)
    
    if search:
        query = query.filter(
            (models.Invoice.invoice_number.ilike(f"%{search}%")) |
            (models.Customer.name.ilike(f"%{search}%"))
        )
        
    if status and status != "All":
        try:
            db_status = models.InvoiceStatus(status.upper())
            query = query.filter(models.Invoice.status == db_status)
        except ValueError:
            pass
        
    query = query.order_by(models.Invoice.generated_at.desc())
    total_count = query.count()
    
    offset = (page - 1) * limit
    invoices_list = query.offset(offset).limit(limit).all()

    total_invs = db.query(models.Invoice).count()
    paid_invs = db.query(models.Invoice).filter(models.Invoice.status == models.InvoiceStatus.PAID).count()
    pending_invs = db.query(models.Invoice).filter(models.Invoice.status == models.InvoiceStatus.UNPAID).count()
    failed_invs = db.query(models.Invoice).filter(models.Invoice.status == models.InvoiceStatus.FAILED).count()
    cancelled_invs = db.query(models.Invoice).filter(models.Invoice.status == models.InvoiceStatus.CANCELLED).count()
    refunded_invs = db.query(models.Invoice).filter(models.Invoice.status == models.InvoiceStatus.REFUNDED).count()
    partially_refunded_invs = db.query(models.Invoice).filter(models.Invoice.status == models.InvoiceStatus.PARTIALLY_REFUNDED).count()

    # Calculate real total invoice value and outstanding balance in the database
    from sqlalchemy import func
    total_invoice_value = db.query(func.sum(models.Invoice.total_amount)).scalar() or 0.0
    outstanding_balance = db.query(func.sum(models.Invoice.total_amount)).filter(
        models.Invoice.status.in_([models.InvoiceStatus.UNPAID, models.InvoiceStatus.FAILED])
    ).scalar() or 0.0

    stats = {
        "total": total_invs,
        "paid": paid_invs,
        "pending": pending_invs,
        "overdue": failed_invs,
        "cancelled": cancelled_invs,
        "refunded": refunded_invs,
        "partially_refunded": partially_refunded_invs,
        "total_invoice_value": float(total_invoice_value),
        "outstanding_balance": float(outstanding_balance)
    }

    return invoices_list, total_count, stats
