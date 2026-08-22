import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Payment, Invoice, Refund, Subscription, SubscriptionStatus, PaymentStatus, InvoiceStatus, RefundStatus
from app.schemas.refund import RefundCreate, RefundAdminAction
from app.repositories.refund_repository import RefundRepository
from app.core import exceptions, config
from app.services import webhook_service
from app.services.mock_gateway import MockRefundGateway
from app.services.audit_service import log_audit_event
from app.celery_worker import safe_task_delay

logger = logging.getLogger("billflow.refunds")
logger.setLevel(logging.INFO)

class RefundService:
    def __init__(self, db: Session):
        self.db = db
        self.refund_repo = RefundRepository(db)

    def _validate_refund_request(self, payment: Payment, amount: float):
        if not payment:
            raise exceptions.ResourceNotFound("Payment not found.")
        
        if payment.status != PaymentStatus.SUCCESS:
            raise exceptions.ValidationError("Can only refund successful payments.")
        
        invoice = self.db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
        if not invoice or invoice.status != InvoiceStatus.PAID:
            raise exceptions.ValidationError("Invoice must be paid to issue a refund.")
            
        # Refund window based on config
        payment_date = payment.created_at
        refund_window_days = getattr(config, "REFUND_WINDOW_DAYS", 7)
        if datetime.utcnow() > payment_date + timedelta(days=refund_window_days):
            raise exceptions.ValidationError(f"Refund request is outside the {refund_window_days}-day window.")
            
        # Amount validation (Full or Partial)
        total_requested = self.refund_repo.get_total_requested_and_refunded_for_payment(payment.id)
        if amount <= 0:
            raise exceptions.ValidationError("Refund amount must be greater than zero.")
            
        if amount > (payment.amount - total_requested):
            raise exceptions.ValidationError(f"Requested amount exceeds refundable balance. Available: {payment.amount - total_requested}")

    def request_refund(self, data: RefundCreate) -> Refund:
        payment = self.db.query(Payment).filter(Payment.id == data.payment_id).first()
        self._validate_refund_request(payment, data.amount)
        
        refund = Refund(
            payment_id=payment.id,
            customer_id=payment.customer_id,
            invoice_id=payment.invoice_id,
            amount=data.amount,
            reason=data.reason,
            status=RefundStatus.PENDING,
            created_at=datetime.utcnow()
        )
        
        self.refund_repo.create(refund)
        self.db.commit()
        
        cur_code = getattr(payment, "currency_code", "INR") or "INR"
        # Log Audit Trail
        log_audit_event(
            self.db,
            "Refund Requested",
            f"Refund of {cur_code} {refund.amount:.2f} requested for payment {payment.id}.",
            customer_id=payment.customer_id
        )
        
        customer_name = payment.customer.name
        customer_email = payment.customer.email
        
        # Dispatch webhook
        webhook_service.dispatch_webhook_event(self.db, "refund.requested", {
            "refund_id": refund.id,
            "payment_id": payment.id,
            "amount": refund.amount,
            "reason": refund.reason,
            "status": refund.status.value
        })
        
        # Send Email
        from app.email_tasks import send_refund_requested_email_task
        safe_task_delay(send_refund_requested_email_task, customer_name, customer_email, refund.amount, cur_code)
        
        return refund

    def approve_refund(self, refund_id: int, action: RefundAdminAction) -> Refund:
        refund = self.refund_repo.get_by_id(refund_id)
        if not refund:
            raise exceptions.ResourceNotFound("Refund not found")
        if refund.status != RefundStatus.PENDING:
            raise exceptions.ValidationError(f"Cannot approve refund in status {refund.status.value}")
            
        refund.status = RefundStatus.APPROVED
        refund.admin_notes = action.admin_notes
        self.db.commit()
        
        # Log Audit Trail
        log_audit_event(
            self.db,
            "Refund Approved",
            f"Refund {refund.id} approved by admin.",
            customer_id=refund.customer_id
        )
        
        # Transition to processing for actual payment gateway call simulation
        return self._process_refund(refund)
        
    def reject_refund(self, refund_id: int, action: RefundAdminAction) -> Refund:
        refund = self.refund_repo.get_by_id(refund_id)
        if not refund:
            raise exceptions.ResourceNotFound("Refund not found")
        if refund.status != RefundStatus.PENDING:
            raise exceptions.ValidationError(f"Cannot reject refund in status {refund.status.value}")
            
        if not action.admin_notes:
            raise exceptions.ValidationError("Admin notes required for rejection.")
            
        refund.status = RefundStatus.REJECTED
        refund.admin_notes = action.admin_notes
        refund.processed_at = datetime.utcnow()
        self.db.commit()
        
        # Log Audit Trail
        log_audit_event(
            self.db,
            "Refund Rejected",
            f"Refund {refund.id} rejected by admin. Reason: {refund.admin_notes}",
            customer_id=refund.customer_id
        )
        
        customer_name = refund.customer.name
        customer_email = refund.customer.email
        
        webhook_service.dispatch_webhook_event(self.db, "refund.rejected", {
            "refund_id": refund.id,
            "payment_id": refund.payment_id,
            "amount": refund.amount,
            "status": refund.status.value,
            "reason": refund.admin_notes
        })
        
        cur_code = getattr(refund.payment, "currency_code", "INR") if refund.payment else "INR"
        from app.email_tasks import send_refund_rejected_email_task
        safe_task_delay(send_refund_rejected_email_task, customer_name, customer_email, refund.amount, refund.admin_notes, cur_code)
        
        return refund

    def _process_refund(self, refund: Refund) -> Refund:
        # Move to PROCESSING
        refund.status = RefundStatus.PROCESSING
        self.db.commit()
        
        # Log Audit Trail
        log_audit_event(
            self.db,
            "Refund Processing",
            f"Refund {refund.id} is now processing with mock gateway.",
            customer_id=refund.customer_id
        )
        
        customer_name = refund.customer.name
        customer_email = refund.customer.email
        
        webhook_service.dispatch_webhook_event(self.db, "refund.processing", {
            "refund_id": refund.id,
            "amount": refund.amount,
            "status": refund.status.value
        })
        cur_code = getattr(refund.payment, "currency_code", "INR") if refund.payment else "INR"
        from app.email_tasks import send_refund_processing_email_task
        safe_task_delay(send_refund_processing_email_task, customer_name, customer_email, refund.amount, cur_code)
        
        # Call MockRefundGateway deterministically
        payment = self.db.query(Payment).filter(Payment.id == refund.payment_id).first()
        txn_id = payment.transaction_id if payment else "mock_txn"
        gateway_res = MockRefundGateway.process_refund(txn_id, refund.amount, refund.reason)
        
        refund.gateway_response = gateway_res
        
        if gateway_res["success"]:
            refund.status = RefundStatus.COMPLETED
            refund.processed_at = datetime.utcnow()
            refund.gateway_refund_id = gateway_res["gateway_refund_id"]
            
            # Explicitly flush to session to guarantee SQL sum aggregates include the current refund
            self.db.flush()
            
            # Log Audit Trail
            log_audit_event(
                self.db,
                "Refund Completed",
                f"Refund {refund.id} completed successfully via gateway. ID: {refund.gateway_refund_id}",
                customer_id=refund.customer_id
            )
            
            # Update Payment & Invoice status
            total_completed = self.refund_repo.get_total_completed_refunds_for_payment(payment.id)
            invoice = self.db.query(Invoice).filter(Invoice.id == refund.invoice_id).first()
            
            if total_completed >= payment.amount:
                payment.status = PaymentStatus.REFUNDED
                if invoice:
                    invoice.status = InvoiceStatus.REFUNDED
                    log_audit_event(
                        self.db,
                        "Invoice Refunded",
                        f"Invoice {invoice.invoice_number} marked as fully REFUNDED.",
                        customer_id=invoice.customer_id
                    )
                
                # Auto-cancel subscription if fully refunded (Idempotent check)
                subscription = self.db.query(Subscription).filter(Subscription.id == refund.invoice.subscription_id).first()
                if subscription and subscription.status != SubscriptionStatus.CANCELLED:
                    subscription.status = SubscriptionStatus.CANCELLED
                    subscription.cancelled_at = datetime.utcnow()
                    
                    # Update billing cycle end date
                    cycle = self.db.query(models.BillingCycle).filter(models.BillingCycle.subscription_id == subscription.id).first() if 'models' in globals() else self.db.query(Subscription.billing_cycles.property.mapper.class_).filter_by(subscription_id=subscription.id).first()
                    # Wait, let's fetch BillingCycle class correctly
                    from app.models.billing_cycle import BillingCycle
                    cycle = self.db.query(BillingCycle).filter(BillingCycle.subscription_id == subscription.id).first()
                    if cycle:
                        cycle.end_date = datetime.utcnow()
                        
                    # Log subscription cancellation audit trail
                    log_audit_event(
                        self.db,
                        "Subscription Cancelled",
                        f"Subscription {subscription.id} automatically cancelled due to full refund.",
                        customer_id=subscription.customer_id
                    )
                    
                    # Send Cancellation completed email
                    from app.email_tasks import send_subscription_cancellation_completed_email_task
                    safe_task_delay(send_subscription_cancellation_completed_email_task, subscription.customer.name, subscription.customer.email, subscription.cancelled_at.strftime("%Y-%m-%d"))
                    
                    # Dispatch Webhook
                    webhook_service.dispatch_webhook_event(self.db, "subscription.cancelled", {
                        "subscription_id": subscription.id,
                        "customer_id": subscription.customer_id,
                        "status": "CANCELLED",
                        "cancelled_at": subscription.cancelled_at.isoformat()
                    })
            else:
                if invoice:
                    invoice.status = InvoiceStatus.PARTIALLY_REFUNDED
                    log_audit_event(
                        self.db,
                        "Invoice Partially Refunded",
                        f"Invoice {invoice.invoice_number} marked as PARTIALLY_REFUNDED.",
                        customer_id=invoice.customer_id
                    )
            
            self.db.commit()
            
            webhook_service.dispatch_webhook_event(self.db, "refund.completed", {
                "refund_id": refund.id,
                "amount": refund.amount,
                "status": refund.status.value,
                "gateway_refund_id": refund.gateway_refund_id
            })
            cur_code = getattr(refund.payment, "currency_code", "INR") if refund.payment else "INR"
            from app.email_tasks import send_refund_completed_email_task
            safe_task_delay(send_refund_completed_email_task, customer_name, customer_email, refund.amount, cur_code)
            
        else:
            refund.status = RefundStatus.FAILED
            refund.processed_at = datetime.utcnow()
            self.db.commit()
            
            # Log Audit Trail
            log_audit_event(
                self.db,
                "Refund Failed",
                f"Refund {refund.id} failed. Error: {gateway_res.get('error_message')}",
                customer_id=refund.customer_id
            )
            
            webhook_service.dispatch_webhook_event(self.db, "refund.failed", {
                "refund_id": refund.id,
                "amount": refund.amount,
                "status": refund.status.value,
                "error_code": gateway_res.get("error_code")
            })
            cur_code = getattr(refund.payment, "currency_code", "INR") if refund.payment else "INR"
            from app.email_tasks import send_refund_failed_email_task
            safe_task_delay(send_refund_failed_email_task, customer_name, customer_email, refund.amount, cur_code)
            
        return refund
