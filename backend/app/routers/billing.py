from fastapi import APIRouter, Depends, status, Request, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app import models, schemas
from app.auth import admin_required
from app.services import billing_service
from app.core.rate_limiter import limiter

router = APIRouter()


@router.get(
    "/admin/dashboard-stats",
    tags=["Admin Dashboard"],
    summary="Get Admin Dashboard Key Metrics",
    description="Retrieve top-level platform statistics including customer count, active subscriptions, trial users, monthly/annual revenue, and payment health."
)
@limiter.limit("60/minute")
def get_dashboard_stats(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return billing_service.get_dashboard_stats(db)


@router.get(
    "/admin/analytics",
    tags=["Admin Dashboard"],
    summary="Get Comprehensive Billing Analytics",
    description="Retrieve detailed analytics charts, monthly revenue progression, plan distribution, payment success rates, and signup trends."
)
@limiter.limit("30/minute")
def admin_analytics(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return billing_service.get_billing_analytics(db)


@router.get(
    "/analytics/revenue-summary",
    response_model=schemas.RevenueSummaryResponse,
    tags=["Analytics & Revenue"],
    summary="Get Platform Revenue Summary",
    description="Retrieve real-time platform revenue metrics including total historical revenue, Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), and today's collections using backend database aggregation.",
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Revenue summary calculated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "total_revenue": 15450.00,
                        "monthly_recurring_revenue": 2495.00,
                        "annual_recurring_revenue": 29940.00,
                        "today_revenue": 599.00,
                        "monthly_revenue": 1990.00,
                        "annual_revenue": 6060.00
                    }
                }
            }
        }
    }
)
@limiter.limit("30/minute")
def get_revenue_summary_endpoint(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return billing_service.get_revenue_summary(db)


@router.get(
    "/analytics/mrr",
    response_model=schemas.MRRResponse,
    tags=["Analytics & Revenue"],
    summary="Get Monthly Recurring Revenue Breakdown",
    description="Retrieve active MRR, normalized ARR, total active subscription counts, and detailed MRR contributions per subscription plan.",
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "MRR analytics computed successfully",
            "content": {
                "application/json": {
                    "example": {
                        "mrr": 2495.00,
                        "arr": 29940.00,
                        "active_subscriptions_count": 12,
                        "breakdown_by_plan": [
                            {"plan_id": 1, "plan_name": "Free Trial", "active_subscriptions": 2, "mrr_contribution": 0.0},
                            {"plan_id": 2, "plan_name": "Basic", "active_subscriptions": 3, "mrr_contribution": 297.0},
                            {"plan_id": 3, "plan_name": "Standard", "active_subscriptions": 4, "mrr_contribution": 796.0},
                            {"plan_id": 4, "plan_name": "Premium", "active_subscriptions": 3, "mrr_contribution": 897.0}
                        ]
                    }
                }
            }
        }
    }
)
@limiter.limit("30/minute")
def get_mrr_endpoint(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return billing_service.get_mrr_analytics(db)


