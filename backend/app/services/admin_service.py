from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from app import models
from app.repositories import admin_repository
from app.database.unit_of_work import UnitOfWork
from app.core import exceptions

def get_admin_customers(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    country: Optional[str] = None,
    role: Optional[str] = None,
    view: Optional[str] = None,
    sort: Optional[str] = None,
    page: int = 1,
    limit: int = 5
):
    uow = UnitOfWork(db)
    customers_list, total_count, stats = admin_repository.get_admin_customers_paginated(
        uow.session, search, status, country, role, view, sort, page, limit
    )

    formatted = []
    for c in customers_list:
        sub = admin_repository.get_latest_subscription_by_customer_id(uow.session, c.id)
        plan_name = sub.plan.name if (sub and sub.plan) else "No Plan"
        sub_status = sub.status.value if sub else "INACTIVE"
        
        trial_days = 0
        if sub and sub.status == models.SubscriptionStatus.TRIAL and sub.trial_started_at:
            elapsed = (datetime.utcnow() - sub.trial_started_at).days
            trial_days_limit = sub.plan.trial_period_days if (sub.plan and sub.plan.trial_period_days > 0) else 7
            trial_days = max(0, trial_days_limit - elapsed)

        renewal_date_str = ""
        if sub:
            cycle = admin_repository.get_billing_cycle_by_sub_id(uow.session, sub.id)
            if cycle and cycle.renewal_date:
                renewal_date_str = cycle.renewal_date.strftime("%B %d, %Y")

        formatted.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone_number": c.phone_number,
            "country": c.country,
            "address": c.address,
            "role": c.role.value,
            "created_at": c.created_at.isoformat() if c.created_at else "",
            "currentPlan": plan_name,
            "subscriptionStatus": sub_status,
            "renewalDate": renewal_date_str,
            "trialDaysRemaining": trial_days,
            "isArchived": False
        })

    return {
        "customers": formatted,
        "totalCount": total_count,
        "stats": stats
    }

def get_admin_customer_by_id(db: Session, customer_id: int):
    uow = UnitOfWork(db)
    c = admin_repository.get_admin_customer_by_id(uow.session, customer_id)
    if not c:
        raise exceptions.ResourceNotFound("Customer not found")
        
    sub = admin_repository.get_latest_subscription_by_customer_id(uow.session, c.id)
    plan_name = sub.plan.name if (sub and sub.plan) else "No Plan"
    sub_status = sub.status.value if sub else "INACTIVE"
    
    trial_days = 0
    if sub and sub.status == models.SubscriptionStatus.TRIAL and sub.trial_started_at:
        elapsed = (datetime.utcnow() - sub.trial_started_at).days
        trial_days_limit = sub.plan.trial_period_days if (sub.plan and sub.plan.trial_period_days > 0) else 7
        trial_days = max(0, trial_days_limit - elapsed)

    renewal_date_str = ""
    if sub:
        cycle = admin_repository.get_billing_cycle_by_sub_id(uow.session, sub.id)
        if cycle and cycle.renewal_date:
            renewal_date_str = cycle.renewal_date.strftime("%B %d, %Y")

    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "phone_number": c.phone_number,
        "country": c.country,
        "address": c.address,
        "role": c.role.value,
        "created_at": c.created_at.isoformat() if c.created_at else "",
        "currentPlan": plan_name,
        "subscriptionStatus": sub_status,
        "renewalDate": renewal_date_str,
        "trialDaysRemaining": trial_days,
        "isArchived": False
    }

def get_admin_subscriptions(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    plan: Optional[str] = None,
    page: int = 1,
    limit: int = 5
):
    uow = UnitOfWork(db)
    subs_list, total_count, stats = admin_repository.get_admin_subscriptions_paginated(
        uow.session, search, status, plan, page, limit
    )

    formatted = []
    for s in subs_list:
        cycle = admin_repository.get_billing_cycle_by_sub_id(uow.session, s.id)
        renewal_str = cycle.renewal_date.strftime("%Y-%m-%d") if (cycle and cycle.renewal_date) else ""
        
        trial_days_limit = s.plan.trial_period_days if (s.plan and s.plan.trial_period_days > 0) else 7
        trial_end_str = (s.trial_started_at + timedelta(days=trial_days_limit)).strftime("%Y-%m-%d") if s.trial_started_at else ""

        formatted.append({
            "id": s.id,
            "customerId": s.customer_id,
            "customerName": s.customer.name if s.customer else "",
            "customerEmail": s.customer.email if s.customer else "",
            "planId": s.plan_id,
            "planName": s.plan.name if s.plan else "",
            "planPrice": s.billing_price,
            "billingInterval": s.billing_interval.value if hasattr(s.billing_interval, 'value') else str(s.billing_interval),
            "status": s.status.value,
            "trialEndDate": trial_end_str,
            "renewalDate": renewal_str,
            "created_at": s.created_at.isoformat() if s.created_at else ""
        })

    return {
        "subscriptions": formatted,
        "totalCount": total_count,
        "stats": stats
    }

def get_admin_subscription_by_id(db: Session, sub_id: int):
    uow = UnitOfWork(db)
    s = admin_repository.get_admin_subscription_by_id(uow.session, sub_id)
    if not s:
        raise exceptions.ResourceNotFound("Subscription not found")
        
    cycle = admin_repository.get_billing_cycle_by_sub_id(uow.session, s.id)
    renewal_str = cycle.renewal_date.strftime("%Y-%m-%d") if (cycle and cycle.renewal_date) else ""
    
    trial_days_limit = s.plan.trial_period_days if (s.plan and s.plan.trial_period_days > 0) else 7
    trial_end_str = (s.trial_started_at + timedelta(days=trial_days_limit)).strftime("%Y-%m-%d") if s.trial_started_at else ""

    return {
        "id": s.id,
        "customerId": s.customer_id,
        "customerName": s.customer.name if s.customer else "",
        "customerEmail": s.customer.email if s.customer else "",
        "planId": s.plan_id,
        "planName": s.plan.name if s.plan else "",
        "planPrice": s.billing_price,
        "billingInterval": s.billing_interval.value if hasattr(s.billing_interval, 'value') else str(s.billing_interval),
        "status": s.status.value,
        "trialEndDate": trial_end_str,
        "renewalDate": renewal_str,
        "created_at": s.created_at.isoformat() if s.created_at else ""
    }
