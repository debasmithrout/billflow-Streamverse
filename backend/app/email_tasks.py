import logging
from .celery_worker import celery_app
from app.services import email_service
from celery.exceptions import Retry

# Set up logging for Celery email tasks
logger = logging.getLogger("billflow.email_tasks")
logger.setLevel(logging.INFO)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_welcome_email_task(self, customer_name: str, customer_email: str):
    """
    Celery task to send a welcome email to a new customer.
    """
    logger.info(f"Triggering send_welcome_email_task for {customer_email}")
    try:
        html_body = email_service.welcome_email(customer_name)
        subject = "Welcome to StreamVerse!"
        success = email_service.send_email(customer_email, subject, html_body)
        
        if success:
            logger.info(f"Successfully executed welcome email task for {customer_email}")
            return "Welcome email sent"
        else:
            logger.error(f"SMTP delivery failed in welcome email task for {customer_email}")
            raise Exception("SMTP delivery failed")
            
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_welcome_email_task for {customer_email}: {e}", exc_info=True)
        raise self.retry(exc=e)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_trial_expired_email_task(self, customer_name: str, customer_email: str):
    """
    Celery task to alert a customer that their trial period has expired.
    """
    logger.info(f"Triggering send_trial_expired_email_task for {customer_email}")
    try:
        html_body = email_service.trial_expired_email(customer_name)
        subject = "Your Trial Period Has Expired"
        success = email_service.send_email(customer_email, subject, html_body)
        
        if success:
            logger.info(f"Successfully executed trial expired email task for {customer_email}")
            return "Trial expired email sent"
        else:
            logger.error(f"SMTP delivery failed in trial expired email task for {customer_email}")
            raise Exception("SMTP delivery failed")
            
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_trial_expired_email_task for {customer_email}: {e}", exc_info=True)
        raise self.retry(exc=e)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_invoice_email_task(self, customer_name: str, customer_email: str, invoice_number: str, amount: float, due_date: str):
    """
    Celery task to send a newly generated invoice to a customer with PDF attachment.
    """
    logger.info(f"Triggering send_invoice_email_task for {customer_email} regarding Invoice {invoice_number}")
    try:
        from app.core.database import SessionLocal
        from app.models.invoice import Invoice
        from app.services import customer_service

        pdf_bytes = None
        clean_inv_num = invoice_number if invoice_number.startswith("INV-") else f"INV-{invoice_number}"
        attachment_filename = f"{clean_inv_num}.pdf"

        db = SessionLocal()
        try:
            inv = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
            if inv:
                # Safety Guard: Skip sending the unpaid email if invoice status is already PAID
                status_str = inv.status.value if hasattr(inv.status, "value") else str(inv.status)
                if status_str.upper() == "PAID":
                    logger.info(f"Skipping send_invoice_email_task for {customer_email} because Invoice {invoice_number} is already PAID.")
                    return "Invoice already paid, email skipped"
                
                pdf_bytes = customer_service.generate_invoice_pdf(db, inv.id, inv.customer_id)
                logger.info(f"Generated PDF attachment ({len(pdf_bytes)} bytes) for Invoice {invoice_number}")
        except Exception as pdf_err:
            logger.error(f"Error generating PDF attachment for Invoice {invoice_number}: {pdf_err}")
        finally:
            db.close()

        html_body = email_service.invoice_email(customer_name, invoice_number, amount, due_date)
        subject = f"Invoice Generated - Payment Pending ({invoice_number})"
        success = email_service.send_email(
            customer_email,
            subject,
            html_body,
            attachment_bytes=pdf_bytes,
            attachment_filename=attachment_filename if pdf_bytes else None
        )
        
        if success:
            logger.info(f"Successfully executed invoice email task for {customer_email}")
            return "Invoice email sent"
        else:
            logger.error(f"SMTP delivery failed in invoice email task for {customer_email}")
            raise Exception("SMTP delivery failed")
            
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_invoice_email_task for {customer_email}: {e}", exc_info=True)
        raise self.retry(exc=e)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_payment_success_email_task(self, customer_name: str, customer_email: str, invoice_number: str):
    """
    Celery task to send a payment receipt confirmation with PDF attachment.
    """
    logger.info(f"Triggering send_payment_success_email_task for {customer_email} regarding Invoice {invoice_number}")
    try:
        from app.core.database import SessionLocal
        from app.models.invoice import Invoice
        from app.services import customer_service

        pdf_bytes = None
        clean_inv_num = invoice_number if invoice_number.startswith("INV-") else f"INV-{invoice_number}"
        attachment_filename = f"{clean_inv_num}.pdf"

        db = SessionLocal()
        try:
            inv = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
            if inv:
                db.refresh(inv)
                pdf_bytes = customer_service.generate_invoice_pdf(db, inv.id, inv.customer_id)
                logger.info(f"Generated PDF attachment ({len(pdf_bytes)} bytes, MIME: application/pdf) for Invoice {invoice_number}")
        except Exception as pdf_err:
            logger.error(f"Error generating PDF attachment for Invoice {invoice_number}: {pdf_err}")
        finally:
            db.close()

        html_body = email_service.payment_success_email(customer_name, invoice_number)
        subject = f"Payment Successful - Receipt for {invoice_number}"
        success = email_service.send_email(
            customer_email,
            subject,
            html_body,
            attachment_bytes=pdf_bytes,
            attachment_filename=attachment_filename if pdf_bytes else None
        )
        
        if success:
            logger.info(f"Successfully executed payment success email task for {customer_email}")
            return "Payment success email sent"
        else:
            logger.error(f"SMTP delivery failed in payment success email task for {customer_email}")
            raise Exception("SMTP delivery failed")
            
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_payment_success_email_task for {customer_email}: {e}", exc_info=True)
        raise self.retry(exc=e)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_payment_failed_email_task(
    self, 
    customer_name: str, 
    customer_email: str, 
    invoice_number: str, 
    failure_reason: str, 
    failed_amount: float, 
    retry_attempt: int, 
    max_attempts: int, 
    next_retry_date: str
):
    """
    Celery task to alert a customer of a failed payment transaction with retry metrics.
    """
    logger.info(f"Triggering send_payment_failed_email_task for {customer_email} regarding Invoice {invoice_number}")
    try:
        html_body = email_service.payment_failed_email(
            customer_name, 
            invoice_number, 
            failure_reason, 
            failed_amount, 
            retry_attempt, 
            max_attempts, 
            next_retry_date
        )
        subject = f"Payment Failed - Action Required for {invoice_number}"
        success = email_service.send_email(customer_email, subject, html_body)
        
        if success:
            logger.info(f"Successfully executed payment failed email task for {customer_email}")
            return "Payment failed email sent"
        else:
            logger.error(f"SMTP delivery failed in payment failed email task for {customer_email}")
            raise Exception("SMTP delivery failed")
            
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_payment_failed_email_task for {customer_email}: {e}", exc_info=True)
        raise self.retry(exc=e)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_trial_started_email_task(self, customer_name: str, customer_email: str, start_date: str, end_date: str):
    logger.info(f"Triggering send_trial_started_email_task for {customer_email}")
    try:
        html_body = email_service.trial_started_email(customer_name, start_date, end_date)
        subject = "Your 7-Day Free Trial Has Started"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            logger.info(f"Successfully sent trial started email to {customer_email}")
            return "Trial started email sent"
        else:
            logger.error(f"SMTP delivery failed in trial started email task for {customer_email}")
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_trial_started_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_subscription_activated_email_task(self, customer_name: str, customer_email: str, plan_name: str, price: float, billing_interval: str, start_date: str, next_billing_date: str):
    logger.info(f"Triggering send_subscription_activated_email_task for {customer_email}")
    try:
        html_body = email_service.subscription_activated_email(customer_name, plan_name, price, billing_interval, start_date, next_billing_date)
        subject = "Subscription Activated"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            logger.info(f"Successfully sent subscription activated email to {customer_email}")
            return "Subscription activated email sent"
        else:
            logger.error(f"SMTP delivery failed in subscription activated email task for {customer_email}")
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_subscription_activated_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_plan_upgraded_email_task(self, customer_name: str, customer_email: str, old_plan: str, new_plan: str, price_difference: float, effective_date: str):
    logger.info(f"Triggering send_plan_upgraded_email_task for {customer_email}")
    try:
        html_body = email_service.plan_upgraded_email(customer_name, old_plan, new_plan, price_difference, effective_date, customer_email=customer_email)
        subject = "Your Subscription Has Been Upgraded"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            logger.info(f"Successfully sent plan upgraded email to {customer_email}")
            return "Plan upgraded email sent"
        else:
            logger.error(f"SMTP delivery failed in plan upgraded email task for {customer_email}")
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_plan_upgraded_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_plan_downgraded_email_task(self, customer_name: str, customer_email: str, old_plan: str, new_plan: str, effective_date: str, explanation: str):
    logger.info(f"Triggering send_plan_downgraded_email_task for {customer_email}")
    try:
        html_body = email_service.plan_downgraded_email(customer_name, old_plan, new_plan, effective_date, explanation)
        subject = "Your Subscription Has Been Downgraded"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            logger.info(f"Successfully sent plan downgraded email to {customer_email}")
            return "Plan downgraded email sent"
        else:
            logger.error(f"SMTP delivery failed in plan downgraded email task for {customer_email}")
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_plan_downgraded_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_plan_cancellation_email_task(self, customer_name: str, customer_email: str, effective_date: str):
    logger.info(f"Triggering send_plan_cancellation_email_task for {customer_email}")
    try:
        html_body = email_service.plan_cancellation_email(customer_name, effective_date)
        subject = "Subscription Cancelled"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            logger.info(f"Successfully sent plan cancellation email to {customer_email}")
            return "Plan cancellation email sent"
        else:
            logger.error(f"SMTP delivery failed in plan cancellation email task for {customer_email}")
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_plan_cancellation_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_refund_requested_email_task(self, customer_name: str, customer_email: str, amount: float, currency_code: str = "INR"):
    logger.info(f"Triggering send_refund_requested_email_task for {customer_email}")
    try:
        html_body = email_service.refund_requested_email(customer_name, amount, currency_code)
        subject = "Refund Request Received"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            return "Refund requested email sent"
        else:
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_refund_requested_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_refund_approved_email_task(self, customer_name: str, customer_email: str, amount: float, currency_code: str = "INR"):
    logger.info(f"Triggering send_refund_approved_email_task for {customer_email}")
    try:
        html_body = email_service.refund_approved_email(customer_name, amount, currency_code)
        subject = "Refund Approved"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            return "Refund approved email sent"
        else:
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_refund_approved_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_refund_processing_email_task(self, customer_name: str, customer_email: str, amount: float, currency_code: str = "INR"):
    logger.info(f"Triggering send_refund_processing_email_task for {customer_email}")
    try:
        html_body = email_service.refund_processing_email(customer_name, amount, currency_code)
        subject = "Refund Processing"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            return "Refund processing email sent"
        else:
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_refund_processing_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_refund_completed_email_task(self, customer_name: str, customer_email: str, amount: float, currency_code: str = "INR"):
    logger.info(f"Triggering send_refund_completed_email_task for {customer_email}")
    try:
        html_body = email_service.refund_completed_email(customer_name, amount, currency_code)
        subject = "Refund Completed"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            return "Refund completed email sent"
        else:
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_refund_completed_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_refund_failed_email_task(self, customer_name: str, customer_email: str, amount: float, currency_code: str = "INR"):
    logger.info(f"Triggering send_refund_failed_email_task for {customer_email}")
    try:
        html_body = email_service.refund_failed_email(customer_name, amount, currency_code)
        subject = "Refund Failed"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            return "Refund failed email sent"
        else:
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_refund_failed_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_refund_rejected_email_task(self, customer_name: str, customer_email: str, amount: float, admin_notes: str, currency_code: str = "INR"):
    logger.info(f"Triggering send_refund_rejected_email_task for {customer_email}")
    try:
        html_body = email_service.refund_rejected_email(customer_name, amount, admin_notes, currency_code)
        subject = "Refund Request Rejected"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            return "Refund rejected email sent"
        else:
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_refund_rejected_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_subscription_cancellation_completed_email_task(self, customer_name: str, customer_email: str, effective_date: str):
    logger.info(f"Triggering send_subscription_cancellation_completed_email_task for {customer_email}")
    try:
        html_body = email_service.subscription_cancellation_completed_email(customer_name, effective_date)
        subject = "Subscription Cancellation Complete"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            return "Subscription cancellation completed email sent"
        else:
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_subscription_cancellation_completed_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_retry_success_email_task(self, customer_name: str, customer_email: str, invoice_number: str, amount: float, recovery_time: str):
    logger.info(f"Triggering send_retry_success_email_task for {customer_email}")
    try:
        html_body = email_service.retry_success_email(customer_name, invoice_number, amount, recovery_time)
        subject = f"Payment Recovered Successfully - Invoice {invoice_number}"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            return "Retry success email sent"
        else:
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_retry_success_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_retry_failed_again_email_task(self, customer_name: str, customer_email: str, invoice_number: str, attempt: int, max_attempts: int, failure_reason: str, next_retry_date: str):
    logger.info(f"Triggering send_retry_failed_again_email_task for {customer_email}")
    try:
        html_body = email_service.retry_failed_again_email(customer_name, invoice_number, attempt, max_attempts, failure_reason, next_retry_date)
        subject = f"Payment Retry Attempt Failed - Action Required ({invoice_number})"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            return "Retry failed again email sent"
        else:
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_retry_failed_again_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_retry_exhausted_email_task(self, customer_name: str, customer_email: str, invoice_number: str, max_attempts: int):
    logger.info(f"Triggering send_retry_exhausted_email_task for {customer_email}")
    try:
        html_body = email_service.retry_exhausted_email(customer_name, invoice_number, max_attempts)
        subject = f"Urgent: Payment Retry Attempts Exhausted - Subscription Suspended ({invoice_number})"
        success = email_service.send_email(customer_email, subject, html_body)
        if success:
            return "Retry exhausted email sent"
        else:
            raise Exception("SMTP delivery failed")
    except Retry:
        raise
    except Exception as e:
        logger.error(f"Error in send_retry_exhausted_email_task: {e}", exc_info=True)
        raise self.retry(exc=e)
