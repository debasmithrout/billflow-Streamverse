from sqlalchemy.orm import Session
from typing import Optional
from app import models
from app.repositories import audit_repository
from app.database.unit_of_work import UnitOfWork

def log_audit_event(
    db: Session,
    event_name: str,
    description: str,
    customer_id: Optional[int] = None
) -> models.AuditLog:
    uow = UnitOfWork(db)
    log_data = {
        "event_name": event_name,
        "customer_id": customer_id,
        "description": description
    }
    return audit_repository.create_audit_log(uow.session, log_data)

def get_admin_audit_logs(
    db: Session,
    search: Optional[str] = None,
    module: Optional[str] = None,
    severity: Optional[str] = None,
    page: int = 1,
    limit: int = 5
):
    uow = UnitOfWork(db)
    logs_list, total_count, total_logs = audit_repository.get_audit_logs_paginated(
        uow.session, search, module, page, limit
    )
    
    info_count = 0
    success_count = 0
    warning_count = 0
    error_count = 0
    
    formatted = []
    for l in logs_list:
        event = l.event_name.lower()
        desc = l.description.lower()
        
        sev = "INFO"
        if "success" in event or "success" in desc or "activated" in event or "created" in event:
            sev = "SUCCESS"
            success_count += 1
        elif "failed" in event or "failed" in desc or "error" in event or "error" in desc:
            sev = "ERROR"
            error_count += 1
        elif "cancelled" in event or "warning" in event or "past_due" in event:
            sev = "WARNING"
            warning_count += 1
        else:
            info_count += 1
            
        formatted.append({
            "id": l.id,
            "action": l.event_name,
            "module": "SYSTEM" if "system" in event else "SUBSCRIPTIONS" if "sub" in event else "PAYMENTS" if "pay" in event else "CUSTOMERS",
            "message": l.description,
            "user": l.customer.name if l.customer else "System",
            "timestamp": l.created_at.isoformat() if l.created_at else "",
            "severity": sev
        })

    stats = {
        "total": total_logs,
        "info": info_count,
        "success": success_count,
        "warning": warning_count,
        "error": error_count
    }

    return {
        "logs": formatted,
        "totalCount": total_count,
        "stats": stats
    }
