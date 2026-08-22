from sqlalchemy.orm import Session
from typing import List, Optional
from app import models
from app.models import SubscriptionStatus

def get_plan_by_id(db: Session, plan_id: int) -> Optional[models.Plan]:
    return db.query(models.Plan).filter(models.Plan.id == plan_id).first()

def get_customer_by_id(db: Session, customer_id: int) -> Optional[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def create_subscription(db: Session, sub_data: dict) -> models.Subscription:
    new_sub = models.Subscription(**sub_data)
    db.add(new_sub)
    db.flush()
    return new_sub

def create_billing_cycle(db: Session, cycle_data: dict) -> models.BillingCycle:
    billing_cycle = models.BillingCycle(**cycle_data)
    db.add(billing_cycle)
    db.flush()
    return billing_cycle

def get_all_subscriptions(db: Session) -> List[models.Subscription]:
    return db.query(models.Subscription).all()

def get_subscriptions_by_customer_id(db: Session, customer_id: int) -> List[models.Subscription]:
    return db.query(models.Subscription).filter(models.Subscription.customer_id == customer_id).all()

def get_subscription_by_id(db: Session, sub_id: int) -> Optional[models.Subscription]:
    return db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()

def get_subscriptions_by_status(db: Session, status: SubscriptionStatus) -> List[models.Subscription]:
    return db.query(models.Subscription).filter(models.Subscription.status == status).all()

def get_billing_cycle_by_sub_id(db: Session, sub_id: int) -> Optional[models.BillingCycle]:
    return db.query(models.BillingCycle).filter(models.BillingCycle.subscription_id == sub_id).first()
