from sqlalchemy.orm import Session
from typing import Optional, Tuple, List
from datetime import datetime
from app import models

def get_admin_customers_paginated(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    country: Optional[str] = None,
    role: Optional[str] = None,
    view: Optional[str] = None,
    sort: Optional[str] = None,
    page: int = 1,
    limit: int = 5
) -> Tuple[List[models.Customer], int, dict]:
    query = db.query(models.Customer).filter(models.Customer.role == models.UserRole.CUSTOMER)
    
    if search:
        query = query.filter(
            (models.Customer.name.ilike(f"%{search}%")) |
            (models.Customer.email.ilike(f"%{search}%"))
        )
        
    if country and country != "All":
        query = query.filter(models.Customer.country == country)
        
    if status and status != "All":
        query = query.join(models.Subscription).filter(models.Subscription.status == status)

    if sort == "Oldest":
        query = query.order_by(models.Customer.created_at.asc())
    elif sort == "Name A-Z":
        query = query.order_by(models.Customer.name.asc())
    elif sort == "Name Z-A":
        query = query.order_by(models.Customer.name.desc())
    else:
        query = query.order_by(models.Customer.created_at.desc())

    total_count = query.count()
    
    offset = (page - 1) * limit
    customers_list = query.offset(offset).limit(limit).all()

    total_cust = db.query(models.Customer).filter(models.Customer.role == models.UserRole.CUSTOMER).count()
    active_cust = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.ACTIVE).count()
    trial_cust = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.TRIAL).count()
    past_due_cust = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.PAST_DUE).count()

    stats = {
        "totalCustomers": total_cust,
        "activeCustomers": active_cust,
        "trialCustomers": trial_cust,
        "archivedCustomers": 0,
        "pastDueCustomers": past_due_cust
    }

    return customers_list, total_count, stats

def get_admin_customer_by_id(db: Session, customer_id: int) -> Optional[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_latest_subscription_by_customer_id(db: Session, customer_id: int) -> Optional[models.Subscription]:
    return db.query(models.Subscription).filter(models.Subscription.customer_id == customer_id).order_by(models.Subscription.created_at.desc()).first()

def get_billing_cycle_by_sub_id(db: Session, sub_id: int) -> Optional[models.BillingCycle]:
    return db.query(models.BillingCycle).filter(models.BillingCycle.subscription_id == sub_id).first()

def get_admin_subscriptions_paginated(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    plan: Optional[str] = None,
    page: int = 1,
    limit: int = 5
) -> Tuple[List[models.Subscription], int, dict]:
    query = db.query(models.Subscription).join(models.Customer).join(models.Plan)
    
    if search:
        query = query.filter(
            (models.Customer.name.ilike(f"%{search}%")) |
            (models.Plan.name.ilike(f"%{search}%"))
        )
        
    if status and status != "All":
        query = query.filter(models.Subscription.status == status)
        
    if plan and plan != "All":
        query = query.filter(models.Plan.name == plan)
        
    query = query.order_by(models.Subscription.created_at.desc())
    total_count = query.count()
    
    offset = (page - 1) * limit
    subs_list = query.offset(offset).limit(limit).all()

    total_subs = db.query(models.Subscription).count()
    active_subs = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.ACTIVE).count()
    trial_subs = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.TRIAL).count()
    past_due_subs = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.PAST_DUE).count()
    cancelled_subs = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.CANCELLED).count()

    stats = {
        "total": total_subs,
        "active": active_subs,
        "trial": trial_subs,
        "pastDue": past_due_subs,
        "cancelled": cancelled_subs,
        "paused": 0
    }

    return subs_list, total_count, stats

def get_admin_subscription_by_id(db: Session, sub_id: int) -> Optional[models.Subscription]:
    return db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
