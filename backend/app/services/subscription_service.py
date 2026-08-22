from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from app import models, schemas
from app.models import SubscriptionStatus
from app.services import invoice_service, payment_service
from app.services.audit_service import log_audit_event
from app.repositories import subscription_repository
from app.database.unit_of_work import UnitOfWork
from app.core import exceptions

def resolve_plan_price_and_currency(session: Session, plan: models.Plan, customer: models.Customer) -> tuple:
    """
    Resolves the price, currency code, and plan_price_id for a given plan and customer.
    Tries to match by plan ID, customer's currency, and billing interval.
    If no match, falls back to the plan's default pricing.
    If still no match, falls back to plan.price, 'INR', and None.
    """
    p_code = customer.currency_code if customer.currency_code else "INR"
    match = (
        session.query(models.PlanPrice)
        .filter(
            models.PlanPrice.plan_id == plan.id,
            models.PlanPrice.currency_code == p_code,
            models.PlanPrice.billing_interval == plan.billing_interval,
            models.PlanPrice.is_active == True
        )
        .first()
    )
    if match:
        return match.price, match.currency_code, match.id

    fallback = (
        session.query(models.PlanPrice)
        .filter(
            models.PlanPrice.plan_id == plan.id,
            models.PlanPrice.is_default == True,
            models.PlanPrice.is_active == True
        )
        .first()
    )
    if fallback:
        return fallback.price, fallback.currency_code, fallback.id

    return plan.price, "INR", None


def create_subscription(
    db: Session,
    sub: schemas.SubscriptionCreate,
    current_user: models.Customer
) -> models.Subscription:
    uow = UnitOfWork(db)
    plan = subscription_repository.get_plan_by_id(uow.session, sub.plan_id)
    customer = subscription_repository.get_customer_by_id(uow.session, sub.customer_id)

    # Customer can only create subscription for themselves
    if (
        current_user.role == models.UserRole.CUSTOMER
        and current_user.id != sub.customer_id
    ):
        raise exceptions.AuthorizationFailed("You can only create subscriptions for yourself.")

    if not plan:
        raise exceptions.ResourceNotFound(f"Plan ID {sub.plan_id} not found")

    if not customer:
        raise exceptions.ResourceNotFound(f"Customer ID {sub.customer_id} not found")

    try:
        now = datetime.utcnow()

        # Resolve regional price and currency
        resolved_price, resolved_currency, resolved_price_id = resolve_plan_price_and_currency(uow.session, plan, customer)

        # Decide initial status
        is_free_trial = resolved_price == 0 or plan.trial_period_days > 0
        initial_status = (
            SubscriptionStatus.TRIAL
            if is_free_trial
            else SubscriptionStatus.PENDING_ACTIVATION
        )

        # Auto-cancel any existing ACTIVE, TRIAL, PENDING_ACTIVATION, or PAUSED subscriptions for this customer
        existing_active_subs = (
            uow.session.query(models.Subscription)
            .filter(
                models.Subscription.customer_id == sub.customer_id,
                models.Subscription.status.in_([
                    SubscriptionStatus.ACTIVE,
                    SubscriptionStatus.TRIAL,
                    SubscriptionStatus.PENDING_ACTIVATION,
                    SubscriptionStatus.PAUSED
                ])
            )
            .all()
        )
        for prev_sub in existing_active_subs:
            prev_sub.status = SubscriptionStatus.CANCELLED
            prev_sub.cancelled_at = now
            log_audit_event(
                uow.session,
                "Subscription Cancelled",
                f"Prior Subscription {prev_sub.id} automatically cancelled due to new subscription creation.",
                customer_id=sub.customer_id
            )

        # Create Subscription
        sub_data = {
            "customer_id": sub.customer_id,
            "plan_id": sub.plan_id,
            "status": initial_status,
            "created_at": now,
            "trial_started_at": now if initial_status == SubscriptionStatus.TRIAL else None,
            "activated_at": None,
            "trial_status": "ACTIVE" if initial_status == SubscriptionStatus.TRIAL else None,
            "currency_code": resolved_currency,
            "billing_price": resolved_price,
            "billing_interval": plan.billing_interval,
            "plan_price_id": resolved_price_id
        }
        new_sub = subscription_repository.create_subscription(uow.session, sub_data)
        
        if initial_status == SubscriptionStatus.TRIAL:
            customer.has_used_trial = True

        # ----------------------------
        # BILLING ENGINE
        # ----------------------------

        if plan.trial_period_days > 0:
            renewal_date = (
                now +
                timedelta(
                    days=plan.trial_period_days
                )
            )
        else:
            renewal_date = now

        if plan.billing_interval == models.BillingInterval.MONTHLY:
            end_date = (
                renewal_date +
                timedelta(days=30)
            )
        else:
            end_date = (
                renewal_date +
                timedelta(days=365)
            )

        cycle_data = {
            "customer_id": sub.customer_id,
            "subscription_id": new_sub.id,
            "start_date": now,
            "end_date": end_date,
            "renewal_date": renewal_date,
            "next_billing_date": renewal_date
        }
        subscription_repository.create_billing_cycle(uow.session, cycle_data)

        # ----------------------------
        # PURCHASE AUTOMATION (IF PAID OR WAITING)
        # ----------------------------
        invoice = None
        payment = None
        if initial_status == SubscriptionStatus.PENDING_ACTIVATION:
            # Create Invoice as UNPAID
            invoice = invoice_service.create_invoice(
                db=uow.session,
                customer_id=sub.customer_id,
                subscription_id=new_sub.id,
                base_amount=resolved_price,
                status=models.InvoiceStatus.UNPAID,
                invoice_type="NEW_SUBSCRIPTION",
                new_plan_id=plan.id,
                new_plan_name=plan.name,
                new_plan_price=resolved_price,
                upgrade_difference=resolved_price,
                currency_code=resolved_currency
            )
            # Create Pending Payment
            payment = payment_service.create_mock_payment(
                db=uow.session,
                customer_id=sub.customer_id,
                invoice_id=invoice.id,
                amount=invoice.total_amount
            )
            new_sub.pending_payment_id = payment.id
            new_sub.pending_invoice_id = invoice.id
            
            # Audit Logs
            log_audit_event(uow.session, "Invoice Generated", f"Invoice {invoice.invoice_number} generated for plan purchase.", sub.customer_id)



        # ----------------------------
        # AUDIT LOG
        # ----------------------------
        log_audit_event(
            uow.session,
            "Subscription Created",
            f"Subscription {new_sub.id} created successfully",
            customer_id=sub.customer_id
        )

        uow.commit()

        return new_sub

    except exceptions.AppException as e:
        uow.rollback()
        raise e
    except Exception as e:
        uow.rollback()
        raise exceptions.AppException(f"Database Error: {str(e)}")

def get_subscriptions(
    db: Session,
    current_user: models.Customer
) -> List[models.Subscription]:
    uow = UnitOfWork(db)
    if current_user.role == models.UserRole.ADMIN:
        return subscription_repository.get_all_subscriptions(uow.session)

    return subscription_repository.get_subscriptions_by_customer_id(uow.session, current_user.id)

def get_subscription_by_id(
    db: Session,
    sub_id: int,
    current_user: models.Customer
) -> models.Subscription:
    uow = UnitOfWork(db)
    subscription = subscription_repository.get_subscription_by_id(uow.session, sub_id)

    if not subscription:
        raise exceptions.ResourceNotFound("Subscription not found")

    if (
        current_user.role == models.UserRole.CUSTOMER
        and current_user.id != subscription.customer_id
    ):
        raise exceptions.AuthorizationFailed("You can only view your own subscription.")

    return subscription

def get_subscriptions_by_status(
    db: Session,
    status: SubscriptionStatus
) -> List[models.Subscription]:
    uow = UnitOfWork(db)
    return subscription_repository.get_subscriptions_by_status(uow.session, status)

def get_customer_subscriptions(
    db: Session,
    customer_id: int,
    current_user: models.Customer
) -> List[models.Subscription]:
    uow = UnitOfWork(db)
    if (
        current_user.role == models.UserRole.CUSTOMER
        and current_user.id != customer_id
    ):
        raise exceptions.AuthorizationFailed("You can only view your own subscriptions")
    return subscription_repository.get_subscriptions_by_customer_id(uow.session, customer_id)

def transition_subscription(
    db: Session,
    sub_id: int,
    update: schemas.StatusTransitionUpdate,
    current_user: models.Customer
) -> models.Subscription:
    uow = UnitOfWork(db)
    sub = subscription_repository.get_subscription_by_id(uow.session, sub_id)
    if not sub:
        raise exceptions.ResourceNotFound("Subscription instance not found")

    if (
        current_user.role == models.UserRole.CUSTOMER
        and current_user.id != sub.customer_id
    ):
         raise exceptions.AuthorizationFailed("You can only modify your own subscription.")
    
    old_state = sub.status
    new_state = update.new_status
    
    VALID_TRANSITIONS = {
        SubscriptionStatus.TRIAL: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.CANCELLED
        ],
        SubscriptionStatus.ACTIVE: [
            SubscriptionStatus.PAST_DUE,
            SubscriptionStatus.PAUSED,
            SubscriptionStatus.CANCELLED
        ],
        SubscriptionStatus.PAUSED: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.CANCELLED
        ],
        SubscriptionStatus.PAST_DUE: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.CANCELLED
        ],
        SubscriptionStatus.CANCELLED: []
    }
    
    if new_state not in VALID_TRANSITIONS.get(old_state, []):
        raise exceptions.BusinessRuleViolation(f"Invalid execution path from {old_state} to {new_state}")
    
    sub.status = new_state
    now = datetime.utcnow()
    invoice = None
    payment = None
    email_trigger_type = None

    if new_state == SubscriptionStatus.ACTIVE:
        sub.activated_at = now
        sub.past_due_at = None
        plan = sub.plan
        
        is_first_paid = (old_state == SubscriptionStatus.TRIAL)
        inv_type = "NEW_SUBSCRIPTION" if is_first_paid else "RENEWAL"
        prev_name = "Free Trial" if is_first_paid else plan.name
        prev_price = 0.0 if is_first_paid else sub.billing_price
        diff = sub.billing_price if is_first_paid else 0.0

        # Generate Invoice and Payment Success
        invoice = invoice_service.create_invoice(
            uow.session, 
            sub.customer_id, 
            sub.id, 
            sub.billing_price, 
            models.InvoiceStatus.PAID, 
            invoice_type=inv_type,
            previous_plan_name=prev_name,
            previous_plan_price=prev_price,
            new_plan_name=plan.name,
            new_plan_price=sub.billing_price,
            upgrade_difference=diff,
            currency_code=sub.currency_code
        )
        payment = payment_service.create_payment(
            uow.session, 
            sub.customer_id, 
            invoice.id, 
            invoice.total_amount, 
            models.PaymentStatus.SUCCESS
        )

        # Update Billing Cycle
        cycle = subscription_repository.get_billing_cycle_by_sub_id(uow.session, sub.id)
        if cycle:
            days = 30 if plan.billing_interval == models.BillingInterval.MONTHLY else 365
            cycle.start_date = now
            cycle.end_date = now + timedelta(days=days)
            cycle.renewal_date = now + timedelta(days=days)
            cycle.next_billing_date = now + timedelta(days=days)

        log_audit_event(uow.session, "Invoice Generated", f"Invoice {invoice.invoice_number} generated for subscription {sub.id}.", sub.customer_id)
        log_audit_event(uow.session, "Payment Successful", f"Payment successful for invoice {invoice.invoice_number}.", sub.customer_id)
        log_audit_event(uow.session, "Subscription Activated", f"Subscription {sub.id} activated.", sub.customer_id)
        email_trigger_type = "ACTIVE_PURCHASE"

    elif new_state == SubscriptionStatus.PAST_DUE:
        sub.past_due_at = now
        if old_state == SubscriptionStatus.TRIAL:
            log_audit_event(uow.session, "Subscription Past Due", f"Trial subscription {sub.id} expired.", sub.customer_id)
            email_trigger_type = "TRIAL_EXPIRED"
        else:
            plan = sub.plan
            
            is_first_paid = (old_state == SubscriptionStatus.TRIAL)
            inv_type = "NEW_SUBSCRIPTION" if is_first_paid else "RENEWAL"
            prev_name = "Free Trial" if is_first_paid else plan.name
            prev_price = 0.0 if is_first_paid else sub.billing_price
            diff = sub.billing_price if is_first_paid else 0.0

            invoice = invoice_service.create_invoice(
                uow.session, 
                sub.customer_id, 
                sub.id, 
                sub.billing_price, 
                models.InvoiceStatus.FAILED, 
                invoice_type=inv_type,
                previous_plan_name=prev_name,
                previous_plan_price=prev_price,
                new_plan_name=plan.name,
                new_plan_price=sub.billing_price,
                upgrade_difference=diff,
                currency_code=sub.currency_code
            )
            payment = payment_service.create_payment(
                uow.session, 
                sub.customer_id, 
                invoice.id, 
                invoice.total_amount, 
                models.PaymentStatus.FAILED
            )

            log_audit_event(uow.session, "Invoice Generated", f"Invoice {invoice.invoice_number} generated (Failed status) for subscription {sub.id}.", sub.customer_id)
            log_audit_event(uow.session, "Payment Failed", f"Payment failed for invoice {invoice.invoice_number}.", sub.customer_id)
            log_audit_event(uow.session, "Subscription Past Due", f"Subscription {sub.id} set to past due.", sub.customer_id)
            email_trigger_type = "ACTIVE_FAILED"

    elif new_state == SubscriptionStatus.CANCELLED:
        sub.cancelled_at = now
        log_audit_event(uow.session, "Subscription Cancelled", f"Subscription {sub.id} cancelled.", sub.customer_id)
        email_trigger_type = "CANCELLED"

    # Default general Status Changed audit log
    log_audit_event(
        uow.session,
        "Status Changed",
        f"Subscription {sub.id} status changed from {old_state.value} to {new_state.value}.",
        customer_id=sub.customer_id
    )

    uow.commit()

    # Trigger emails
    from app.celery_worker import safe_task_delay
    if email_trigger_type == "ACTIVE_PURCHASE" and invoice is not None:
        from app.email_tasks import send_subscription_activated_email_task, send_invoice_email_task, send_payment_success_email_task
        safe_task_delay(
            send_subscription_activated_email_task,
            sub.customer.name,
            sub.customer.email,
            sub.plan.name,
            sub.plan.price,
            sub.plan.billing_interval.value,
            now.strftime("%Y-%m-%d"),
            (now + timedelta(days=30 if sub.plan.billing_interval == models.BillingInterval.MONTHLY else 365)).strftime("%Y-%m-%d")
        )

        safe_task_delay(
            send_payment_success_email_task,
            sub.customer.name,
            sub.customer.email,
            invoice.invoice_number
        )
    elif email_trigger_type == "TRIAL_EXPIRED":
        from app.email_tasks import send_trial_expired_email_task
        safe_task_delay(send_trial_expired_email_task, sub.customer.name, sub.customer.email)
    elif email_trigger_type == "ACTIVE_FAILED" and invoice is not None:
        from app.email_tasks import send_invoice_email_task, send_payment_failed_email_task
        safe_task_delay(
            send_invoice_email_task,
            sub.customer.name,
            sub.customer.email,
            invoice.invoice_number,
            invoice.amount,
            invoice.due_date.strftime("%Y-%m-%d")
        )
        safe_task_delay(
            send_payment_failed_email_task,
            sub.customer.name,
            sub.customer.email,
            invoice.invoice_number
        )
    elif email_trigger_type == "CANCELLED":
        from app.email_tasks import send_plan_cancellation_email_task
        safe_task_delay(send_plan_cancellation_email_task, sub.customer.name, sub.customer.email, now.strftime("%Y-%m-%d"))
        
    return sub

def change_subscription_plan(
    db: Session,
    sub_id: int,
    request: schemas.ChangePlanRequest,
    current_user: models.Customer
) -> models.Subscription:
    uow = UnitOfWork(db)
    sub = subscription_repository.get_subscription_by_id(uow.session, sub_id)

    if not sub:
        raise exceptions.ResourceNotFound("Subscription not found")
    if (
        current_user.role == models.UserRole.CUSTOMER
        and current_user.id != sub.customer_id
    ):
        raise exceptions.AuthorizationFailed("You can only change your own subscription.")

    if sub.status not in [
        models.SubscriptionStatus.ACTIVE,
        models.SubscriptionStatus.PAUSED,
        models.SubscriptionStatus.TRIAL,
        models.SubscriptionStatus.PENDING_ACTIVATION
    ]:
        raise exceptions.BusinessRuleViolation("Cancelled or expired subscriptions cannot be modified. Please purchase a new subscription.")

    old_plan = sub.plan
    new_plan = subscription_repository.get_plan_by_id(uow.session, request.new_plan_id)

    if not new_plan:
        raise exceptions.ResourceNotFound("New plan not found")

    # Check if they are transitioning from a trial
    customer = sub.customer
    new_resolved_price, new_resolved_currency, new_resolved_price_id = resolve_plan_price_and_currency(uow.session, new_plan, customer)

    # Check if they are transitioning from a trial
    is_trial_conversion = (sub.status == models.SubscriptionStatus.TRIAL or old_plan.trial_period_days > 0 or sub.billing_price == 0)

    # Proration engine calculations
    now = datetime.utcnow()
    cycle = subscription_repository.get_billing_cycle_by_sub_id(uow.session, sub.id)
    
    if cycle:
        total_days = (cycle.end_date - cycle.start_date).days
        if total_days <= 0:
            total_days = 30
        
        remaining_time = cycle.end_date - now
        remaining_days = remaining_time.total_seconds() / 86400.0
        if remaining_days < 0:
            remaining_days = 0.0
        if remaining_days > total_days:
            remaining_days = float(total_days)
            
        remaining_ratio = remaining_days / total_days
        unused_credit = round(sub.billing_price * remaining_ratio, 2)
        new_plan_cost = round(new_resolved_price * remaining_ratio, 2)
        final_amount = round(new_plan_cost - unused_credit, 2)
    else:
        total_days = 30
        remaining_days = 30.0
        remaining_ratio = 1.0
        unused_credit = sub.billing_price
        new_plan_cost = new_resolved_price
        final_amount = new_resolved_price - sub.billing_price

    is_upgrade = new_resolved_price > sub.billing_price

    if is_upgrade:
        # Check if an existing unpaid upgrade invoice and pending payment session exists
        existing_invoice = (
            uow.session.query(models.Invoice)
            .filter(
                models.Invoice.subscription_id == sub.id,
                models.Invoice.new_plan_id == new_plan.id,
                models.Invoice.status == models.InvoiceStatus.UNPAID
            )
            .first()
        )
        if existing_invoice:
            existing_payment = (
                uow.session.query(models.Payment)
                .filter(
                    models.Payment.invoice_id == existing_invoice.id,
                    models.Payment.status == models.PaymentStatus.PENDING
                )
                .first()
            )
            if existing_payment:
                sub.pending_payment_id = existing_payment.id
                sub.pending_invoice_id = existing_invoice.id
                return sub

        # Charge customer final_amount if positive
        final_payable = final_amount if final_amount > 0.0 else 0.0

        # Create Upgrade Invoice as UNPAID
        invoice = invoice_service.create_invoice(
            db=uow.session, 
            customer_id=sub.customer_id, 
            subscription_id=sub.id, 
            base_amount=final_payable, 
            status=models.InvoiceStatus.UNPAID, 
            invoice_type="PLAN_UPGRADE",
            previous_plan_id=old_plan.id,
            previous_plan_name=old_plan.name,
            previous_plan_price=sub.billing_price,
            new_plan_id=new_plan.id,
            new_plan_name=new_plan.name,
            new_plan_price=new_resolved_price,
            upgrade_difference=final_amount,
            proration_credit=unused_credit,
            proration_debit=new_plan_cost,
            currency_code=new_resolved_currency
        )
        
        # Create Pending Payment session
        payment = payment_service.create_mock_payment(
            db=uow.session, 
            customer_id=sub.customer_id, 
            invoice_id=invoice.id, 
            amount=invoice.total_amount
        )

        sub.pending_payment_id = payment.id
        sub.pending_invoice_id = invoice.id

        log_audit_event(uow.session, "Invoice Generated", f"Invoice {invoice.invoice_number} generated for plan upgrade.", sub.customer_id)
        
        uow.commit()
        return sub

    else:
        # Perform plan change immediately (downgrades / same price changes)
        sub.plan_id = request.new_plan_id
        sub.billing_price = new_resolved_price
        sub.currency_code = new_resolved_currency
        sub.billing_interval = new_plan.billing_interval
        sub.plan_price_id = new_resolved_price_id
        
        if is_trial_conversion:
            sub.trial_status = "CONVERTED"
            sub.customer.has_used_trial = True
            if sub.status == models.SubscriptionStatus.TRIAL:
                sub.status = models.SubscriptionStatus.ACTIVE
                sub.activated_at = now
                
        # Update Billing Cycle renewal dates immediately
        if cycle:
            days = 30 if new_plan.billing_interval == models.BillingInterval.MONTHLY else 365
            cycle.end_date = cycle.start_date + timedelta(days=days)
            cycle.renewal_date = cycle.start_date + timedelta(days=days)
            cycle.next_billing_date = cycle.start_date + timedelta(days=days)

        # Generate Downgrade Invoice (records proration credit, base_amount = 0.0 since we do not auto-refund)
        proration_credit_val = abs(final_amount) if final_amount < 0.0 else 0.0
        
        invoice = invoice_service.create_invoice(
            db=uow.session,
            customer_id=sub.customer_id,
            subscription_id=sub.id,
            base_amount=0.0,
            status=models.InvoiceStatus.PAID,
            invoice_type="PLAN_DOWNGRADE",
            previous_plan_id=old_plan.id,
            previous_plan_name=old_plan.name,
            previous_plan_price=sub.billing_price,
            new_plan_id=new_plan.id,
            new_plan_name=new_plan.name,
            new_plan_price=new_resolved_price,
            upgrade_difference=final_amount,
            proration_credit=proration_credit_val,
            proration_debit=new_plan_cost,
            currency_code=new_resolved_currency
        )

        log_audit_event(uow.session, "Invoice Generated", f"Invoice {invoice.invoice_number} generated for plan downgrade.", sub.customer_id)
        log_audit_event(uow.session, "Plan Downgraded", f"Subscription {sub.id} downgraded from plan '{old_plan.name}' to '{new_plan.name}'. Unused credit: {unused_credit}, New cost: {new_plan_cost}.", sub.customer_id)
        
        log_audit_event(
            uow.session,
            "Plan Changed",
            f"Subscription {sub.id} changed plan from '{old_plan.name}' to '{new_plan.name}'.",
            customer_id=sub.customer_id
        )

        from app.services import webhook_service
        webhook_service.dispatch_webhook_event(uow.session, "subscription.downgraded", {
            "subscription_id": sub.id,
            "customer_id": sub.customer_id,
            "previous_plan_name": old_plan.name,
            "new_plan_name": new_plan.name,
            "status": sub.status.value
        })

        uow.commit()
        
        from app.celery_worker import safe_task_delay
        from app.email_tasks import send_plan_downgraded_email_task
        explanation = f"Your subscription has been downgraded to the {new_plan.name} tier. You will be billed {new_resolved_currency} {new_resolved_price:.2f} starting on your next billing date."
        safe_task_delay(
            send_plan_downgraded_email_task,
            sub.customer.name,
            sub.customer.email,
            old_plan.name,
            new_plan.name,
            now.strftime("%Y-%m-%d"),
            explanation
        )
        return sub

def pause_subscription(
    db: Session,
    sub_id: int,
    current_user: models.Customer
) -> models.Subscription:
    uow = UnitOfWork(db)
    sub = subscription_repository.get_subscription_by_id(uow.session, sub_id)

    if not sub:
        raise exceptions.ResourceNotFound("Subscription not found")
    if (
        current_user.role == models.UserRole.CUSTOMER
        and current_user.id != sub.customer_id
    ):
        raise exceptions.AuthorizationFailed("You can only pause your own subscription.")

    if sub.status != SubscriptionStatus.ACTIVE:
        raise exceptions.BusinessRuleViolation("Only active subscriptions can be paused")
        
    sub.status = SubscriptionStatus.PAUSED
    sub.paused_at = datetime.utcnow()

    log_audit_event(
        uow.session,
        "Subscription Paused",
        f"Subscription {sub.id} paused",
        customer_id=sub.customer_id
    )

    uow.commit()

    return sub

def resume_subscription(
    db: Session,
    sub_id: int,
    current_user: models.Customer
) -> models.Subscription:
    uow = UnitOfWork(db)
    sub = subscription_repository.get_subscription_by_id(uow.session, sub_id)

    if not sub:
        raise exceptions.ResourceNotFound("Subscription not found")
    if (
        current_user.role == models.UserRole.CUSTOMER
        and current_user.id != sub.customer_id
    ):
        raise exceptions.AuthorizationFailed("You can only resume your own subscription.")

    if sub.status != SubscriptionStatus.PAUSED:
        raise exceptions.BusinessRuleViolation("Subscription is not paused")

    sub.status = SubscriptionStatus.ACTIVE
    sub.paused_at = None

    log_audit_event(
        uow.session,
        "Subscription Resumed",
        f"Subscription {sub.id} resumed",
        customer_id=sub.customer_id
    )

    uow.commit()

    return sub

def cancel_subscription(
    db: Session,
    sub_id: int,
    request: schemas.CancelSubscriptionRequest,
    current_user: models.Customer
) -> models.Subscription:
    uow = UnitOfWork(db)
    sub = subscription_repository.get_subscription_by_id(uow.session, sub_id)

    if not sub:
        raise exceptions.ResourceNotFound("Subscription not found")
    if (
        current_user.role == models.UserRole.CUSTOMER
        and current_user.id != sub.customer_id
    ):
        raise exceptions.AuthorizationFailed("You can only cancel your own subscription.")

    if sub.status == SubscriptionStatus.CANCELLED:
        raise exceptions.BusinessRuleViolation("Subscription already cancelled")

    now = datetime.utcnow()
    sub.status = SubscriptionStatus.CANCELLED
    sub.cancelled_at = now

    # Update Billing Cycle end date
    cycle = subscription_repository.get_billing_cycle_by_sub_id(uow.session, sub.id)
    if cycle:
        cycle.end_date = now

    log_audit_event(
        uow.session,
        "Subscription Cancelled",
        f"Subscription {sub.id} cancelled.",
        customer_id=sub.customer_id
    )

    from app.services import webhook_service
    webhook_service.dispatch_webhook_event(uow.session, "subscription.cancelled", {
        "subscription_id": sub.id,
        "customer_id": sub.customer_id,
        "status": "CANCELLED",
        "cancelled_at": now.isoformat()
    })

    uow.commit()

    # Trigger email notification
    from app.email_tasks import send_plan_cancellation_email_task
    from app.celery_worker import safe_task_delay
    safe_task_delay(send_plan_cancellation_email_task, sub.customer.name, sub.customer.email, now.strftime("%Y-%m-%d"))

    return sub


def calculate_proration_preview(db: Session, customer_id: int, target_plan_id: int) -> dict:
    from app.services.tax_service import TaxService
    from app.services.exchange_rate_service import ExchangeRateService

    uow = UnitOfWork(db)
    customer = uow.session.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise exceptions.ResourceNotFound("Customer not found")

    sub = (
        uow.session.query(models.Subscription)
        .filter(
            models.Subscription.customer_id == customer_id,
            models.Subscription.status.in_([
                models.SubscriptionStatus.ACTIVE,
                models.SubscriptionStatus.TRIAL,
                models.SubscriptionStatus.PAUSED,
                models.SubscriptionStatus.PENDING_ACTIVATION
            ])
        )
        .order_by(models.Subscription.id.desc())
        .first()
    )

    if not sub:
        raise exceptions.ResourceNotFound("No active or manageable subscription found for customer")

    target_plan = subscription_repository.get_plan_by_id(uow.session, target_plan_id)
    if not target_plan:
        raise exceptions.ResourceNotFound("Target plan not found")

    old_plan = sub.plan
    if not old_plan:
        raise exceptions.ResourceNotFound("Current plan not found")

    # Resolve Pricing & Currency
    target_plan_price, target_resolved_currency, target_price_id = resolve_plan_price_and_currency(uow.session, target_plan, customer)
    current_plan_price = sub.billing_price
    currency_code = sub.currency_code if sub.currency_code else "INR"

    # Resolve Reporting Base Currency & Exchange Rate
    base_cur = ExchangeRateService.get_reporting_currency(db)
    rate = ExchangeRateService.get_rate(db, currency_code, base_cur)

    now = datetime.utcnow()
    cycle = subscription_repository.get_billing_cycle_by_sub_id(uow.session, sub.id)

    if cycle and cycle.end_date and cycle.start_date:
        total_days = (cycle.end_date - cycle.start_date).days
        if total_days <= 0:
            total_days = 30

        remaining_time = cycle.end_date - now
        remaining_days_float = remaining_time.total_seconds() / 86400.0
        if remaining_days_float < 0:
            remaining_days_float = 0.0
        if remaining_days_float > total_days:
            remaining_days_float = float(total_days)

        remaining_ratio = round(remaining_days_float / total_days, 2)
        remaining_days = int(round(remaining_days_float))
    else:
        total_days = 30
        remaining_days = 30
        remaining_ratio = 1.0

    proration_credit = round(current_plan_price * remaining_ratio, 2)
    proration_debit = round(target_plan_price * remaining_ratio, 2)
    net_proration = round(proration_debit - proration_credit, 2)

    # Calculate Localized Taxes using Tax Service
    country = customer.country if customer else "India"
    c_code = customer.country_code if customer else "IN"
    t_reg = customer.tax_region if customer else "GST"
    t_exempt = customer.tax_exempt if customer else False

    final_payable = net_proration if net_proration > 0.0 else 0.0

    tax_breakdown = TaxService.calculate_tax(
        db=db, 
        base_amount=final_payable, 
        country=country, 
        country_code=c_code, 
        tax_region=t_reg, 
        tax_exempt=t_exempt
    )

    tax_name = tax_breakdown["tax_name"]
    tax_code = tax_breakdown["tax_code"]
    tax_percentage = tax_breakdown["tax_percentage"]
    tax_amount = tax_breakdown["tax_amount"]
    total_payable = tax_breakdown["total_amount"]

    symbol_map = {
        "INR": "₹",
        "JPY": "¥",
        "GBP": "£",
        "USD": "$",
        "EUR": "€",
        "CAD": "$",
        "AUD": "$",
        "SGD": "$",
        "AED": "د.إ"
    }
    currency_symbol = symbol_map.get(currency_code, "₹")

    price_breakdown = {
        "new_plan_price": target_plan_price,
        "old_plan_price": current_plan_price,
        "proration_ratio": remaining_ratio,
        "charge_amount": proration_debit,
        "credit_amount": proration_credit,
        "tax_percentage": tax_percentage,
        "tax_amount": tax_amount,
        "total_amount": total_payable
    }

    invoice_preview_items = [
        {"description": f"Prorated charge for {target_plan.name} Plan", "amount": proration_debit},
        {"description": f"Remaining credit from {old_plan.name} Plan", "amount": -proration_credit},
        {"description": f"{tax_name} ({tax_percentage}%)", "amount": tax_amount}
    ]

    return {
        "current_plan": {
            "id": old_plan.id,
            "name": old_plan.name,
            "price": current_plan_price
        },
        "target_plan": {
            "id": target_plan.id,
            "name": target_plan.name,
            "price": target_plan_price
        },
        "remaining_days": remaining_days,
        "remaining_ratio": remaining_ratio,
        "proration_credit": proration_credit,
        "proration_debit": proration_debit,
        "net_proration": net_proration,
        "gst": tax_amount,
        "total_payable": total_payable,

        "currency_code": currency_code,
        "currency_symbol": currency_symbol,
        "base_currency": base_cur,
        "exchange_rate": rate,
        "tax_name": tax_name,
        "tax_code": tax_code,
        "tax_percentage": tax_percentage,
        "tax_amount": tax_amount,
        "subtotal": net_proration,
        "proration_charge": proration_debit,
        "final_total": total_payable,
        "billing_interval": target_plan.billing_interval,
        "plan_name": target_plan.name,
        "price_breakdown": price_breakdown,
        "invoice_preview_items": invoice_preview_items
    }


