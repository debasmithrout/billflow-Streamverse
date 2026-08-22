import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session

from app import models
from app.models.enums import RetryStatus, SubscriptionStatus, InvoiceStatus, PaymentStatus
from app.repositories import retry_repository
from app.services.audit_service import log_audit_event
from app.core import exceptions


class RetryService:
    @staticmethod
    def handle_failed_payment(db: Session, payment_id: int, failure_reason: str = "Payment processing failed") -> Optional[models.RetryQueue]:
        # 1. Fetch payment, invoice, subscription
        payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
        if not payment:
            return None
        invoice = payment.invoice
        if not invoice:
            return None
        subscription = db.query(models.Subscription).filter(models.Subscription.id == invoice.subscription_id).first()
        if not subscription:
            return None

        customer = db.query(models.Customer).filter(models.Customer.id == payment.customer_id).first()
        customer_name = customer.name if customer else "Customer"
        customer_email = customer.email if customer else ""

        # 2. Check if a pending retry queue record already exists for this invoice
        existing_queue = db.query(models.RetryQueue).filter(
            models.RetryQueue.invoice_id == invoice.id,
            models.RetryQueue.retry_status == RetryStatus.PENDING
        ).first()

        if existing_queue:
            next_attempt = existing_queue.retry_attempt + 1
        else:
            next_attempt = 1

        max_attempts = retry_repository.get_max_retry_attempts(db)

        if next_attempt > max_attempts:
            # Exceeded maximum attempts! Mark retry failed.
            if existing_queue:
                existing_queue.retry_status = RetryStatus.FAILED
                existing_queue.failure_reason = f"Max retry attempts ({max_attempts}) exceeded. Last failure: {failure_reason}"
                existing_queue.actual_retry_date = datetime.utcnow()
                existing_queue.next_retry_date = None
            
            # Cancel subscription using existing project rules
            subscription.status = SubscriptionStatus.CANCELLED
            subscription.cancelled_at = datetime.utcnow()
            invoice.status = InvoiceStatus.FAILED
            payment.status = PaymentStatus.FAILED

            # Log audit event
            log_audit_event(
                db,
                "Subscription Cancelled - Retries Exceeded",
                f"Subscription #{subscription.id} cancelled due to failed payment retries exceeding limit of {max_attempts}.",
                customer_id=payment.customer_id
            )
            db.flush()

            # Trigger email
            from app.celery_worker import safe_task_delay
            from app.email_tasks import send_retry_exhausted_email_task
            safe_task_delay(
                send_retry_exhausted_email_task,
                customer_name,
                customer_email,
                invoice.invoice_number,
                max_attempts
            )

            return existing_queue

        # Get retry configuration for next_attempt
        config = retry_repository.get_retry_configuration(db, next_attempt)
        days = config.retry_after_days if config else (1 if next_attempt == 1 else (3 if next_attempt == 2 else 7))
        
        scheduled_date = datetime.utcnow() + timedelta(days=days)

        # Update subscription status to PAST_DUE
        subscription.status = SubscriptionStatus.PAST_DUE
        subscription.past_due_at = datetime.utcnow()

        if existing_queue:
            existing_queue.retry_attempt = next_attempt
            existing_queue.scheduled_retry_date = scheduled_date
            existing_queue.failure_reason = failure_reason
            existing_queue.next_retry_date = scheduled_date
            entry = existing_queue
        else:
            retry_data = {
                "customer_id": payment.customer_id,
                "subscription_id": subscription.id,
                "invoice_id": invoice.id,
                "payment_id": payment.id,
                "retry_attempt": next_attempt,
                "retry_status": RetryStatus.PENDING,
                "scheduled_retry_date": scheduled_date,
                "next_retry_date": scheduled_date,
                "failure_reason": failure_reason
            }
            entry = retry_repository.create_retry_entry(db, retry_data)

        # Log audit event
        log_audit_event(
            db,
            "Payment Retry Scheduled",
            f"Failed payment #{payment.id} retry attempt {next_attempt} scheduled on {scheduled_date.strftime('%Y-%m-%d')}.",
            customer_id=payment.customer_id
        )
        
        db.flush()

        # Trigger appropriate email notification
        from app.celery_worker import safe_task_delay
        if next_attempt == 1:
            from app.email_tasks import send_payment_failed_email_task
            safe_task_delay(
                send_payment_failed_email_task,
                customer_name,
                customer_email,
                invoice.invoice_number,
                failure_reason,
                payment.amount,
                next_attempt,
                max_attempts,
                scheduled_date.strftime('%Y-%m-%d %H:%M:%S')
            )
        else:
            from app.email_tasks import send_retry_failed_again_email_task
            safe_task_delay(
                send_retry_failed_again_email_task,
                customer_name,
                customer_email,
                invoice.invoice_number,
                next_attempt,
                max_attempts,
                failure_reason,
                scheduled_date.strftime('%Y-%m-%d %H:%M:%S')
            )

        return entry

    @staticmethod
    def trigger_retry(db: Session, retry_id: int, result: str = "SUCCESS") -> models.RetryQueue:
        entry = retry_repository.get_retry_entry_by_id(db, retry_id)
        if not entry:
            raise exceptions.ResourceNotFound("Retry queue entry not found")
        if entry.retry_status != RetryStatus.PENDING:
            raise exceptions.BadRequest("Retry entry is not in PENDING status")

        subscription = entry.subscription
        payment = entry.payment
        invoice = entry.invoice
        customer = entry.customer

        pm = db.query(models.PaymentMethod).filter(
            models.PaymentMethod.customer_id == customer.id,
            models.PaymentMethod.is_active == True
        ).first()

        entry.actual_retry_date = datetime.utcnow()

        if result == "SUCCESS":
            entry.retry_status = RetryStatus.SUCCESS
            entry.failure_reason = None
            entry.next_retry_date = None

            # Mark subscription active
            subscription.status = SubscriptionStatus.ACTIVE
            subscription.activated_at = datetime.utcnow()
            subscription.past_due_at = None

            # Handle plan upgrades resolved via retry queue
            if invoice.invoice_type == "PLAN_UPGRADE":
                subscription.plan_id = invoice.new_plan_id
                subscription.billing_price = invoice.new_plan_price if invoice.new_plan_price is not None else subscription.billing_price
                subscription.currency_code = invoice.currency_code if invoice.currency_code else subscription.currency_code
                
                # Update plan price ID reference
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

            # Update invoice
            invoice.status = InvoiceStatus.PAID

            # Update payment
            payment.status = PaymentStatus.SUCCESS
            tx_id = f"TXN-RETRY-{uuid.uuid4().hex[:12].upper()}"
            payment.transaction_id = tx_id
            if pm:
                payment.payment_method_id = pm.id

            # Log audit
            log_audit_event(
                db,
                "Payment Retry Success",
                f"Retry attempt {entry.retry_attempt} for invoice #{invoice.id} succeeded. Transaction ID: {tx_id}",
                customer_id=customer.id
            )

            # Trigger email
            from app.celery_worker import safe_task_delay
            from app.email_tasks import send_retry_success_email_task
            safe_task_delay(
                send_retry_success_email_task,
                customer.name,
                customer.email,
                invoice.invoice_number,
                payment.amount,
                datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            )
            
            # Dispatch Webhook Event
            from app.services import webhook_service
            webhook_service.dispatch_webhook_event(db, "payment.success", {
                "payment_id": payment.id,
                "transaction_id": tx_id,
                "amount": payment.amount,
                "status": "SUCCESS",
                "invoice_number": invoice.invoice_number,
                "customer_id": customer.id
            })
            webhook_service.dispatch_webhook_event(db, "invoice.paid", {
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "total_amount": invoice.total_amount,
                "status": "PAID",
                "customer_id": customer.id
            })
        else:
            # Retry fails!
            tx_id = f"TXN-FAIL-{uuid.uuid4().hex[:12].upper()}"
            payment.status = PaymentStatus.FAILED
            payment.transaction_id = tx_id
            
            log_audit_event(
                db,
                "Payment Retry Failed",
                f"Retry attempt {entry.retry_attempt} for invoice #{invoice.id} failed.",
                customer_id=customer.id
            )

            # Dispatch webhooks
            from app.services import webhook_service
            webhook_service.dispatch_webhook_event(db, "payment.failed", {
                "payment_id": payment.id,
                "transaction_id": tx_id,
                "amount": payment.amount,
                "status": "FAILED",
                "invoice_number": invoice.invoice_number,
                "customer_id": customer.id
            })

            # Call handle_failed_payment to calculate next attempt or cancel
            RetryService.handle_failed_payment(db, payment.id, f"Retry attempt {entry.retry_attempt} failed")

        db.flush()
        return entry

    @staticmethod
    def get_all_retries(db: Session) -> List[dict]:
        entries = retry_repository.get_all_retry_entries(db)
        max_attempts = retry_repository.get_max_retry_attempts(db)
        
        result = []
        for e in entries:
            result.append({
                "id": e.id,
                "customer_id": e.customer_id,
                "subscription_id": e.subscription_id,
                "invoice_id": e.invoice_id,
                "payment_id": e.payment_id,
                "retry_attempt": e.retry_attempt,
                "retry_status": e.retry_status,
                "scheduled_retry_date": e.scheduled_retry_date,
                "actual_retry_date": e.actual_retry_date,
                "next_retry_date": e.next_retry_date,
                "failure_reason": e.failure_reason,
                "created_at": e.created_at,
                "updated_at": e.updated_at,
                "status": e.retry_status.value if e.retry_status else "PENDING",
                "error_message": e.failure_reason,
                "max_attempts": max_attempts
            })
        return result

    @staticmethod
    def get_retry_history_list(db: Session) -> List[dict]:
        entries = retry_repository.get_retry_history(db)
        max_attempts = retry_repository.get_max_retry_attempts(db)
        
        result = []
        for e in entries:
            result.append({
                "id": e.id,
                "customer_id": e.customer_id,
                "subscription_id": e.subscription_id,
                "invoice_id": e.invoice_id,
                "payment_id": e.payment_id,
                "retry_attempt": e.retry_attempt,
                "retry_status": e.retry_status,
                "scheduled_retry_date": e.scheduled_retry_date,
                "actual_retry_date": e.actual_retry_date,
                "next_retry_date": e.next_retry_date,
                "failure_reason": e.failure_reason,
                "created_at": e.created_at,
                "updated_at": e.updated_at,
                "status": e.retry_status.value if e.retry_status else "PENDING",
                "error_message": e.failure_reason,
                "max_attempts": max_attempts
            })
        return result

    @staticmethod
    def get_retry_by_id(db: Session, retry_id: int) -> Optional[dict]:
        entry = retry_repository.get_retry_entry_by_id(db, retry_id)
        if not entry:
            return None
        max_attempts = retry_repository.get_max_retry_attempts(db)
        return {
            "id": entry.id,
            "customer_id": entry.customer_id,
            "subscription_id": entry.subscription_id,
            "invoice_id": entry.invoice_id,
            "payment_id": entry.payment_id,
            "retry_attempt": entry.retry_attempt,
            "retry_status": entry.retry_status,
            "scheduled_retry_date": entry.scheduled_retry_date,
            "actual_retry_date": entry.actual_retry_date,
            "next_retry_date": entry.next_retry_date,
            "failure_reason": entry.failure_reason,
            "created_at": entry.created_at,
            "updated_at": entry.updated_at,
            "status": entry.retry_status.value if entry.retry_status else "PENDING",
            "error_message": entry.failure_reason,
            "max_attempts": max_attempts
        }

    @staticmethod
    def get_retry_stats(db: Session) -> dict:
        """
        Compute dashboard widget KPIs (Failed Payments, Pending Retries,
        Recovered Payments, Retry Success Rate) from a single query against
        the full RetryQueue table.  This is the single source of truth used
        by both the widgets and the retry table.
        """
        all_entries = retry_repository.get_all_retry_entries(db)

        total_in_queue = len(all_entries)
        pending_count = 0
        recovered_count = 0
        failed_count = 0

        for e in all_entries:
            status_val = e.retry_status.value if e.retry_status else ""
            if status_val == RetryStatus.PENDING.value:
                pending_count += 1
            elif status_val == RetryStatus.SUCCESS.value:
                recovered_count += 1
            elif status_val == RetryStatus.FAILED.value:
                failed_count += 1

        total_processed = recovered_count + failed_count
        success_rate = round((recovered_count / total_processed) * 100) if total_processed > 0 else 0

        return {
            "total_in_queue": total_in_queue,
            "failed_payments": total_in_queue,          # Every entry in the queue represents a failed payment event
            "pending_retries": pending_count,
            "recovered_payments": recovered_count,
            "retry_success_rate": success_rate,
        }


