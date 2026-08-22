from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app import models
from app.auth import admin_required
from app.services import admin_service
from app.core.rate_limiter import limiter

router = APIRouter(
    tags=["Admin Dashboard"]
)


@router.get("/admin/customers")
def admin_customers(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required),
    search: Optional[str] = None,
    status: Optional[str] = None,
    country: Optional[str] = None,
    role: Optional[str] = None,
    view: Optional[str] = None,
    sort: Optional[str] = None,
    page: int = 1,
    limit: int = 5
):
    return admin_service.get_admin_customers(
        db, search, status, country, role, view, sort, page, limit
    )


@router.get("/admin/customers/{customer_id}")
def admin_customer_by_id(
    customer_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    res = admin_service.get_admin_customer_by_id(db, customer_id)
    if not res:
        raise HTTPException(status_code=404, detail="Customer not found")
    return res


@router.get("/admin/subscriptions")
def admin_subscriptions(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required),
    search: Optional[str] = None,
    status: Optional[str] = None,
    plan: Optional[str] = None,
    page: int = 1,
    limit: int = 5
):
    return admin_service.get_admin_subscriptions(
        db, search, status, plan, page, limit
    )


@router.get("/admin/subscriptions/{sub_id}")
def admin_subscription_by_id(
    sub_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    res = admin_service.get_admin_subscription_by_id(db, sub_id)
    if not res:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return res


@router.post("/test-task", tags=["Celery"])
def run_test_task():
    from app.tasks import test_task
    from app.celery_worker import safe_task_delay
    task = safe_task_delay(test_task)
    task_id = task.id if task else "FAILED_TO_QUEUE"
 
    return {
        "message": "Task Sent Successfully" if task else "Task Queuing Failed (Broker Offline)",
        "task_id": task_id
    }


@router.delete("/admin/customers/{customer_id}", tags=["Admin Dashboard"])
def admin_delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    from app.services import customer_service
    customer_service.delete_customer_account(db, customer_id)
    return {"message": "Customer deleted successfully"}
@router.get("/admin/taxes/summary", tags=["Admin Taxes Report"])
@limiter.limit("30/minute")
def get_taxes_summary(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    from app.services import billing_service
    return billing_service.get_tax_summary(db)


@router.get("/admin/taxes/report", tags=["Admin Taxes Report"])
@limiter.limit("30/minute")
def get_taxes_report(
    request: Request,
    response: Response,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    from app.services import billing_service
    from datetime import datetime
    s_dt = None
    e_dt = None
    if start_date:
        try:
            s_dt = datetime.fromisoformat(start_date)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use ISO format (YYYY-MM-DD).")
    if end_date:
        try:
            e_dt = datetime.fromisoformat(end_date)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use ISO format (YYYY-MM-DD).")
    return billing_service.get_tax_report(db, s_dt, e_dt)


@router.get("/admin/taxes/analytics", tags=["Admin Taxes Report"])
@limiter.limit("30/minute")
def get_taxes_analytics_endpoint(
    request: Request,
    response: Response,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    from app.services import billing_service
    from datetime import datetime
    s_dt = None
    e_dt = None
    if start_date:
        try:
            s_dt = datetime.fromisoformat(start_date)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use ISO format (YYYY-MM-DD).")
    if end_date:
        try:
            e_dt = datetime.fromisoformat(end_date)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use ISO format (YYYY-MM-DD).")
    return billing_service.get_tax_analytics(db, s_dt, e_dt)


@router.get("/admin/action-center-stats", tags=["Admin Dashboard"])
@limiter.limit("30/minute")
def get_action_center_stats_endpoint(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    from app.services import billing_service
    return billing_service.get_action_center_stats(db)

