from sqlalchemy.orm import Session
from typing import Optional, Tuple, List
from app import models

def create_audit_log(db: Session, log_data: dict) -> models.AuditLog:
    audit_log = models.AuditLog(**log_data)
    db.add(audit_log)
    db.flush()
    return audit_log

def get_audit_logs_paginated(
    db: Session,
    search: Optional[str] = None,
    module: Optional[str] = None,
    page: int = 1,
    limit: int = 5
) -> Tuple[List[models.AuditLog], int, int]:
    query = db.query(models.AuditLog).join(models.Customer, isouter=True)
    
    if search:
        query = query.filter(
            (models.AuditLog.event_name.ilike(f"%{search}%")) |
            (models.AuditLog.description.ilike(f"%{search}%")) |
            (models.Customer.name.ilike(f"%{search}%"))
        )
        
    if module and module != "All":
        query = query.filter(models.AuditLog.event_name.ilike(f"%{module}%"))

    query = query.order_by(models.AuditLog.created_at.desc())
    total_count = query.count()
    
    offset = (page - 1) * limit
    logs_list = query.offset(offset).limit(limit).all()

    total_logs = db.query(models.AuditLog).count()

    return logs_list, total_count, total_logs
