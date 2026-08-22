from .celery_worker import celery_app
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from . import models
from sqlalchemy.orm import joinedload
import random
import uuid
import os

def _log_audit_event(db, event_name, customer_id, description):
    """Helper function to log an audit event if it does not already exist."""
    existing = (
        db.query(models.AuditLog)
        .filter(
            models.AuditLog.event_name == event_name,
            models.AuditLog.customer_id == customer_id,
            models.AuditLog.description == description
        )
        .first()
    )
    if not existing:
        log = models.AuditLog(
            event_name=event_name,
            customer_id=customer_id,
            description=description
        )
        db.add(log)


@celery_app.task
def test_task():
    print("Background task executed successfully!")
    return "Task Completed"


@celery_app.task
def sync_daily_exchange_rates():
    """
    Scheduled task that runs once daily to sync exchange rates from the provider.
    """
    print("Syncing daily exchange rates...")
    db = SessionLocal()
    try:
        from app.services.exchange_rate_service import ExchangeRateService
        rates = ExchangeRateService.sync_latest_rates(db)
        print(f"Daily exchange rate sync completed.")
        return "Rates Synced"
    except Exception as e:
        print(f"Error syncing daily exchange rates: {e}")
        raise e
    finally:
        db.close()


@celery_app.task
def check_due_subscriptions():
    db = SessionLocal()

    try:
        print("Checking subscriptions...")

        # Eager load subscription, plan, and customer to prevent N+1 queries.
        due_cycles = (
            db.query(models.BillingCycle)
            .filter(models.BillingCycle.renewal_date <= datetime.utcnow())
            .options(
                joinedload(models.BillingCycle.subscription)
                .joinedload(models.Subscription.plan),
                joinedload(models.BillingCycle.customer)
            )
            .all()
        )

        print(f"Found {len(due_cycles)} due billing cycles.")

        for cycle in due_cycles:
            customer = cycle.customer
            if not customer:
                continue

            customer_name = customer.name
            customer_email = customer.email

            subscription = cycle.subscription
            if not subscription:
                continue

            # ----------------------------
            # CANCEL_AT_PERIOD_END HANDLING
            # ----------------------------
            if subscription.status == models.SubscriptionStatus.CANCEL_AT_PERIOD_END:
                print(f"Subscription {subscription.id} reached period end. Cancelling...")
                subscription.status = models.SubscriptionStatus.CANCELLED
                subscription.cancelled_at = datetime.utcnow()
                
                # Log event
                _log_audit_event(
                    db=db,
                    event_name="Subscription Cancelled",
                    customer_id=cycle.customer_id,
                    description=f"Subscription {subscription.id} automatically cancelled at period end."
                )

                # Dispatch Webhook
                from app.services import webhook_service
                webhook_service.dispatch_webhook_event(db, "subscription.cancelled", {
                    "subscription_id": subscription.id,
                    "customer_id": subscription.customer_id,
                    "status": "CANCELLED",
                    "cancelled_at": subscription.cancelled_at.isoformat()
                })

                # Send email
                from .email_tasks import send_subscription_cancellation_completed_email_task
                from .celery_worker import safe_task_delay
                safe_task_delay(send_subscription_cancellation_completed_email_task, customer_name, customer_email, subscription.cancelled_at.strftime("%Y-%m-%d"))

                continue

            customer_name = customer.name
            customer_email = customer.email

            subscription = cycle.subscription
            if not subscription:
                continue

            # ----------------------------
            # TRIAL EXPIRATION HANDLING (SEPARATE)
            # ----------------------------
            if subscription.status == models.SubscriptionStatus.TRIAL:
                print(f"Trial expired for subscription {subscription.id}. Transitioning to PAST_DUE...")
                subscription.status = models.SubscriptionStatus.PAST_DUE
                subscription.past_due_at = datetime.utcnow()
                subscription.trial_status = "EXPIRED"
                if customer:
                    customer.has_used_trial = True
                
                # Log event
                _log_audit_event(
                    db=db,
                    event_name="Subscription Past Due",
                    customer_id=cycle.customer_id,
                    description=f"Trial subscription {subscription.id} expired."
                )
                
                # Queue trial expired email asynchronously
                from .email_tasks import send_trial_expired_email_task
                from .celery_worker import safe_task_delay
                safe_task_delay(send_trial_expired_email_task, customer.name, customer.email)
                continue

            # ----------------------------
            # ACTIVE RENEWALS ONLY
            # ----------------------------
            if subscription.status != models.SubscriptionStatus.ACTIVE:
                print(f"Subscription {subscription.id} has status {subscription.status} (not ACTIVE). Skipping renewal...")
                continue

            plan = subscription.plan
            if not plan:
                continue

            # Prevent duplicate invoices (skip if an unpaid or failed invoice already exists)
            existing_invoice = (
                db.query(models.Invoice)
                .filter(
                    models.Invoice.subscription_id == subscription.id,
                    models.Invoice.status.in_([
                        models.InvoiceStatus.UNPAID,
                        models.InvoiceStatus.FAILED
                    ])
                )
                .first()
            )

            if existing_invoice:
                print(
                    f"Unpaid or failed invoice already exists for subscription {subscription.id}. Skipping..."
                )
                continue

            # Create Invoice using central InvoiceService to dynamically resolve tax & currency
            from app.services.invoice_service import create_invoice
            invoice = create_invoice(
                db=db,
                customer_id=cycle.customer_id,
                subscription_id=subscription.id,
                base_amount=subscription.billing_price,
                status=models.InvoiceStatus.UNPAID,
                invoice_type="RENEWAL",
                currency_code=subscription.currency_code
            )

            # Generate invoice.id without committing
            db.flush()

            print(f"Invoice created: {invoice.invoice_number}")

            # Audit log for Invoice Generated
            _log_audit_event(
                db=db,
                event_name="Invoice Generated",
                customer_id=cycle.customer_id,
                description=f"Invoice {invoice.invoice_number} generated for subscription {subscription.id} with amount {invoice.amount}."
            )

            # ----------------------------
            # PAYMENT SIMULATION
            # ----------------------------
            payment_status = random.choices(
                [models.PaymentStatus.SUCCESS, models.PaymentStatus.FAILED],
                weights=[80, 20],
                k=1
            )[0]

            # Generate a readable, unique transaction ID
            transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"

            # Prevent duplicate payments for the same invoice/transaction
            existing_payment = (
                db.query(models.Payment)
                .filter(
                    (models.Payment.invoice_id == invoice.id) |
                    (models.Payment.transaction_id == transaction_id)
                )
                .first()
            )

            if existing_payment:
                print(f"Payment already exists for invoice {invoice.invoice_number}. Skipping...")
                continue

            # Lookup customer default or active payment method for renewal
            default_pm = (
                db.query(models.PaymentMethod)
                .filter(
                    models.PaymentMethod.customer_id == cycle.customer_id,
                    models.PaymentMethod.is_default == True,
                    models.PaymentMethod.is_active == True
                )
                .first()
            )
            if not default_pm:
                default_pm = (
                    db.query(models.PaymentMethod)
                    .filter(
                        models.PaymentMethod.customer_id == cycle.customer_id,
                        models.PaymentMethod.is_active == True
                    )
                    .first()
                )

            payment = models.Payment(
                customer_id=cycle.customer_id,
                invoice_id=invoice.id,
                amount=invoice.total_amount if invoice.total_amount is not None else invoice.amount,
                currency_code=invoice.currency_code,
                status=payment_status,
                transaction_id=transaction_id,
                payment_method_id=default_pm.id if default_pm else None
            )
            db.add(payment)

            # ----------------------------
            # UPDATE STATUS & LOGS
            # ----------------------------
            if payment_status == models.PaymentStatus.SUCCESS:
                invoice.status = models.InvoiceStatus.PAID
                print(f"✅ Payment Successful for {invoice.invoice_number}")

                # Audit log for Payment Successful
                _log_audit_event(
                    db=db,
                    event_name="Payment Successful",
                    customer_id=cycle.customer_id,
                    description=f"Payment for invoice {invoice.invoice_number} succeeded. Transaction: {payment.transaction_id}."
                )

                # Subscription Status Update
                subscription.status = models.SubscriptionStatus.ACTIVE
                subscription.activated_at = datetime.utcnow()
                subscription.past_due_at = None

                # Audit log for Subscription Activated
                _log_audit_event(
                    db=db,
                    event_name="Subscription Activated",
                    customer_id=cycle.customer_id,
                    description=f"Subscription {subscription.id} activated."
                )

                # Billing Cycle Renewal based on Plan.billing_interval
                if plan.billing_interval == models.BillingInterval.ANNUAL:
                    days_to_add = 365
                elif plan.billing_interval == models.BillingInterval.MONTHLY:
                    days_to_add = 30
                else:
                    days_to_add = 30  # Default fallback

                cycle.start_date = cycle.end_date
                cycle.end_date += timedelta(days=days_to_add)
                cycle.renewal_date += timedelta(days=days_to_add)
                cycle.next_billing_date += timedelta(days=days_to_add)

                # Queue emails asynchronously
                from .email_tasks import send_payment_success_email_task
                from .celery_worker import safe_task_delay
                safe_task_delay(
                    send_payment_success_email_task,
                    customer.name,
                    customer.email,
                    invoice.invoice_number
                )

            else:
                invoice.status = models.InvoiceStatus.FAILED
                print(f"❌ Payment Failed for {invoice.invoice_number}")

                is_trial_expiration = (subscription.status == models.SubscriptionStatus.TRIAL)

                # Audit log for Payment Failed
                _log_audit_event(
                    db=db,
                    event_name="Payment Failed",
                    customer_id=cycle.customer_id,
                    description=f"Payment for invoice {invoice.invoice_number} failed. Transaction: {payment.transaction_id}."
                )

                # Subscription Status Update
                subscription.status = models.SubscriptionStatus.PAST_DUE
                subscription.past_due_at = datetime.utcnow()

                # Audit log for Subscription Past Due
                _log_audit_event(
                    db=db,
                    event_name="Subscription Past Due",
                    customer_id=cycle.customer_id,
                    description=f"Subscription {subscription.id} set to past due."
                )

                # Queue emails asynchronously
                from .email_tasks import send_invoice_email_task, send_payment_failed_email_task
                from .celery_worker import safe_task_delay
                safe_task_delay(
                    send_invoice_email_task,
                    customer.name,
                    customer.email,
                    invoice.invoice_number,
                    invoice.amount,
                    invoice.due_date.strftime("%Y-%m-%d")
                )
                next_retry = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
                safe_task_delay(
                    send_payment_failed_email_task,
                    customer.name,
                    customer.email,
                    invoice.invoice_number,
                    "Gateway Rejected",
                    invoice.amount,
                    1,
                    3,
                    next_retry
                )

        db.commit()
        return f"{len(due_cycles)} due subscriptions processed"

    except Exception as e:
        db.rollback()
        print(f"Billing Automation Error: {e}")
        raise

    finally:
        db.close()


@celery_app.task
def send_trial_expiry_reminders():
    """
    Periodic task to send trial expiry notifications exactly 2 days before trial ends.
    """
    db = SessionLocal()
    try:
        from sqlalchemy.orm import joinedload
        now = datetime.utcnow()
        # Find billing cycles for trial subscriptions where renewal is between now and now + 2 days
        trial_cycles = (
            db.query(models.BillingCycle)
            .join(models.Subscription)
            .filter(
                models.Subscription.status == models.SubscriptionStatus.TRIAL,
                models.BillingCycle.renewal_date > now,
                models.BillingCycle.renewal_date <= now + timedelta(days=2)
            )
            .options(
                joinedload(models.BillingCycle.subscription).joinedload(models.Subscription.plan),
                joinedload(models.BillingCycle.customer)
            )
            .all()
        )
        
        sent_count = 0
        for cycle in trial_cycles:
            customer = cycle.customer
            sub = cycle.subscription
            if not customer or not sub:
                continue
                
            # Check idempotency: audit log check to avoid sending duplicate reminders
            audit_description = f"Trial expiry reminder sent for subscription {sub.id}."
            already_sent = (
                db.query(models.AuditLog)
                .filter(
                    models.AuditLog.event_name == "Trial Expiry Reminder Sent",
                    models.AuditLog.customer_id == customer.id,
                    models.AuditLog.description == audit_description
                )
                .first()
            )
            
            if already_sent:
                continue
                
            # Send Email
            from app.services import email_service
            html_body = email_service.trial_expiry_reminder_email(
                customer.name,
                cycle.renewal_date.strftime("%Y-%m-%d")
            )
            
            success = email_service.send_email(
                customer.email,
                "Your StreamVerse Trial Ends Soon",
                html_body
            )
            
            if success:
                # Log audit event to ensure idempotency
                log = models.AuditLog(
                    event_name="Trial Expiry Reminder Sent",
                    customer_id=customer.id,
                    description=audit_description
                )
                db.add(log)
                db.commit()
                sent_count += 1
                print(f"Sent trial expiry reminder to {customer.email} for subscription {sub.id}.")
                
        return f"Sent {sent_count} trial expiry reminders"
    except Exception as e:
        db.rollback()
        print(f"Error in send_trial_expiry_reminders task: {e}")
        raise
        db.close()

from app.core import config

@celery_app.task(bind=True)
def deliver_webhook_task(self, event_id: str):
    import urllib.request
    import urllib.error
    import json
    
    db = SessionLocal()
    try:
        log_entry = db.query(models.WebhookLog).filter(models.WebhookLog.event_id == event_id).first()
        if not log_entry:
            return "Webhook log not found"

        webhook_url = getattr(config, "WEBHOOK_ENDPOINT_URL", None) or os.getenv("WEBHOOK_ENDPOINT_URL")
        if not webhook_url:
            print("WEBHOOK_ENDPOINT_URL not configured")
            log_entry.status = "FAILED"
            db.commit()
            return "No URL configured"

        log_entry.retry_count += 1
        log_entry.last_attempt_at = datetime.utcnow()
        
        # Get dynamic limits
        max_retries = getattr(config, "WEBHOOK_RETRY_LIMIT", 3)
        retry_delay = getattr(config, "WEBHOOK_RETRY_DELAY_SECONDS", 60)
        
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(log_entry.payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                status_code = response.getcode()
                body = response.read().decode("utf-8")
                
                log_entry.response_status = status_code
                log_entry.response_body = body[:500] if body else ""
                
                if status_code in (200, 201, 202):
                    log_entry.status = "COMPLETED"
                    db.commit()
                    return "Webhook delivered"
                else:
                    log_entry.status = "FAILED" if self.request.retries >= max_retries else "PENDING"
                    db.commit()
                    raise Exception(f"Webhook failed with status {status_code}")
                    
        except urllib.error.HTTPError as e:
            log_entry.response_status = e.code
            try:
                body = e.read().decode("utf-8")
            except Exception:
                body = str(e)
            log_entry.response_body = body[:500]
            log_entry.status = "FAILED" if self.request.retries >= max_retries else "PENDING"
            db.commit()
            raise Exception(f"Webhook request failed with HTTPError: {e}")
        except urllib.error.URLError as e:
            log_entry.status = "FAILED" if self.request.retries >= max_retries else "PENDING"
            db.commit()
            raise Exception(f"Webhook request failed with URLError: {e}")
            
    except Exception as e:
        db.rollback()
        try:
            max_retries = getattr(config, "WEBHOOK_RETRY_LIMIT", 3)
            retry_delay = getattr(config, "WEBHOOK_RETRY_DELAY_SECONDS", 60)
            self.retry(exc=e, max_retries=max_retries, countdown=retry_delay)
        except Exception as retry_exc:
            raise retry_exc
    finally:
        db.close()


@celery_app.task
def process_failed_payment_retries():
    import logging
    from app import models
    from app.repositories import retry_repository
    from app.services.retry_service import RetryService

    logger = logging.getLogger("billflow.celery")
    logger.info("Automatic retry scheduler task started.")

    db = SessionLocal()
    try:
        pending_entries = retry_repository.get_pending_retry_entries(db)
        logger.info(f"Found {len(pending_entries)} pending retry queue entries scheduled for execution.")

        for entry in pending_entries:
            try:
                logger.info(
                    f"Processing automatic retry for entry #{entry.id} (Attempt {entry.retry_attempt}) "
                    f"for customer #{entry.customer_id} / invoice #{entry.invoice_id}..."
                )

                has_pm = db.query(models.PaymentMethod).filter(
                    models.PaymentMethod.customer_id == entry.customer_id,
                    models.PaymentMethod.is_active == True
                ).first() is not None

                result = "SUCCESS" if has_pm else "FAILED"

                RetryService.trigger_retry(db, entry.id, result)
                db.commit()
                logger.info(f"Automatic retry for entry #{entry.id} completed with result: {result}")
            except Exception as item_ex:
                db.rollback()
                logger.error(f"Error processing retry entry #{entry.id}: {item_ex}", exc_info=True)

        logger.info("Automatic retry scheduler task completed successfully.")
    except Exception as ex:
        logger.error(f"Error in automatic retry scheduler: {ex}", exc_info=True)
    finally:
        db.close()