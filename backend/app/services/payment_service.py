from sqlalchemy.orm import Session
from typing import Optional
import uuid
from app import models
from app.repositories import payment_repository
from app.database.unit_of_work import UnitOfWork
from app.core import exceptions

def create_payment(
    db: Session,
    customer_id: int,
    invoice_id: int,
    amount: float,
    status: models.PaymentStatus
) -> models.Payment:
    uow = UnitOfWork(db)
    transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    
    currency_code = "INR"
    exchange_rate = 1.0
    base_currency = "INR"
    invoice = uow.session.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if invoice:
        currency_code = invoice.currency_code
        exchange_rate = getattr(invoice, "exchange_rate", 1.0)
        base_currency = getattr(invoice, "base_currency", "INR")
    elif customer_id:
        customer = uow.session.query(models.Customer).filter(models.Customer.id == customer_id).first()
        if customer and customer.currency_code:
            currency_code = customer.currency_code
        from app.services.exchange_rate_service import ExchangeRateService
        base_currency = ExchangeRateService.get_reporting_currency(db)
        exchange_rate = ExchangeRateService.get_rate(db, currency_code, base_currency)

    payment_data = {
        "customer_id": customer_id,
        "invoice_id": invoice_id,
        "amount": amount,
        "currency_code": currency_code,
        "exchange_rate": exchange_rate,
        "base_currency": base_currency,
        "status": status,
        "transaction_id": transaction_id
    }
    return payment_repository.create_payment(uow.session, payment_data)

def get_payment_method_display(payment_method) -> Optional[str]:
    if not payment_method:
        return None
    m_type = payment_method.method_type.lower() if payment_method.method_type else ""
    if m_type == "card":
        return "Credit Card"
    elif m_type == "upi":
        return "UPI"
    elif m_type == "netbanking":
        return "Net Banking"
    elif m_type == "wallet":
        return "Digital Wallet"
    return payment_method.display_name or payment_method.provider or None

def get_admin_payments(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    paymentMethod: Optional[str] = None,
    page: int = 1,
    limit: int = 5
):
    uow = UnitOfWork(db)
    payments_list, total_count, stats, revenue_stats = payment_repository.get_payments_paginated(
        uow.session, search, status, paymentMethod, page, limit
    )

    formatted = []
    for p in payments_list:
        formatted.append({
            "id": p.id,
            "customerId": p.customer_id,
            "customerName": p.customer.name if p.customer else "",
            "invoiceId": p.invoice_id,
            "amount": p.amount,
            "paymentMethod": get_payment_method_display(p.payment_method),
            "transactionId": p.transaction_id or "",
            "status": "PAID" if p.status == models.PaymentStatus.SUCCESS else "FAILED",
            "paymentDate": p.created_at.strftime("%Y-%m-%d") if p.created_at else ""
        })

    return {
        "payments": formatted,
        "totalCount": total_count,
        "stats": stats,
        "revenueStats": revenue_stats
    }

def get_admin_payment_by_id(db: Session, payment_id: int):
    uow = UnitOfWork(db)
    payment = payment_repository.get_payment_by_id(uow.session, payment_id)
    if not payment:
        raise exceptions.ResourceNotFound("Payment not found")
    return payment


def create_mock_payment(
    db: Session,
    customer_id: int,
    invoice_id: int,
    amount: float
) -> models.Payment:
    uow = UnitOfWork(db)
    transaction_id = f"txn_{uuid.uuid4().hex}"

    invoice = uow.session.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    currency_code = "INR"
    if invoice:
        amount = invoice.total_amount
        currency_code = invoice.currency_code
    elif customer_id:
        customer = uow.session.query(models.Customer).filter(models.Customer.id == customer_id).first()
        if customer and customer.currency_code:
            currency_code = customer.currency_code
    
    # Lookup customer default or active payment method
    default_pm = (
        uow.session.query(models.PaymentMethod)
        .filter(
            models.PaymentMethod.customer_id == customer_id,
            models.PaymentMethod.is_default == True,
            models.PaymentMethod.is_active == True
        )
        .first()
    )
    if not default_pm:
        default_pm = (
            uow.session.query(models.PaymentMethod)
            .filter(
                models.PaymentMethod.customer_id == customer_id,
                models.PaymentMethod.is_active == True
            )
            .first()
        )

    payment_data = {
        "customer_id": customer_id,
        "invoice_id": invoice_id,
        "amount": amount,
        "currency_code": currency_code,
        "status": models.PaymentStatus.PENDING,
        "transaction_id": transaction_id,
        "payment_method_id": default_pm.id if default_pm else None
    }
    payment = payment_repository.create_payment(uow.session, payment_data)
    uow.commit()
    return payment


from typing import Optional

def complete_mock_payment(
    db: Session,
    payment_id: int,
    result: str,
    current_user: models.Customer,
    payment_method_id: Optional[int] = None
) -> models.Payment:
    from fastapi import HTTPException
    from datetime import datetime
    
    uow = UnitOfWork(db)
    payment = uow.session.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    # Ownership Validation
    if payment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this payment")
        
    # Duplicate Completion Protection
    status_val = payment.status.value if hasattr(payment.status, 'value') else str(payment.status)
    if status_val.upper() != "PENDING":
        if payment_method_id and not payment.payment_method_id:
            payment.payment_method_id = payment_method_id
            uow.commit()
        return payment
        
    invoice = payment.invoice
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    subscription = uow.session.query(models.Subscription).filter(models.Subscription.id == invoice.subscription_id).first()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    if result == "SUCCESS":
        # Payment Amount Validation
        inv_amt = getattr(invoice, 'total_amount', None)
        if inv_amt is None:
            inv_amt = invoice.amount
            
        if abs(float(payment.amount) - float(inv_amt)) > 0.05:
            raise HTTPException(status_code=422, detail="Payment amount mismatch")
            
        payment.status = models.PaymentStatus.SUCCESS
        invoice.status = models.InvoiceStatus.PAID
        
        # Attach payment method ID (passed in or customer default)
        if payment_method_id:
            payment.payment_method_id = payment_method_id
        elif not payment.payment_method_id:
            default_pm = (
                uow.session.query(models.PaymentMethod)
                .filter(
                    models.PaymentMethod.customer_id == current_user.id,
                    models.PaymentMethod.is_default == True,
                    models.PaymentMethod.is_active == True
                )
                .first()
            )
            if default_pm:
                payment.payment_method_id = default_pm.id
        
        is_upgrade = (invoice.invoice_type == "PLAN_UPGRADE")
        is_activation = (subscription.status == models.SubscriptionStatus.PENDING_ACTIVATION)
        old_plan_name = invoice.previous_plan_name or "Previous Plan"
        
        # New Subscription Activation
        if is_activation:
            subscription.status = models.SubscriptionStatus.ACTIVE
            subscription.activated_at = datetime.utcnow()
            
        # Upgrade Activation
        if is_upgrade:
            subscription.plan_id = invoice.new_plan_id
            subscription.status = models.SubscriptionStatus.ACTIVE
            subscription.billing_price = invoice.new_plan_price if invoice.new_plan_price is not None else subscription.billing_price
            subscription.currency_code = invoice.currency_code if invoice.currency_code else subscription.currency_code
            price_id = db.query(models.PlanPrice.id).filter(
                models.PlanPrice.plan_id == invoice.new_plan_id,
                models.PlanPrice.price == invoice.new_plan_price,
                models.PlanPrice.currency_code == invoice.currency_code,
                models.PlanPrice.is_active == True
            ).first()
            if price_id:
                subscription.plan_price_id = price_id[0]
            if subscription.plan:
                subscription.billing_interval = subscription.plan.billing_interval

        # Commit database transaction FIRST so PostgreSQL reflects committed PAID status
        uow.commit()

        # Celery Email Tasks
        from app.celery_worker import safe_task_delay
        from app.email_tasks import (
            send_payment_success_email_task,
            send_subscription_activated_email_task,
            send_plan_upgraded_email_task
        )

        if is_upgrade:
            safe_task_delay(
                send_plan_upgraded_email_task,
                current_user.name,
                current_user.email,
                old_plan_name,
                subscription.plan.name if subscription.plan else "New Plan",
                invoice.total_amount,
                datetime.utcnow().strftime("%Y-%m-%d")
            )
        elif is_activation:
            plan_name = subscription.plan.name if subscription.plan else "Standard"
            plan_price = subscription.billing_price
            interval_str = subscription.billing_interval.value if hasattr(subscription.billing_interval, 'value') else str(subscription.billing_interval)
            safe_task_delay(
                send_subscription_activated_email_task,
                current_user.name,
                current_user.email,
                plan_name,
                plan_price,
                interval_str,
                datetime.utcnow().strftime("%Y-%m-%d"),
                (datetime.utcnow()).strftime("%Y-%m-%d")
            )

        safe_task_delay(
            send_payment_success_email_task,
            current_user.name,
            current_user.email,
            invoice.invoice_number
        )

        # Dispatch Webhook Events
        from app.services import webhook_service
        webhook_service.dispatch_webhook_event(db, "payment.success", {
            "payment_id": payment.id,
            "transaction_id": payment.transaction_id,
            "amount": payment.amount,
            "currency": invoice.currency_code if invoice.currency_code else "INR",
            "invoice_number": invoice.invoice_number,
            "customer_id": current_user.id,
            "customer_email": current_user.email
        })
        webhook_service.dispatch_webhook_event(db, "invoice.paid", {
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "total_amount": invoice.total_amount,
            "status": "PAID",
            "customer_id": current_user.id
        })
        if is_activation:
            webhook_service.dispatch_webhook_event(db, "subscription.activated", {
                "subscription_id": subscription.id,
                "customer_id": current_user.id,
                "plan_name": subscription.plan.name if subscription.plan else "Plan",
                "status": "ACTIVE"
            })
        if is_upgrade:
            webhook_service.dispatch_webhook_event(db, "subscription.upgraded", {
                "subscription_id": subscription.id,
                "customer_id": current_user.id,
                "previous_plan_name": old_plan_name,
                "new_plan_name": subscription.plan.name if subscription.plan else "New Plan",
                "status": "ACTIVE"
            })

    elif result in ["FAILED", "CANCELLED"]:
        payment.status = models.PaymentStatus.FAILED if result == "FAILED" else models.PaymentStatus.CANCELLED
        invoice.status = models.InvoiceStatus.UNPAID if result == "FAILED" else models.InvoiceStatus.CANCELLED

        if result == "FAILED":
            from app.services.retry_service import RetryService
            RetryService.handle_failed_payment(db, payment.id, "Mock payment transaction failed")

        uow.commit()

        from app.celery_worker import safe_task_delay
        from app.email_tasks import send_payment_failed_email_task
        safe_task_delay(
            send_payment_failed_email_task,
            current_user.name,
            current_user.email,
            invoice.invoice_number
        )

        from app.services import webhook_service
        webhook_service.dispatch_webhook_event(db, "payment.failed", {
            "payment_id": payment.id,
            "transaction_id": payment.transaction_id,
            "amount": payment.amount,
            "status": payment.status.value,
            "invoice_number": invoice.invoice_number,
            "customer_id": current_user.id
        })
        webhook_service.dispatch_webhook_event(db, "invoice.failed", {
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "total_amount": invoice.total_amount,
            "status": invoice.status.value,
            "customer_id": current_user.id
        })
        
    else:
        raise HTTPException(status_code=400, detail="Invalid payment result")
        
    return payment


def estimate_tax(base_amount: float, gst_rate: float = 18.0) -> dict:
    """
    [DEPRECATED] Estimates tax breakdown. Use TaxService.calculate_tax instead.
    """
    from app.core.billing_utils import calculate_gst_breakdown
    if gst_rate == 18.0:
        breakdown = calculate_gst_breakdown(base_amount, pricing_model="GST_EXCLUSIVE")
        return {
            "base_amount": breakdown["base_amount"],
            "gst_rate": 18.0,
            "gst_amount": breakdown["gst_amount"],
            "total_amount": breakdown["total_amount"]
        }
    else:
        gst_amount = round(base_amount * (gst_rate / 100.0), 2)
        total_amount = round(base_amount + gst_amount, 2)
        return {
            "base_amount": round(base_amount, 2),
            "gst_rate": gst_rate,
            "gst_amount": gst_amount,
            "total_amount": total_amount
        }

