import smtplib
import logging
import html
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core import config

# Set up logging for the email service
logger = logging.getLogger("billflow.email")
logger.setLevel(logging.INFO)

# Standard template wrapper to maintain consistent branding and responsive layout
def _get_base_template(name: str, content_html: str, header_color_start: str = "#8B5CF6", header_color_end: str = "#6D28D9") -> str:
    current_year = datetime.now().year
    escaped_name = html.escape(name) if name else ""
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(config.APP_NAME)} Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080811; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #FFFFFF;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #11111B; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); border-collapse: collapse;">
        <!-- Header -->
        <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, {header_color_start}, {header_color_end});">
                <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">{html.escape(config.APP_NAME)}</h1>
                <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">Premium OTT Streaming Platform</p>
            </td>
        </tr>
        <!-- Content -->
        <tr>
            <td style="padding: 40px 30px; background-color: #11111B;">
                <p style="margin-top: 0; margin-bottom: 20px; font-size: 16px; line-height: 24px; color: #FFFFFF; font-weight: 500;">Hello {escaped_name},</p>
                {content_html}
            </td>
        </tr>
        <!-- Footer -->
        <tr>
            <td style="padding: 30px; background-color: #0d0d18; border-top: 1px solid #1f1f33; text-align: center;">
                <p style="margin: 0; 0 5px 0; font-size: 14px; color: #FFFFFF; font-weight: 700;">© {current_year} {html.escape(config.APP_NAME)}</p>
                <p style="margin: 0 0 15px 0; font-size: 12px; color: #B3B3B3; font-weight: 500;">Premium OTT Streaming Platform</p>
                <p style="margin: 0 0 15px 0; font-size: 11px; color: #808080; line-height: 16px;">
                    This is an automated notification regarding your account subscription. Please do not reply directly to this email.
                </p>
                <div style="border-top: 1px solid #1f1f33; padding-top: 15px; margin-top: 15px;">
                    <a href="{config.FRONTEND_URL}" style="color: #8B5CF6; text-decoration: none; font-size: 12px; font-weight: 700; margin: 0 10px; text-transform: uppercase; letter-spacing: 0.5px;">Dashboard</a>
                    <span style="color: #2d2d44;">|</span>
                    <a href="mailto:support@streamverse.com" style="color: #8B5CF6; text-decoration: none; font-size: 12px; font-weight: 700; margin: 0 10px; text-transform: uppercase; letter-spacing: 0.5px;">Support</a>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
"""

# Reusable HTML template functions

def welcome_email(name: str) -> str:
    content = """
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Thank you for choosing <strong>StreamVerse</strong>! We are thrilled to have you on board.
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Your account is fully set up. You can now start watching unlimited movies, TV shows, and exclusive originals on the premium OTT platform.
    </p>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Start Watching</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#6D28D9")

def trial_expired_email(name: str) -> str:
    content = """
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        We wanted to let you know that your trial period on <strong>StreamVerse</strong> has expired.
    </p>
    <div style="background-color: #22121d; border-left: 4px solid #EC4899; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 15px; line-height: 22px; color: #fbcfe8; font-weight: 600;">
            To continue streaming premium content in Ultra HD and HDR, please upgrade your subscription plan.
        </p>
    </div>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Upgrade Now</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#6D28D9")

def invoice_email(name: str, invoice_number: str, amount: float, due_date: str) -> str:
    from app.core.database import SessionLocal
    from app.models.invoice import Invoice
    from app.models.subscription import Subscription
    
    escaped_invoice_number = html.escape(invoice_number) if invoice_number else ""
    escaped_due_date = html.escape(due_date) if due_date else ""
    
    db = SessionLocal()
    plan_name = "StreamVerse Plan"
    invoice_date_str = ""
    status_str = "UNPAID"
    cur_code = "INR"
    t_name = "GST"
    t_pct = 18.0
    t_amt = 0.0
    base_amt = amount
    tot_amt = amount
    
    try:
        inv = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
        if inv:
            status_str = inv.status.value.upper() if hasattr(inv.status, "value") else str(inv.status).upper()
            invoice_date_str = inv.generated_at.strftime('%Y-%m-%d') if inv.generated_at else ""
            cur_code = inv.currency_code or "INR"
            t_name = getattr(inv, "tax_name", "GST") or "GST"
            t_pct = getattr(inv, "tax_percentage", inv.gst_percentage)
            t_amt = getattr(inv, "tax_amount", inv.gst_amount)
            base_amt = inv.base_amount
            tot_amt = inv.total_amount
            if inv.subscription_id:
                sub = db.query(Subscription).filter(Subscription.id == inv.subscription_id).first()
                if sub and sub.plan:
                    plan_name = sub.plan.name
    except Exception as e:
        logger.error(f"Error resolving plan details for email: {e}")
    finally:
        db.close()
        
    plan_name = html.escape(plan_name) if plan_name else ""
    cur_code = html.escape(cur_code) if cur_code else ""
    t_name = html.escape(t_name) if t_name else ""
    invoice_date_str = html.escape(invoice_date_str) if invoice_date_str else ""
    status_str = html.escape(status_str) if status_str else ""
        
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        A new invoice has been generated for your account. Please find your billing details below:
    </p>
    <div style="background-color: #1E293B; border-left: 4px solid #33D69F; padding: 12px 16px; margin: 15px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #33D69F; font-weight: 600;">
            📎 Your official tax invoice PDF is attached to this email (INV-{escaped_invoice_number}.pdf).
        </p>
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f1f33; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #2d2d44;">
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Invoice Number</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{escaped_invoice_number}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Plan Name</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{plan_name}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Base Amount</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 650; text-align: right;">{cur_code} {base_amt:.2f}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">{t_name} ({t_pct}%)</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 650; text-align: right;">{cur_code} {t_amt:.2f}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Grand Total</td>
            <td style="padding: 6px 0; font-size: 16px; color: #8B5CF6; font-weight: 800; text-align: right;">{cur_code} {tot_amt:.2f}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Invoice Date</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 600; text-align: right;">{invoice_date_str}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Payment Status</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 600; text-align: right;">{status_str}</td>
        </tr>
    </table>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">View / Download Invoice</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#6D28D9")

def payment_success_email(name: str, invoice_number: str) -> str:
    from app.core.database import SessionLocal
    from app.models.invoice import Invoice
    from app.models.subscription import Subscription
    from app.models.payment import Payment
 
    escaped_invoice_number = html.escape(invoice_number) if invoice_number else ""
 
    db = SessionLocal()
    plan_name = "StreamVerse Plan"
    amount = 0.0
    status_str = "PAID"
    cur_code = "INR"
    pay_method = "MOCK GATEWAY"
    try:
        inv = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
        if inv:
            status_str = inv.status.value.upper() if hasattr(inv.status, 'value') else str(inv.status).upper()
            amount = inv.total_amount or inv.amount or 0.0
            cur_code = inv.currency_code or "INR"
            if inv.subscription_id:
                sub = db.query(Subscription).filter(Subscription.id == inv.subscription_id).first()
                if sub and sub.plan:
                    plan_name = sub.plan.name
            
            # Lookup payment method dynamically
            payment = db.query(Payment).filter(Payment.invoice_id == inv.id).first()
            if payment and payment.payment_method:
                pm = payment.payment_method
                m_type = str(pm.method_type.value).upper() if hasattr(pm.method_type, 'value') else str(pm.method_type).upper()
                prov = str(pm.provider).upper() if pm.provider else ""
                pay_method = f"{m_type} ({prov})" if prov else m_type
    except Exception as e:
        logger.error(f"Error resolving invoice details for payment success email: {e}")
    finally:
        db.close()
 
    plan_name = html.escape(plan_name) if plan_name else ""
    cur_code = html.escape(cur_code) if cur_code else ""
    status_str = html.escape(status_str) if status_str else ""
    pay_method = html.escape(pay_method) if pay_method else ""
 
    content = f"""
    <div style="text-align: center; padding: 10px 0 20px 0;">
        <div style="display: inline-block; background-color: #D1FAE5; color: #065F46; font-size: 12px; font-weight: 800; padding: 6px 16px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
            Payment Successful
        </div>
        <h2 style="margin: 0; font-size: 22px; color: #FFFFFF; font-weight: 800;">Thank you for your payment!</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #9CA3AF;">Your subscription is fully active and loaded with premium benefits.</p>
    </div>

    <div style="background-color: #1E1B4B; border-left: 4px solid #8B5CF6; padding: 16px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #E0E7FF; font-weight: 500;">
            <strong>📎 Invoice PDF Attached:</strong> We have attached your official tax invoice <strong>StreamVerse-INV-{escaped_invoice_number}.pdf</strong> directly to this email for your records.
        </p>
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1E1E2E; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #2A2A3E;">
        <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #9CA3AF; font-weight: 500;">Invoice Number</td>
            <td style="padding: 8px 0; font-size: 13px; color: #FFFFFF; font-weight: 700; text-align: right;">{escaped_invoice_number}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #9CA3AF; font-weight: 500;">Plan Selected</td>
            <td style="padding: 8px 0; font-size: 13px; color: #FFFFFF; font-weight: 700; text-align: right;">{plan_name}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #9CA3AF; font-weight: 500;">Payment Method</td>
            <td style="padding: 8px 0; font-size: 13px; color: #FFFFFF; font-weight: 700; text-align: right;">{pay_method}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #9CA3AF; font-weight: 500;">Grand Total</td>
            <td style="padding: 8px 0; font-size: 16px; color: #8B5CF6; font-weight: 800; text-align: right;">{cur_code} {amount:.2f}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #9CA3AF; font-weight: 500;">Payment Status</td>
            <td style="padding: 8px 0; font-size: 13px; color: #10B981; font-weight: 800; text-align: right; text-transform: uppercase;">{status_str}</td>
        </tr>
    </table>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 14px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Download Invoice</a>
    </div>

    <div style="border-top: 1px solid #2A2A3E; padding-top: 20px; margin-top: 20px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #FFFFFF; font-weight: 700;">Need Support?</h4>
        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9CA3AF;">
            If you have any questions about this charge or your billing, please visit our <a href="{config.FRONTEND_URL}" style="color: #8B5CF6; text-decoration: none;">Help Center</a> or email us at <a href="mailto:support@streamverse.com" style="color: #8B5CF6; text-decoration: none;">support@streamverse.com</a>.
        </p>
    </div>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#06B6D4")

def _get_invoice_currency(invoice_number: str) -> str:
    from app.core.database import SessionLocal
    from app.models.invoice import Invoice
    db = SessionLocal()
    try:
        inv = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
        if inv:
            return inv.currency_code or "INR"
    except Exception:
        pass
    finally:
        db.close()
    return "INR"

def payment_failed_email(
    name: str, 
    invoice_number: str, 
    failure_reason: str, 
    failed_amount: float, 
    retry_attempt: int, 
    max_attempts: int, 
    next_retry_date: str
) -> str:
    escaped_invoice_number = html.escape(invoice_number) if invoice_number else ""
    escaped_failure_reason = html.escape(failure_reason) if failure_reason else ""
    escaped_next_retry_date = html.escape(next_retry_date) if next_retry_date else ""
    
    remaining = max_attempts - retry_attempt
    cur_code = _get_invoice_currency(invoice_number)
    cur_code = html.escape(cur_code) if cur_code else ""
    
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        We were unable to process your payment of <strong>{cur_code} {failed_amount:.2f}</strong> for invoice <strong>{escaped_invoice_number}</strong>.
    </p>
    <div style="background-color: #22121d; border-left: 4px solid #EC4899; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #fbcfe8; font-weight: 600;">
            Reason: {escaped_failure_reason}
        </p>
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f1f33; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #2d2d44;">
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Failed Amount</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{cur_code} {failed_amount:.2f}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Retry Attempt</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{retry_attempt} / {max_attempts}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Remaining Attempts</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{remaining}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Next Scheduled Retry</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{escaped_next_retry_date}</td>
        </tr>
    </table>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 25px; font-size: 14px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 10px 10px 10px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Retry Now</a>
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #1f1f33; color: #FFFFFF; padding: 12px 25px; font-size: 14px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #2d2d44; margin: 0 10px 10px 10px;">Update Payment Method</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#6D28D9")

def retry_success_email(
    name: str, 
    invoice_number: str, 
    amount: float, 
    recovery_time: str
) -> str:
    escaped_invoice_number = html.escape(invoice_number) if invoice_number else ""
    escaped_recovery_time = html.escape(recovery_time) if recovery_time else ""
    
    cur_code = _get_invoice_currency(invoice_number)
    cur_code = html.escape(cur_code) if cur_code else ""
    
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Great news! We have successfully recovered your failed payment. Your subscription remains active with uninterrupted premium access.
    </p>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f1f33; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #2d2d44;">
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Invoice Number</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{escaped_invoice_number}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Amount</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{cur_code} {amount:.2f}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Subscription Status</td>
            <td style="padding: 6px 0; font-size: 14px; color: #10B981; font-weight: 700; text-align: right; text-transform: uppercase;">ACTIVE</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Recovery Time</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{escaped_recovery_time}</td>
        </tr>
    </table>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Go to Dashboard</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#10B981")

def retry_failed_again_email(
    name: str, 
    invoice_number: str, 
    attempt: int, 
    max_attempts: int, 
    failure_reason: str, 
    next_retry_date: str
) -> str:
    escaped_invoice_number = html.escape(invoice_number) if invoice_number else ""
    escaped_failure_reason = html.escape(failure_reason) if failure_reason else ""
    escaped_next_retry_date = html.escape(next_retry_date) if next_retry_date else ""
    
    remaining = max_attempts - attempt
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        We made another attempt to recover your failed payment for invoice <strong>{escaped_invoice_number}</strong>, but it was unsuccessful.
    </p>
    <div style="background-color: #22121d; border-left: 4px solid #EC4899; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #fbcfe8; font-weight: 600;">
            Reason: {escaped_failure_reason}
        </p>
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f1f33; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #2d2d44;">
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Failed Attempt</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{attempt} / {max_attempts}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Remaining Attempts</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{remaining}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Next Scheduled Retry</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{escaped_next_retry_date}</td>
        </tr>
    </table>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Retry Now</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#D97706")

def retry_exhausted_email(
    name: str, 
    invoice_number: str, 
    max_attempts: int
) -> str:
    escaped_invoice_number = html.escape(invoice_number) if invoice_number else ""
    
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        We have exhausted all <strong>{max_attempts}</strong> automated attempts to recover your failed payment for invoice <strong>{escaped_invoice_number}</strong>.
    </p>
    <div style="background-color: #22121d; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 15px; line-height: 22px; color: #fee2e2; font-weight: 600;">
            Your premium OTT streaming subscription has been cancelled and suspended due to non-payment.
        </p>
    </div>
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Please update your payment method and pay the outstanding invoice to reactivate your subscription.
    </p>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #EF4444; color: #FFFFFF; padding: 12px 25px; font-size: 14px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 10px 10px 10px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);">Pay Now</a>
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #1f1f33; color: #FFFFFF; padding: 12px 25px; font-size: 14px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #2d2d44; margin: 0 10px 10px 10px;">Update Payment Method</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3;">
        If you require assistance, please contact our support team at <a href="mailto:support@streamverse.com" style="color: #8B5CF6; text-decoration: none; font-weight: 700;">support@streamverse.com</a>.
    </p>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#EF4444", "#991B1B")

def trial_started_email(name: str, start_date: str, end_date: str) -> str:
    from app.core.database import SessionLocal
    from app.models.plan import Plan
    
    escaped_start_date = html.escape(start_date) if start_date else ""
    escaped_end_date = html.escape(end_date) if end_date else ""
    
    db = SessionLocal()
    try:
        plan = db.query(Plan).filter(Plan.trial_period_days > 0, Plan.is_archived == False).first()
        plan_name = plan.name if plan else "Free Trial"
        features_str = plan.features if plan else "4K Ultra HD, HDR Streaming, 4 Screens, Unlimited Movies & Series, Downloads, Ad Free"
        trial_days = plan.trial_period_days if plan else 7
    finally:
        db.close()
        
    plan_name = html.escape(plan_name) if plan_name else ""
    features_str = html.escape(features_str) if features_str else ""

    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Your free trial of <strong>{plan_name}</strong> has officially started!
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Here are your free trial details:
    </p>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f1f33; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #2d2d44;">
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Plan Name</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{plan_name}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Trial Duration</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{trial_days} Days</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Start Date</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{escaped_start_date}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">End Date</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{escaped_end_date}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Benefits Included</td>
            <td style="padding: 6px 0; font-size: 14px; color: #8B5CF6; font-weight: 700; text-align: right;">{features_str}</td>
        </tr>
    </table>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Upgrade Now</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#6D28D9")

def trial_expiry_reminder_email(name: str, expiry_date: str) -> str:
    escaped_expiry_date = html.escape(expiry_date) if expiry_date else ""
    
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        We hope you are enjoying your premium experience on <strong>StreamVerse</strong>!
    </p>
    <div style="background-color: #22121d; border-left: 4px solid #EC4899; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 15px; line-height: 22px; color: #fbcfe8; font-weight: 600;">
            Your free trial will end soon on <strong>{escaped_expiry_date}</strong>.
        </p>
    </div>
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        To prevent any disruption to your streaming access and keep enjoying 4K Ultra HD content, please update your billing preferences.
    </p>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Keep Premium Access</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#6D28D9")

def subscription_activated_email(name: str, plan_name: str, price: float, billing_interval: str, start_date: str, next_billing_date: str) -> str:
    plan_name = html.escape(plan_name) if plan_name else ""
    billing_interval = html.escape(billing_interval) if billing_interval else ""
    start_date = html.escape(start_date) if start_date else ""
    next_billing_date = html.escape(next_billing_date) if next_billing_date else ""
    
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Your StreamVerse subscription is now fully active! Get ready to explore unlimited entertainment.
    </p>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f1f33; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #2d2d44;">
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Plan Name</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{plan_name}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Price</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">₹{price:,.2f} / {billing_interval}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Start Date</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{start_date}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Next Billing Date</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{next_billing_date}</td>
        </tr>
    </table>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Continue Watching</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#6D28D9")

def plan_upgraded_email(name: str, old_plan: str, new_plan: str, price_difference: float, effective_date: str, customer_email: str = None) -> str:
    from app.core.database import SessionLocal
    from app.models.customer import Customer
    from app.models.invoice import Invoice
    
    db = SessionLocal()
    
    previous_plan_name = old_plan
    previous_plan_price = 0.0
    new_plan_name = new_plan
    new_plan_price = 0.0
    upgrade_difference = price_difference
    base_amount = price_difference
    gst_amount = price_difference * 0.18
    total_amount = price_difference + gst_amount
    
    invoice_date_str = effective_date
    status_str = "PAID"
    try:
        if customer_email:
            customer = db.query(Customer).filter(Customer.email == customer_email).first()
            if customer:
                # Find the latest PLAN_UPGRADE invoice for this customer
                inv = db.query(Invoice).filter(
                    Invoice.customer_id == customer.id,
                    Invoice.invoice_type == "PLAN_UPGRADE"
                ).order_by(Invoice.id.desc()).first()
                
                if inv:
                    previous_plan_name = inv.previous_plan_name or old_plan
                    previous_plan_price = inv.previous_plan_price or 0.0
                    new_plan_name = inv.new_plan_name or new_plan
                    new_plan_price = inv.new_plan_price or 0.0
                    upgrade_difference = inv.upgrade_difference if inv.upgrade_difference is not None else price_difference
                    base_amount = inv.base_amount
                    gst_amount = inv.gst_amount
                    total_amount = inv.total_amount
                    status_str = inv.status.value.upper()
                    invoice_date_str = inv.generated_at.strftime('%Y-%m-%d') if inv.generated_at else effective_date
    except Exception as e:
        logger.error(f"Error loading upgrade invoice details for email: {e}")
    finally:
        db.close()
        
    previous_plan_name = html.escape(previous_plan_name) if previous_plan_name else ""
    new_plan_name = html.escape(new_plan_name) if new_plan_name else ""
    invoice_date_str = html.escape(invoice_date_str) if invoice_date_str else ""
    status_str = html.escape(status_str) if status_str else ""
    effective_date = html.escape(effective_date) if effective_date else ""

    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Great news! Your StreamVerse subscription has been successfully upgraded.
    </p>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f1f33; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #2d2d44;">
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Previous Plan</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{previous_plan_name} (₹{previous_plan_price:.2f})</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">New Plan</td>
            <td style="padding: 6px 0; font-size: 14px; color: #8B5CF6; font-weight: 700; text-align: right;">{new_plan_name} (₹{new_plan_price:.2f})</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Difference</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">₹{upgrade_difference:.2f}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Base Amount</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 600; text-align: right;">₹{base_amount:.2f}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">GST (18%)</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 600; text-align: right;">₹{gst_amount:.2f}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Total Charged</td>
            <td style="padding: 6px 0; font-size: 16px; color: #8B5CF6; font-weight: 800; text-align: right;">₹{total_amount:.2f}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Invoice Date</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{invoice_date_str}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Payment Status</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{status_str}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Effective Date</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{effective_date}</td>
        </tr>
    </table>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Continue Watching</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#6D28D9")

def plan_downgraded_email(name: str, old_plan: str, new_plan: str, effective_date: str, explanation: str) -> str:
    escaped_old_plan = html.escape(old_plan) if old_plan else ""
    escaped_new_plan = html.escape(new_plan) if new_plan else ""
    escaped_effective_date = html.escape(effective_date) if effective_date else ""
    escaped_explanation = html.escape(explanation) if explanation else ""
    
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        This email confirms your subscription downgrade details.
    </p>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f1f33; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #2d2d44;">
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Previous Plan</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{escaped_old_plan}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Downgraded Plan</td>
            <td style="padding: 6px 0; font-size: 14px; color: #8B5CF6; font-weight: 700; text-align: right;">{escaped_new_plan}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #B3B3B3; font-weight: 500;">Effective Date</td>
            <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 700; text-align: right;">{escaped_effective_date}</td>
        </tr>
    </table>
    <div style="background-color: #262626; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #8B5CF6;">
        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #B3B3B3;">
            {escaped_explanation}
        </p>
    </div>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Go to Dashboard</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#6D28D9")

def plan_cancellation_email(name: str, effective_date: str) -> str:
    escaped_effective_date = html.escape(effective_date) if effective_date else ""
    
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        We are sorry to see you go! This email confirms your subscription cancellation.
    </p>
    <div style="background-color: #22121d; border-left: 4px solid #EC4899; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 15px; line-height: 22px; color: #fbcfe8; font-weight: 600;">
            Your subscription remains active and you can continue streaming until <strong>{escaped_effective_date}</strong>.
        </p>
    </div>
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        If you change your mind, you can easily restart your subscription anytime from your billing page.
    </p>
    <div style="text-align: center; margin: 35px 0;">
        <a href="{config.FRONTEND_URL}/billing" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">Restart Subscription</a>
    </div>
    <p style="font-size: 15px; line-height: 24px; color: #B3B3B3; margin-bottom: 0;">
        Thank you,<br>
        The StreamVerse Team
    </p>
    """.replace("{config.FRONTEND_URL}", config.FRONTEND_URL)
    return _get_base_template(name, content, "#8B5CF6", "#6D28D9")

# Reusable send_email helper function using config settings

def send_email(to_email: str, subject: str, html_body: str, attachment_bytes: bytes = None, attachment_filename: str = None):
    """
    Sends an email using the Gmail SMTP credentials configured in the system, with optional PDF attachment.
    """
    from email.mime.application import MIMEApplication

    if subject == "Your 7-Day Free Trial Has Started":
        subject = "Welcome to StreamVerse - Your 7-Day Free Trial Has Started"
        
    # Write the actual sent HTML body to a file for strict audit verification
    try:
        with open("app/last_sent_email.html", "w", encoding="utf-8") as f:
            f.write(html_body)
    except Exception as e:
        logger.error(f"Failed to save last_sent_email.html: {e}")

    logger.info(f"Preparing to send email to {to_email} with subject: '{subject}' (Attachment: {attachment_filename or 'None'})")

    try:
        # Build MIMEMultipart message (mixed if attachment present, alternative otherwise)
        msg = MIMEMultipart("mixed") if attachment_bytes else MIMEMultipart("alternative")
        msg["From"] = config.EMAIL_ADDRESS
        msg["To"] = to_email
        msg["Subject"] = subject

        # Attach HTML content
        msg.attach(MIMEText(html_body, "html"))

        # Attach PDF document if provided
        if attachment_bytes and attachment_filename:
            pdf_attachment = MIMEApplication(attachment_bytes, _subtype="pdf")
            pdf_attachment.add_header("Content-Disposition", "attachment", filename=attachment_filename)
            msg.attach(pdf_attachment)

        # Connect to SMTP server, upgrade to TLS, and login
        logger.info(f"Connecting to SMTP Server {config.SMTP_SERVER}:{config.SMTP_PORT}...")
        server = smtplib.SMTP(config.SMTP_SERVER, config.SMTP_PORT, timeout=15)
        server.ehlo()
        server.starttls() # Secure connection with TLS
        server.ehlo()
        
        logger.info("Logging into SMTP server...")
        server.login(config.EMAIL_ADDRESS, config.EMAIL_PASSWORD)

        # Send the mail
        logger.info(f"Sending message to {to_email}...")
        server.sendmail(config.EMAIL_ADDRESS, to_email, msg.as_string())
        
        server.quit()
        logger.info(f"Email successfully sent to {to_email} with attachment {attachment_filename or 'None'}!")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email} due to error: {e}", exc_info=True)
        return False

def refund_requested_email(name: str, amount: float, currency_code: str = "INR") -> str:
    escaped_currency_code = html.escape(currency_code) if currency_code else ""
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        We have received your refund request for <strong>{escaped_currency_code} {amount:.2f}</strong>.
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Our billing team is currently reviewing your request. We will update you as soon as the review is complete.
    </p>
    """
    return _get_base_template(name, content)

def refund_approved_email(name: str, amount: float, currency_code: str = "INR") -> str:
    escaped_currency_code = html.escape(currency_code) if currency_code else ""
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Your refund request for <strong>{escaped_currency_code} {amount:.2f}</strong> has been approved.
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        The funds will be returned to your original payment method shortly.
    </p>
    """
    return _get_base_template(name, content)

def refund_processing_email(name: str, amount: float, currency_code: str = "INR") -> str:
    escaped_currency_code = html.escape(currency_code) if currency_code else ""
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Your refund of <strong>{escaped_currency_code} {amount:.2f}</strong> is now being processed by our payment gateway.
    </p>
    """
    return _get_base_template(name, content)

def refund_completed_email(name: str, amount: float, currency_code: str = "INR") -> str:
    escaped_currency_code = html.escape(currency_code) if currency_code else ""
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Good news! Your refund of <strong>{escaped_currency_code} {amount:.2f}</strong> has been successfully completed.
    </p>
    """
    return _get_base_template(name, content)

def refund_failed_email(name: str, amount: float, currency_code: str = "INR") -> str:
    escaped_currency_code = html.escape(currency_code) if currency_code else ""
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        We were unable to process your refund of <strong>{escaped_currency_code} {amount:.2f}</strong>.
    </p>
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Please contact our customer support team for further assistance.
    </p>
    """
    return _get_base_template(name, content)

def refund_rejected_email(name: str, amount: float, admin_notes: str, currency_code: str = "INR") -> str:
    escaped_admin_notes = html.escape(admin_notes) if admin_notes else ""
    escaped_currency_code = html.escape(currency_code) if currency_code else ""
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Your refund request for <strong>{escaped_currency_code} {amount:.2f}</strong> has been rejected.
    </p>
    <div style="background-color: #22121d; border-left: 4px solid #EC4899; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 15px; line-height: 22px; color: #fbcfe8; font-weight: 600;">
            Reason: <strong>{escaped_admin_notes}</strong>
        </p>
    </div>
    """
    return _get_base_template(name, content)

def subscription_cancellation_completed_email(name: str, effective_date: str) -> str:
    escaped_effective_date = html.escape(effective_date) if effective_date else ""
    content = f"""
    <p style="font-size: 16px; line-height: 24px; color: #B3B3B3;">
        Your subscription cancellation is now complete. Your access ended on <strong>{escaped_effective_date}</strong>.
    </p>
    """
    return _get_base_template(name, content)
