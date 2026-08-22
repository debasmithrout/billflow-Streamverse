from sqlalchemy.orm import Session
from typing import List, Optional
from app import models

def get_customer_by_email(db: Session, email: str) -> Optional[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def create_customer(db: Session, customer_data: dict) -> models.Customer:
    new_cust = models.Customer(**customer_data)
    db.add(new_cust)
    db.flush()
    return new_cust

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

def get_all_customers(db: Session) -> List[models.Customer]:
    return db.query(models.Customer).all()

def get_customer_by_id(db: Session, customer_id: int) -> Optional[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_subscriptions(db: Session, customer_id: int) -> List[models.Subscription]:
    return db.query(models.Subscription).filter(models.Subscription.customer_id == customer_id).all()

def get_customer_invoices(db: Session, customer_id: int) -> List[models.Invoice]:
    return db.query(models.Invoice).filter(models.Invoice.customer_id == customer_id).all()

def get_customer_payments(db: Session, customer_id: int) -> List[models.Payment]:
    return db.query(models.Payment).filter(models.Payment.customer_id == customer_id).all()

def delete_customer(db: Session, customer_id: int):
    customer = get_customer_by_id(db, customer_id)
    if customer:
        db.delete(customer)
        db.flush()
