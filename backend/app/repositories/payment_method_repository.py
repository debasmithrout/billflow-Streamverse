from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.payment_method import PaymentMethod

def get_by_id(db: Session, method_id: int, customer_id: int) -> Optional[PaymentMethod]:
    return db.query(PaymentMethod).filter(
        PaymentMethod.id == method_id,
        PaymentMethod.customer_id == customer_id,
        PaymentMethod.is_active == True
    ).first()

def get_customer_payment_methods(db: Session, customer_id: int) -> List[PaymentMethod]:
    return db.query(PaymentMethod).filter(
        PaymentMethod.customer_id == customer_id,
        PaymentMethod.is_active == True
    ).order_by(PaymentMethod.is_default.desc(), PaymentMethod.created_at.desc()).all()

def get_default_payment_method(db: Session, customer_id: int) -> Optional[PaymentMethod]:
    return db.query(PaymentMethod).filter(
        PaymentMethod.customer_id == customer_id,
        PaymentMethod.is_default == True,
        PaymentMethod.is_active == True
    ).first()

def reset_customer_defaults(db: Session, customer_id: int, exclude_id: Optional[int] = None):
    query = db.query(PaymentMethod).filter(
        PaymentMethod.customer_id == customer_id,
        PaymentMethod.is_default == True
    )
    if exclude_id:
        query = query.filter(PaymentMethod.id != exclude_id)
    
    defaults = query.all()
    for method in defaults:
        method.is_default = False

def create_payment_method(db: Session, method: PaymentMethod) -> PaymentMethod:
    db.add(method)
    db.commit()
    db.refresh(method)
    return method

def update_payment_method(db: Session, method: PaymentMethod) -> PaymentMethod:
    db.commit()
    db.refresh(method)
    return method
