from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException

from app.models.payment_method import PaymentMethod
from app.models.payment import Payment
from app.models.enums import PaymentStatus
from app import models
from app.repositories import payment_method_repository

def get_customer_methods(db: Session, customer_id: int) -> List[PaymentMethod]:
    return payment_method_repository.get_customer_payment_methods(db, customer_id)

def get_default_method_adapter(db: Session, customer: models.Customer) -> Optional[Dict]:
    method = payment_method_repository.get_default_payment_method(db, customer.id)
    if not method:
        return None
    
    exp_date = f"{method.expiry_month:02d}/{str(method.expiry_year)[-2:]}" if (method.expiry_month and method.expiry_year) else "12/28"
    
    return {
        "cardType": method.provider or "VISA",
        "last4": method.last_four or "4242",
        "expiryDate": exp_date,
        "billingEmail": customer.name or customer.email
    }

def create_payment_method(db: Session, customer_id: int, payload_data: dict) -> PaymentMethod:
    method_type = payload_data.get("method_type")
    if method_type not in ["card", "upi", "netbanking", "wallet"]:
        raise HTTPException(status_code=422, detail="Invalid method_type")

    is_active = payload_data.get("is_active", True)

    # Only promote or check defaults if the payment method is active
    is_default = False
    if is_active:
        existing_methods = payment_method_repository.get_customer_payment_methods(db, customer_id)
        is_first = len(existing_methods) == 0
        is_default = payload_data.get("is_default", False) or is_first
        if is_default:
            payment_method_repository.reset_customer_defaults(db, customer_id)

    new_method = PaymentMethod(
        customer_id=customer_id,
        method_type=method_type,
        provider=payload_data.get("provider", "VISA"),
        display_name=payload_data.get("display_name", "Payment Instrument"),
        last_four=payload_data.get("last_four"),
        upi_id=payload_data.get("upi_id"),
        bank_name=payload_data.get("bank_name"),
        wallet_name=payload_data.get("wallet_name"),
        expiry_month=payload_data.get("expiry_month"),
        expiry_year=payload_data.get("expiry_year"),
        is_default=is_default,
        is_active=is_active,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    return payment_method_repository.create_payment_method(db, new_method)

def update_payment_method(db: Session, method_id: int, customer_id: int, payload_data: dict) -> PaymentMethod:
    method = payment_method_repository.get_by_id(db, method_id, customer_id)
    if not method:
        raise HTTPException(status_code=404, detail="Payment method not found")

    if "display_name" in payload_data and payload_data["display_name"] is not None:
        method.display_name = payload_data["display_name"]
    if "expiry_month" in payload_data and payload_data["expiry_month"] is not None:
        method.expiry_month = payload_data["expiry_month"]
    if "expiry_year" in payload_data and payload_data["expiry_year"] is not None:
        method.expiry_year = payload_data["expiry_year"]

    if payload_data.get("is_default"):
        payment_method_repository.reset_customer_defaults(db, customer_id, exclude_id=method_id)
        method.is_default = True

    method.updated_at = datetime.utcnow()
    return payment_method_repository.update_payment_method(db, method)

def set_default_payment_method(db: Session, method_id: int, customer_id: int) -> PaymentMethod:
    method = payment_method_repository.get_by_id(db, method_id, customer_id)
    if not method:
        raise HTTPException(status_code=404, detail="Payment method not found")

    payment_method_repository.reset_customer_defaults(db, customer_id, exclude_id=method_id)
    method.is_default = True
    method.updated_at = datetime.utcnow()
    return payment_method_repository.update_payment_method(db, method)

def delete_payment_method(db: Session, method_id: int, customer_id: int) -> Dict:
    method = payment_method_repository.get_by_id(db, method_id, customer_id)
    if not method:
        raise HTTPException(status_code=404, detail="Payment method not found")

    was_default = method.is_default
    method.is_active = False
    method.is_default = False
    method.updated_at = datetime.utcnow()
    payment_method_repository.update_payment_method(db, method)

    # Auto-promotion logic if default method was deleted
    if was_default:
        remaining = payment_method_repository.get_customer_payment_methods(db, customer_id)
        if remaining:
            # Promote most recently updated active method to default
            next_default = remaining[0]
            next_default.is_default = True
            next_default.updated_at = datetime.utcnow()
            payment_method_repository.update_payment_method(db, next_default)

    return {"message": "Payment method removed successfully", "id": method_id}

def get_payment_summary(db: Session, customer_id: int) -> Dict:
    # Real DB calculations from payments table
    payments = db.query(Payment).filter(
        Payment.customer_id == customer_id,
        Payment.status == PaymentStatus.SUCCESS
    ).all()

    total_spent = sum(p.amount for p in payments)
    total_payments_count = len(payments)

    attributed_amount = 0.0
    category_breakdown = {"card": 0.0, "upi": 0.0, "netbanking": 0.0, "wallet": 0.0}

    for p in payments:
        pm_id = getattr(p, "payment_method_id", None)
        if pm_id:
            pm = db.query(PaymentMethod).filter(PaymentMethod.id == pm_id).first()
            if pm and pm.method_type in category_breakdown:
                category_breakdown[pm.method_type] += p.amount
                attributed_amount += p.amount

    unattributed_amount = total_spent - attributed_amount

    return {
        "total_spent": round(total_spent, 2),
        "total_payments_count": total_payments_count,
        "attributed_amount": round(attributed_amount, 2),
        "unattributed_amount": round(unattributed_amount, 2),
        "category_breakdown": {k: round(v, 2) for k, v in category_breakdown.items()}
    }
