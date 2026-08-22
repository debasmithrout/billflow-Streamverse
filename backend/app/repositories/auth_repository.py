from sqlalchemy.orm import Session
from typing import Optional
from app import models

def get_customer_by_email(db: Session, email: str) -> Optional[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def create_customer(db: Session, customer_data: dict) -> models.Customer:
    new_customer = models.Customer(**customer_data)
    db.add(new_customer)
    db.flush()
    return new_customer

def get_first_active_trial_plan(db: Session) -> Optional[models.Plan]:
    return db.query(models.Plan).filter(
        models.Plan.trial_period_days > 0,
        models.Plan.is_archived == False
    ).first()

def get_first_plan(db: Session) -> Optional[models.Plan]:
    return db.query(models.Plan).first()

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
