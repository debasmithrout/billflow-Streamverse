from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional, Tuple, List
from datetime import datetime
from app import models

def create_payment(db: Session, payment_data: dict) -> models.Payment:
    payment = models.Payment(**payment_data)
    db.add(payment)
    db.flush()
    return payment

def get_payment_by_id(db: Session, payment_id: int) -> Optional[models.Payment]:
    return db.query(models.Payment).filter(models.Payment.id == payment_id).first()

def get_payments_paginated(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    paymentMethod: Optional[str] = None,
    page: int = 1,
    limit: int = 5
) -> Tuple[List[models.Payment], int, dict, dict]:
    query = db.query(models.Payment).join(models.Customer).options(joinedload(models.Payment.payment_method))
    
    if search:
        query = query.filter(models.Customer.name.ilike(f"%{search}%"))
        
    if status and status != "All":
        db_status = models.PaymentStatus.SUCCESS if status.upper() in ["PAID", "SUCCESS"] else models.PaymentStatus.FAILED
        query = query.filter(models.Payment.status == db_status)
        
    query = query.order_by(models.Payment.created_at.desc())
    total_count = query.count()
    
    offset = (page - 1) * limit
    payments_list = query.offset(offset).limit(limit).all()

    total_pays = db.query(models.Payment).count()
    paid_pays = db.query(models.Payment).filter(models.Payment.status == models.PaymentStatus.SUCCESS).count()
    failed_pays = db.query(models.Payment).filter(models.Payment.status == models.PaymentStatus.FAILED).count()

    stats = {
        "total": total_pays,
        "paid": paid_pays,
        "pending": 0,
        "failed": failed_pays,
        "refunded": 0
    }

    total_rev = db.query(func.sum(models.Payment.amount)).filter(models.Payment.status == models.PaymentStatus.SUCCESS).scalar() or 0.0
    
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_rev = db.query(func.sum(models.Payment.amount)).filter(
        models.Payment.status == models.PaymentStatus.SUCCESS,
        models.Payment.created_at >= today_start
    ).scalar() or 0.0
    
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_rev = db.query(func.sum(models.Payment.amount)).filter(
        models.Payment.status == models.PaymentStatus.SUCCESS,
        models.Payment.created_at >= month_start
    ).scalar() or 0.0

    revenue_stats = {
        "totalRevenue": total_rev,
        "todayRevenue": today_rev,
        "currentMonthRevenue": month_rev,
        "pendingAmount": 0.0,
        "refundedAmount": 0.0
    }

    return payments_list, total_count, stats, revenue_stats
