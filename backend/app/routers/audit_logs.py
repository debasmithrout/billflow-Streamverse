from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app import models
from app.auth import admin_required
from app.services import audit_service

router = APIRouter(
    tags=["Admin Dashboard"]
)


@router.get("/admin/audit-logs")
def admin_audit_logs(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required),
    search: Optional[str] = None,
    module: Optional[str] = None,
    severity: Optional[str] = None,
    page: int = 1,
    limit: int = 5
):
    return audit_service.get_admin_audit_logs(db, search, module, severity, page, limit)
