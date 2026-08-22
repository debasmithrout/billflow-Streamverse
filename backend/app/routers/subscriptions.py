from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from app.core.database import get_db
from app import models, schemas
from app.models import SubscriptionStatus
from app.auth import get_current_user, admin_required
from app.services import subscription_service
from app.core.rate_limiter import limiter

router = APIRouter(
    tags=["Subscriptions"]
)


@router.post("/subscriptions/", response_model=schemas.SubscriptionResponse)
def create_subscription(
    sub: schemas.SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return subscription_service.create_subscription(db, sub, current_user)
@router.get("/subscriptions/", response_model=List[schemas.SubscriptionResponse])
@limiter.limit("60/minute")
def view_subscriptions(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return subscription_service.get_subscriptions(db, current_user)


@router.get("/subscriptions/{sub_id}", response_model=schemas.SubscriptionResponse)
def get_subscription(
    sub_id: int,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return subscription_service.get_subscription_by_id(db, sub_id, current_user)


@router.get("/subscriptions/status/{status}", response_model=List[schemas.SubscriptionResponse])
def get_subscriptions_by_status(
    status: SubscriptionStatus,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return subscription_service.get_subscriptions_by_status(db, status)


@router.get("/customers/{customer_id}/subscriptions", response_model=List[schemas.SubscriptionResponse])
def get_customer_subscriptions(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return subscription_service.get_customer_subscriptions(db, customer_id, current_user)


@router.patch("/subscriptions/{sub_id}/transition", response_model=schemas.SubscriptionResponse)
def transition_subscription_state(
    sub_id: int,
    update: schemas.StatusTransitionUpdate,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return subscription_service.transition_subscription(db, sub_id, update, current_user)


@router.patch("/subscriptions/{sub_id}/change-plan", response_model=schemas.SubscriptionResponse)
def change_plan(
    sub_id: int,
    request: schemas.ChangePlanRequest,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return subscription_service.change_subscription_plan(db, sub_id, request, current_user)


@router.patch("/subscriptions/{sub_id}/pause", response_model=schemas.SubscriptionResponse)
def pause_subscription(
    sub_id: int,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return subscription_service.pause_subscription(db, sub_id, current_user)


@router.patch("/subscriptions/{sub_id}/resume", response_model=schemas.SubscriptionResponse)
def resume_subscription(
    sub_id: int,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return subscription_service.resume_subscription(db, sub_id, current_user)


@router.patch("/subscriptions/{sub_id}/cancel", response_model=schemas.SubscriptionResponse)
def cancel_subscription(
    sub_id: int,
    request: schemas.CancelSubscriptionRequest,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return subscription_service.cancel_subscription(db, sub_id, request, current_user)


@router.post("/dev/test/trial-expiring-email/{subscription_id}")
@limiter.limit("5/15 minutes")
def force_send_trial_expiry_email(
    request: Request,
    response: Response,
    subscription_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    subscription = db.query(models.Subscription).filter(models.Subscription.id == subscription_id).first()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    customer = subscription.customer
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    cycle = db.query(models.BillingCycle).filter(models.BillingCycle.subscription_id == subscription_id).first()
    expiry_date_str = (cycle.renewal_date.strftime("%Y-%m-%d") if cycle else (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d"))
    
    from app.services import email_service
    html_body = email_service.trial_expiry_reminder_email(customer.name, expiry_date_str)
    
    success = email_service.send_email(
        customer.email,
        "Your StreamVerse Trial Ends Soon",
        html_body
    )
    
    if not success:
         raise HTTPException(status_code=500, detail="Failed to send email.")
         
    return {
        "success": True,
        "message": "Trial reminder email sent."
    }


@router.post(
    "/subscriptions/calculate-proration",
    response_model=schemas.ProrationCalculateResponse,
    summary="Calculate Proration Preview",
    description="Preview upgrade or downgrade pricing before confirmation. Reuses the Proration Engine. This endpoint does NOT create invoices, subscriptions, or database entries, nor does it trigger payments or emails.",
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Successfully calculated proration preview",
            "content": {
                "application/json": {
                    "example": {
                        "current_plan": {"id": 1, "name": "Standard", "price": 299.0},
                        "target_plan": {"id": 3, "name": "Premium", "price": 599.0},
                        "remaining_days": 18,
                        "remaining_ratio": 0.60,
                        "proration_credit": 179.40,
                        "proration_debit": 359.40,
                        "net_proration": 180.00,
                        "gst": 32.40,
                        "total_payable": 212.40
                    }
                }
            }
        },
        404: {"description": "Customer, Target Plan, or Active Subscription not found"},
        400: {"description": "Invalid input parameters"}
    }
)
@limiter.limit("60/minute")
def calculate_proration(
    request: Request,
    response: Response,
    req: schemas.ProrationCalculateRequest,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN and req.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this subscription")
        
    return subscription_service.calculate_proration_preview(
        db=db,
        customer_id=req.customer_id,
        target_plan_id=req.target_plan_id
    )

