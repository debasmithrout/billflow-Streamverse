from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import List

from app import models, schemas
from app.core.security import hash_password
from app.services.audit_service import log_audit_event
from app.repositories import customer_repository
from app.database.unit_of_work import UnitOfWork
from app.core import exceptions

def resolve_plan_name(db: Session, inv: models.Invoice) -> str:
    if inv.new_plan_name:
        return inv.new_plan_name
    if inv.new_plan_id:
        p = db.query(models.Plan).filter(models.Plan.id == inv.new_plan_id).first()
        if p:
            return p.name
    if inv.subscription and inv.subscription.plan:
        return inv.subscription.plan.name
    if inv.previous_plan_name:
        return inv.previous_plan_name
    return "StreamVerse Plan"

def resolve_prev_plan_name(db: Session, inv: models.Invoice) -> str:
    if inv.previous_plan_name:
        return inv.previous_plan_name
    if inv.previous_plan_id:
        p = db.query(models.Plan).filter(models.Plan.id == inv.previous_plan_id).first()
        if p:
            return p.name
    return "None"

def admin_create_customer(db: Session, customer: schemas.CustomerCreate) -> models.Customer:
    uow = UnitOfWork(db)
    if customer_repository.get_customer_by_email(uow.session, customer.email):
        raise exceptions.DuplicateResource("Email matches an existing account")
    
    from app.services.region_service import RegionService
    region_defaults = RegionService.get_defaults(customer.country)
    
    cust_data = {
        "name": customer.name,
        "email": customer.email,
        "password": hash_password(customer.password),
        "role": models.UserRole.CUSTOMER,
        "phone_number": customer.phone_number,
        "country": customer.country,
        "country_code": region_defaults["country_code"],
        "currency_code": region_defaults["currency_code"],
        "locale": region_defaults["locale"],
        "timezone": region_defaults["timezone"],
        "tax_region": region_defaults["tax_region"],
        "address": customer.address
    }
    new_cust = customer_repository.create_customer(uow.session, cust_data)

    # Create Trial Subscription automatically
    trial_plan = customer_repository.get_first_active_trial_plan(uow.session)
    if not trial_plan:
        trial_plan = customer_repository.get_first_plan(uow.session)

    now = datetime.utcnow()
    renewal_date = now + timedelta(days=trial_plan.trial_period_days if trial_plan else 7)
    
    sub_data = {
        "customer_id": new_cust.id,
        "plan_id": trial_plan.id if trial_plan else 1,
        "status": models.SubscriptionStatus.TRIAL,
        "created_at": now,
        "trial_started_at": now
    }
    new_sub = customer_repository.create_subscription(uow.session, sub_data)

    # Create Billing Cycle
    cycle_data = {
        "customer_id": new_cust.id,
        "subscription_id": new_sub.id,
        "start_date": now,
        "end_date": renewal_date + timedelta(days=30),
        "renewal_date": renewal_date,
        "next_billing_date": renewal_date
    }
    customer_repository.create_billing_cycle(uow.session, cycle_data)

    # Save events in Audit Logs
    log_audit_event(
        uow.session,
        "Customer Created",
        f"Customer '{new_cust.name}' created by Admin.",
        customer_id=new_cust.id
    )

    log_audit_event(
        uow.session,
        "Subscription Created",
        f"Trial Subscription {new_sub.id} automatically initialized on registration.",
        customer_id=new_cust.id
    )

    uow.commit()

    # Trigger customer lifecycle email tasks
    from app.celery_worker import safe_task_delay
    from app.email_tasks import send_welcome_email_task, send_trial_started_email_task
    
    safe_task_delay(send_welcome_email_task, new_cust.name, new_cust.email)
    safe_task_delay(
        send_trial_started_email_task,
        new_cust.name,
        new_cust.email,
        now.strftime("%Y-%m-%d"),
        renewal_date.strftime("%Y-%m-%d")
    )

    return new_cust

def view_customers(db: Session) -> List[models.Customer]:
    uow = UnitOfWork(db)
    return customer_repository.get_all_customers(uow.session)

def get_customer_profile(db: Session, customer_id: int, current_user: models.Customer) -> models.Customer:
    uow = UnitOfWork(db)
    customer = customer_repository.get_customer_by_id(uow.session, customer_id)
    
    if not customer:
        raise exceptions.ResourceNotFound("Customer not found")
        
    # Customer can only view their own profile
    if (
        current_user.role == models.UserRole.CUSTOMER
        and current_user.id != customer_id
    ):
         raise exceptions.AuthorizationFailed("You can only view your own profile")

    return customer

def get_customer_timeline(db: Session, customer_id: int) -> List[dict]:
    uow = UnitOfWork(db)
    timeline = []
    c = customer_repository.get_customer_by_id(uow.session, customer_id)
    if not c:
        return []
        
    timeline.append({
        "id": "ev_created",
        "title": "Subscription Created",
        "description": f"Account initialized under {c.email}.",
        "date": c.created_at.strftime("%Y-%m-%d") if c.created_at else "",
        "time": "09:00 AM",
        "icon": "create"
    })
    
    subs = customer_repository.get_customer_subscriptions(uow.session, customer_id)
    for s in subs:
        timeline.append({
            "id": f"ev_trial_{s.id}",
            "title": "Trial Started",
            "description": "7-day free trial period initialized.",
            "date": s.trial_started_at.strftime("%Y-%m-%d") if s.trial_started_at else "",
            "time": "09:02 AM",
            "icon": "trial"
        })
        
    invs = customer_repository.get_customer_invoices(uow.session, customer_id)
    for i in invs:
        timeline.append({
            "id": f"ev_invoice_{i.id}",
            "title": "Invoice Generated",
            "description": f"Statement {i.invoice_number} issued.",
            "date": i.generated_at.strftime("%Y-%m-%d") if i.generated_at else "",
            "time": "10:00 AM",
            "icon": "invoice"
        })
        
    pays = customer_repository.get_customer_payments(uow.session, customer_id)
    for p in pays:
        cur_code = getattr(p, "currency_code", "INR") or "INR"
        timeline.append({
            "id": f"ev_pay_{p.id}",
            "title": "Payment Successful" if p.status == models.PaymentStatus.SUCCESS else "Payment Failed",
            "description": f"Charge of {cur_code} {p.amount:.2f} {'succeeded' if p.status == models.PaymentStatus.SUCCESS else 'failed'}.",
            "date": p.created_at.strftime("%Y-%m-%d") if p.created_at else "",
            "time": "10:05 AM",
            "icon": "success" if p.status == models.PaymentStatus.SUCCESS else "failed"
        })
        
    timeline.sort(key=lambda x: x["date"])
    return timeline

def delete_customer_account(db: Session, customer_id: int):
    uow = UnitOfWork(db)
    customer = customer_repository.get_customer_by_id(uow.session, customer_id)
    if not customer:
        raise exceptions.ResourceNotFound("Customer not found")
        
    log_audit_event(
        uow.session,
        "Customer Deleted",
        f"Customer account for '{customer.name}' (Email: {customer.email}) deleted.",
        customer_id=None
    )
    
    customer_repository.delete_customer(uow.session, customer_id)
    uow.commit()

def get_customer_invoices(db: Session, customer_id: int) -> List[dict]:
    from app.models.payment import Payment
    from app.models.enums import PaymentStatus, RefundStatus, InvoiceStatus, SubscriptionStatus
    from app.models.refund import Refund
    from app.models.subscription import Subscription
    from app.core import config
    from datetime import datetime, timedelta

    uow = UnitOfWork(db)
    db_invoices = customer_repository.get_customer_invoices(uow.session, customer_id)
    
    # Bulk query successful payments and their active/completed refunds to prevent N+1 query issue
    invoice_ids = [inv.id for inv in db_invoices]
    payments = db.query(Payment).options(joinedload(Payment.payment_method)).filter(
        Payment.invoice_id.in_(invoice_ids),
        Payment.status == PaymentStatus.SUCCESS
    ).all()
    payment_map = {p.invoice_id: p for p in payments}
    
    payment_ids = [p.id for p in payments]
    refunds_map = {}
    if payment_ids:
        refunds = db.query(Refund).filter(
            Refund.payment_id.in_(payment_ids),
            Refund.status.in_([
                RefundStatus.PENDING,
                RefundStatus.APPROVED,
                RefundStatus.PROCESSING,
                RefundStatus.COMPLETED
            ])
        ).all()
        for r in refunds:
            refunds_map.setdefault(r.payment_id, []).append(r)
            
    # Bulk query related subscriptions to prevent N+1 query issue
    subscription_ids = [inv.subscription_id for inv in db_invoices if inv.subscription_id]
    subscriptions = db.query(Subscription).filter(
        Subscription.id.in_(subscription_ids)
    ).all()
    subscription_map = {s.id: s for s in subscriptions}
    
    # Query retry queue records
    from app.models.retry_queue import RetryQueue
    from app.repositories import retry_repository
    retries = db.query(RetryQueue).filter(RetryQueue.invoice_id.in_(invoice_ids)).all()
    retry_map = {}
    for r in retries:
        existing = retry_map.get(r.invoice_id)
        if not existing or r.id > existing.id:
            retry_map[r.invoice_id] = r
            
    max_attempts = retry_repository.get_max_retry_attempts(db)
            
    formatted = []
    
    for inv in db_invoices:
        payment = payment_map.get(inv.id)
        payment_id = payment.id if payment else None
        is_refundable = False
        refund_eligible_until = None
        sub = subscription_map.get(inv.subscription_id)
        
        retry = retry_map.get(inv.id)
        retry_status = None
        if retry:
            from app.models.enums import RetryStatus
            if retry.retry_status == RetryStatus.SUCCESS:
                retry_status = "RECOVERED"
            elif retry.retry_status == RetryStatus.FAILED:
                retry_status = "EXHAUSTED"
            else:
                retry_status = "SCHEDULED"
        elif inv.status == InvoiceStatus.CANCELLED:
            retry_status = "—"
        
        # We check the exact business rules dynamically: status PAID, payment SUCCESS with created_at, sub CANCELLED and sub.cancelled_at not None, not refunded already, cancelled within 24 hours of payment
        if (
            inv.status == InvoiceStatus.PAID 
            and payment 
            and payment.created_at is not None
            and sub 
            and sub.status == SubscriptionStatus.CANCELLED 
            and sub.cancelled_at is not None
        ):
            refund_eligible_until = payment.created_at + timedelta(hours=24)
            has_refunds = len(refunds_map.get(payment.id, [])) > 0
            
            # Verify cancellation occurred after payment but within 24 hours
            within_24h = payment.created_at <= sub.cancelled_at <= (payment.created_at + timedelta(hours=24))
            if within_24h and not has_refunds:
                is_refundable = True

        # Determine payment method display name
        pm_name = None
        if payment and payment.payment_method:
            m_type = payment.payment_method.method_type.lower() if payment.payment_method.method_type else ""
            if m_type == "card":
                pm_name = "Credit Card"
            elif m_type == "upi":
                pm_name = "UPI"
            elif m_type == "netbanking":
                pm_name = "Net Banking"
            elif m_type == "wallet":
                pm_name = "Digital Wallet"
            else:
                pm_name = payment.payment_method.display_name or payment.payment_method.provider or None

        formatted.append({
            "id": inv.id,
            "customer_id": inv.customer_id,
            "subscription_id": inv.subscription_id,
            "invoice_number": inv.invoice_number,
            "amount": inv.amount,
            "status": inv.status.value,
            "generated_at": inv.generated_at,
            "due_date": inv.due_date,
            "pricing_model": inv.pricing_model,
            "invoice_type": inv.invoice_type,
            "plan_name": resolve_plan_name(db, inv),
            "base_amount": inv.base_amount,
            "gst_percentage": inv.gst_percentage,
            "gst_amount": inv.gst_amount,
            "total_amount": inv.total_amount,
            "tax_name": inv.tax_name,
            "tax_code": inv.tax_code,
            "tax_percentage": inv.tax_percentage,
            "tax_amount": inv.tax_amount,
            "currency_code": inv.currency_code,
            "exchange_rate": inv.exchange_rate,
            "base_currency": inv.base_currency,
            "previous_plan_name": resolve_prev_plan_name(db, inv),
            "previous_plan_price": inv.previous_plan_price,
            "new_plan_name": resolve_plan_name(db, inv),
            "new_plan_price": inv.new_plan_price,
            "upgrade_difference": inv.upgrade_difference,
            "proration_credit": getattr(inv, "proration_credit", 0.0),
            "proration_debit": getattr(inv, "proration_debit", 0.0),
            "refund_amount": None,
            "gst_reversal": None,
            "refund_date": None,
            "refund_status": None,
            "original_invoice_reference": None,
            "payment_id": payment_id,
            "payment_method_name": pm_name,
            "is_refundable": is_refundable,
            "refund_eligible_until": refund_eligible_until,
            "retry_status": retry_status,
            "retry_attempt": retry.retry_attempt if retry else None,
            "max_attempts": max_attempts,
            "next_retry_date": retry.next_retry_date if retry else None,
            "last_retry_date": retry.actual_retry_date if retry else None,
            "failure_reason": retry.failure_reason if retry else None
        })
    return formatted


def generate_invoice_pdf(db: Session, invoice_id: int, customer_id: int) -> bytes:
    from app.repositories import invoice_repository
    uow = UnitOfWork(db)

    inv = invoice_repository.get_invoice_by_id(uow.session, invoice_id)
    if not inv or inv.customer_id != customer_id:
        raise exceptions.ResourceNotFound("Invoice not found")

    customer = customer_repository.get_customer_by_id(uow.session, customer_id)

    payment = uow.session.query(models.Payment).filter(
        models.Payment.invoice_id == inv.id
    ).first()

    subscription = uow.session.query(models.Subscription).filter(
        models.Subscription.id == inv.subscription_id
    ).first()

    # ── ReportLab Imports ──────────────────────────────────────────────────────
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        KeepTogether, HRFlowable
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.graphics.shapes import Drawing, Polygon, Rect, Circle
    from io import BytesIO

    styles = getSampleStyleSheet()

    # ── Color Palette (exact reference image) ──────────────────────────────────
    C_PURPLE      = colors.HexColor("#581C87")   # Primary deep purple
    C_PURPLE_MED  = colors.HexColor("#7C3AED")   # Medium purple (header title)
    C_PURPLE_LITE = colors.HexColor("#A78BFA")   # Accent lavender
    C_DARK        = colors.HexColor("#111827")   # Near-black body text
    C_MID         = colors.HexColor("#374151")   # Medium body text
    C_MUTED       = colors.HexColor("#6B7280")   # Muted labels
    C_BORDER      = colors.HexColor("#E5E7EB")   # Card borders
    C_BG          = colors.HexColor("#F9FAFB")   # Card background tint
    C_WHITE       = colors.white
    C_GREEN_BG    = colors.HexColor("#DCFCE7")
    C_GREEN_TEXT  = colors.HexColor("#15803D")
    C_RED_BG      = colors.HexColor("#FEE2E2")
    C_RED_TEXT    = colors.HexColor("#B91C1C")
    C_AMBER_BG    = colors.HexColor("#FEF3C7")
    C_AMBER_TEXT  = colors.HexColor("#B45309")
    C_BLUE_BG     = colors.HexColor("#DBEAFE")
    C_BLUE_TEXT   = colors.HexColor("#1D4ED8")

    # ── Page geometry (A4, 28 pt margins) ─────────────────────────────────────
    PAGE_W, PAGE_H = A4          # 595.27 x 841.89 pt
    LM = RM = 28
    CONTENT_W = PAGE_W - LM - RM   # ≈ 539 pt
    CARD_W   = (CONTENT_W - 16) / 2  # ≈ 261 pt each, 16 pt gap

    # ── Paragraph styles ───────────────────────────────────────────────────────
    def ps(name, **kw):
        base = kw.pop("parent", styles["Normal"])
        return ParagraphStyle(name, parent=base, **kw)

    S_LOGO_NAME   = ps("LogoName",   fontName="Helvetica-Bold", fontSize=22,
                        textColor=C_PURPLE, leading=26)
    S_LOGO_TAG    = ps("LogoTag",    fontName="Helvetica",      fontSize=8.5,
                        textColor=C_MUTED, leading=11)
    S_TAX_INV     = ps("TaxInv",     fontName="Helvetica-Bold", fontSize=20,
                        textColor=C_DARK,  alignment=2, leading=24)
    S_SECTION     = ps("Section",    fontName="Helvetica-Bold", fontSize=10,
                        textColor=C_PURPLE, leading=13, spaceAfter=0)
    S_BODY        = ps("Body",       fontName="Helvetica",      fontSize=8.5,
                        textColor=C_MID, leading=12)
    S_BOLD        = ps("Bold",       fontName="Helvetica-Bold", fontSize=8.5,
                        textColor=C_DARK, leading=12)
    S_LABEL       = ps("Label",      fontName="Helvetica-Bold", fontSize=8,
                        textColor=C_MUTED, leading=11)
    S_VALUE       = ps("Value",      fontName="Helvetica",      fontSize=8.5,
                        textColor=C_DARK, leading=12)
    S_TH          = ps("TH",         fontName="Helvetica-Bold", fontSize=8.5,
                        textColor=C_WHITE)
    S_TH_R        = ps("TH_R",       fontName="Helvetica-Bold", fontSize=8.5,
                        textColor=C_WHITE, alignment=2)
    S_TH_C        = ps("TH_C",       fontName="Helvetica-Bold", fontSize=8.5,
                        textColor=C_WHITE, alignment=1)
    S_TD_R        = ps("TD_R",       fontName="Helvetica",      fontSize=8.5,
                        textColor=C_DARK, alignment=2, leading=12)
    S_TD_C        = ps("TD_C",       fontName="Helvetica",      fontSize=8.5,
                        textColor=C_DARK, alignment=1, leading=12)
    S_SUM_R       = ps("SumR",       fontName="Helvetica",      fontSize=8.5,
                        textColor=C_DARK, alignment=2, leading=12)
    S_SUM_TOTAL_L = ps("SumTotL",    fontName="Helvetica-Bold", fontSize=9,
                        textColor=C_WHITE, leading=12)
    S_SUM_TOTAL_R = ps("SumTotR",    fontName="Helvetica-Bold", fontSize=9,
                        textColor=C_WHITE, alignment=2, leading=12)
    S_FOOT_H      = ps("FootH",      fontName="Helvetica-Bold", fontSize=8,
                        textColor=C_PURPLE, spaceAfter=3)
    S_FOOT_B      = ps("FootB",      fontName="Helvetica",      fontSize=7,
                        textColor=C_MUTED, leading=10)
    S_COPY        = ps("Copy",       fontName="Helvetica",      fontSize=7.5,
                        textColor=C_WHITE, alignment=1, leading=12)

    # ── Helpers ────────────────────────────────────────────────────────────────
    def safe(val, fallback="—"):
        if val is None or str(val).strip() in ("", "None"):
            return fallback
        return str(val).strip()

    # Currency symbol map — Helvetica-safe characters only
    _CUR_SYM = {
        "USD": "$",    "GBP": "\xa3",  "EUR": "\u20ac",
        "JPY": "\xa5", "CNY": "\xa5",  "AUD": "A$",
        "CAD": "C$",   "SGD": "S$",    "HKD": "HK$",
        "INR": "Rs.",
    }
    def cur_sym(code):
        return _CUR_SYM.get(str(code).upper(), str(code))

    def cur_display_str(code):
        """e.g. 'INR (Rs.)' shown in Invoice Details."""
        sym = cur_sym(code)
        return f"{code} ({sym})"

    def fmt_cur(amount, code="INR"):
        """Format an amount with the correct currency prefix."""
        try:
            amount = float(amount) if amount is not None else 0.0
        except (TypeError, ValueError):
            amount = 0.0
        sym = cur_sym(code)
        if amount < 0:
            return f"-{sym} {abs(amount):,.2f}"
        return f"{sym} {amount:,.2f}"

    def fmt_num(amount):
        """Plain number for line items table cells (currency in header)."""
        try:
            v = float(amount) if amount is not None else 0.0
        except (TypeError, ValueError):
            v = 0.0
        if v < 0:
            return f"-{abs(v):,.2f}"
        return f"{v:,.2f}"

    def fmt_date(dt, fmt="%d %b %Y"):
        try:
            return dt.strftime(fmt) if dt else "—"
        except Exception:
            return "—"

    def make_icon(kind, sz=11):
        """Small section icon as a Drawing (light-purple bg, purple shape)."""
        IC_BG = colors.HexColor("#EDE9FE")
        d = Drawing(sz, sz)
        # Rounded background
        d.add(Rect(0, 0, sz, sz, fillColor=IC_BG, strokeColor=C_PURPLE,
                   strokeWidth=0.4, rx=2, ry=2))
        m  = sz * 0.10          # margin inside box
        iw = sz - 2 * m         # inner width
        ih = sz - 2 * m         # inner height
        if kind == 'person':
            # head circle
            d.add(Circle(sz / 2, m + ih * 0.73, ih * 0.21,
                         fillColor=C_PURPLE, strokeColor=None))
            # body rounded rect
            d.add(Rect(m + iw * 0.15, m, iw * 0.70, ih * 0.43,
                       fillColor=C_PURPLE, strokeColor=None, rx=1, ry=1))
        elif kind == 'card':
            # credit-card silhouette
            d.add(Rect(m, m + ih * 0.18, iw, ih * 0.60,
                       fillColor=C_PURPLE, strokeColor=None, rx=1, ry=1))
            # magnetic stripe
            d.add(Rect(m, m + ih * 0.53, iw, ih * 0.12,
                       fillColor=IC_BG, strokeColor=None))
        elif kind == 'doc':
            # document with lines
            d.add(Rect(m + iw * 0.08, m, iw * 0.84, ih,
                       fillColor=C_PURPLE, strokeColor=None, rx=1, ry=1))
            for yf in (0.25, 0.45, 0.63):
                d.add(Rect(m + iw * 0.22, m + ih * yf, iw * 0.56, ih * 0.08,
                           fillColor=IC_BG, strokeColor=None))
        elif kind == 'mail':
            # envelope
            d.add(Rect(m, m + ih * 0.18, iw, ih * 0.60,
                       fillColor=C_PURPLE, strokeColor=None, rx=1, ry=1))
            d.add(Polygon([
                m,         m + ih * 0.78,
                sz / 2,    m + ih * 0.40,
                m + iw,    m + ih * 0.78,
            ], fillColor=IC_BG, strokeColor=None))
        elif kind == 'refresh':
            # circular arrow  — circle outline + small arrowhead
            d.add(Circle(sz / 2, sz / 2, ih * 0.36,
                         fillColor=None, strokeColor=C_PURPLE, strokeWidth=1.3))
            # arrowhead triangle at top
            tip = m + ih * 0.95
            d.add(Polygon([
                sz / 2 - ih * 0.12, tip - ih * 0.18,
                sz / 2,             tip,
                sz / 2 + ih * 0.12, tip - ih * 0.18,
            ], fillColor=C_PURPLE, strokeColor=None))
        elif kind == 'star':
            # 5-point star
            import math
            cx, cy = sz / 2, sz / 2
            ro, ri = ih * 0.44, ih * 0.19
            pts = []
            for i in range(5):
                ao = math.pi / 2 + i * 2 * math.pi / 5
                ai = math.pi / 2 + (i + 0.5) * 2 * math.pi / 5
                pts += [cx + ro * math.cos(ao), cy + ro * math.sin(ao),
                        cx + ri * math.cos(ai), cy + ri * math.sin(ai)]
            d.add(Polygon(pts, fillColor=C_PURPLE, strokeColor=None))
        return d

    def make_card(title, rows, width=CARD_W, icon=None):
        """Bordered white card with purple section heading + content rows."""
        inner_w = width - 20
        # Build title row: optionally prepend a small icon
        if icon:
            ic = make_icon(icon, 11)
            title_inner = Table([[ic, Paragraph(title, S_SECTION)]],
                                colWidths=[15, inner_w - 15])
            title_inner.setStyle(TableStyle([
                ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING",   (0, 0), (-1, -1), 0),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
                ("TOPPADDING",    (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]))
            title_elem = title_inner
        else:
            title_elem = Paragraph(title, S_SECTION)
        # Thin separator line under title
        sep = Table([[""]], colWidths=[inner_w])
        sep.setStyle(TableStyle([
            ("LINEBELOW",      (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING",     (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING",  (0, 0), (-1, -1), 0),
            ("LEFTPADDING",    (0, 0), (-1, -1), 0),
            ("RIGHTPADDING",   (0, 0), (-1, -1), 0),
        ]))
        data = [[title_elem], [sep]]
        for r in rows:
            data.append([r])
        t = Table(data, colWidths=[inner_w])
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), C_WHITE),
            ("BOX",           (0, 0), (-1, -1), 0.75, C_BORDER),
            # Title row
            ("TOPPADDING",    (0, 0), (-1, 0),  10),
            ("BOTTOMPADDING", (0, 0), (-1, 0),  6),
            ("LEFTPADDING",   (0, 0), (-1, 0),  10),
            ("RIGHTPADDING",  (0, 0), (-1, 0),  10),
            # Separator row
            ("TOPPADDING",    (0, 1), (-1, 1),  0),
            ("BOTTOMPADDING", (0, 1), (-1, 1),  0),
            ("LEFTPADDING",   (0, 1), (-1, 1),  10),
            ("RIGHTPADDING",  (0, 1), (-1, 1),  10),
            # Content rows
            ("TOPPADDING",    (0, 2), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 2), (-1, -1), 10),
            ("LEFTPADDING",   (0, 2), (-1, -1), 10),
            ("RIGHTPADDING",  (0, 2), (-1, -1), 10),
        ]))
        outer = Table([[t]], colWidths=[width])
        outer.setStyle(TableStyle([
            ("LEFTPADDING",   (0, 0), (-1, -1), 0),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
            ("TOPPADDING",    (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        return outer

    def kv_table(pairs, label_w=85, sep_w=8, val_w=None, parent_w=None):
        """Key : Value table, borderless, tight spacing."""
        pw = parent_w or (CARD_W - 20)
        vw = val_w or (pw - label_w - sep_w)
        rows = []
        for lbl, val in pairs:
            if isinstance(val, Paragraph):
                v = val
            else:
                v = Paragraph(safe(val), S_VALUE)
            rows.append([
                Paragraph(f"<b>{lbl}</b>", S_LABEL),
                Paragraph(":", S_LABEL),
                v,
            ])
        t = Table(rows, colWidths=[label_w, sep_w, vw])
        t.setStyle(TableStyle([
            ("VALIGN",       (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING",  (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING",   (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 2),
        ]))
        return t

    def side_by_side(left, right, gap=16):
        t = Table([[left, "", right]], colWidths=[CARD_W, gap, CARD_W])
        t.setStyle(TableStyle([
            ("VALIGN",       (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING",  (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING",   (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 0),
        ]))
        return t

    # ── Vector Logo ────────────────────────────────────────────────────────────
    def logo_drawing(size=26):
        d = Drawing(size, size)
        # Dark purple triangle (left half of play icon)
        d.add(Polygon(
            [0, 0, size * 0.58, size * 0.5, 0, size],
            fillColor=C_PURPLE, strokeColor=None
        ))
        # Lavender triangle (right half, smaller)
        d.add(Polygon(
            [size * 0.5, size * 0.25, size, size * 0.5, size * 0.5, size * 0.75],
            fillColor=C_PURPLE_LITE, strokeColor=None
        ))
        return d

    # ── Status badge ───────────────────────────────────────────────────────────
    def status_raw(inv):
        return (inv.status.value.upper()
                if hasattr(inv.status, "value")
                else str(inv.status).upper())

    def make_badge(status_val):
        cfg = {
            "PAID":     (C_GREEN_BG,  C_GREEN_TEXT),
            "FAILED":   (C_RED_BG,    C_RED_TEXT),
            "REFUNDED": (C_BLUE_BG,   C_BLUE_TEXT),
        }
        bg, fg = cfg.get(status_val, (C_AMBER_BG, C_AMBER_TEXT))
        label = status_val.capitalize()
        badge_ps = ps(f"Badge_{status_val}", fontName="Helvetica-Bold",
                      fontSize=8.5, textColor=fg, alignment=1)
        t = Table([[Paragraph(label, badge_ps)]], colWidths=[60])
        t.setStyle(TableStyle([
            ("BACKGROUND",   (0, 0), (-1, -1), bg),
            ("TOPPADDING",   (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 3),
            ("LEFTPADDING",  (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
        ]))
        return t

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION BUILDERS
    # ══════════════════════════════════════════════════════════════════════════

    # ── HEADER ─────────────────────────────────────────────────────────────────
    def build_header():
        ld = logo_drawing(28)
        logo_text_tbl = Table(
            [[Paragraph("StreamVerse", S_LOGO_NAME)],
             [Paragraph("Stream. Enjoy. Anytime.", S_LOGO_TAG)]],
            colWidths=[200]
        )
        logo_text_tbl.setStyle(TableStyle([
            ("LEFTPADDING",  (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING",   (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 1),
        ]))
        left = Table([[ld, logo_text_tbl]], colWidths=[36, 200])
        left.setStyle(TableStyle([
            ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING",  (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING",   (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 0),
        ]))

        sv = status_raw(inv)
        badge = make_badge(sv)
        right = Table(
            [[Paragraph("TAX INVOICE", S_TAX_INV)],
             [badge]],
            colWidths=[CONTENT_W - 240]
        )
        right.setStyle(TableStyle([
            ("ALIGN",        (0, 0), (-1, -1), "RIGHT"),
            ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING",  (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING",   (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 2),
        ]))

        hdr = Table([[left, right]], colWidths=[240, CONTENT_W - 240])
        hdr.setStyle(TableStyle([
            ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING",  (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING",   (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 0),
        ]))
        return hdr

    # ── ROW 1 LEFT: Company Info Card ──────────────────────────────────────────
    def build_company_card():
        # Reference: company name in bold, then address/GSTIN, then contact with icons
        # NO embedded logo inside the card — logo is only in the header
        rows = [
            Paragraph("StreamVerse Private Limited", S_BOLD),
            Paragraph("123, Tech Park, Sector 62,", S_BODY),
            Paragraph("Noida, Uttar Pradesh \u2013 201309, India", S_BODY),
            Paragraph("GSTIN: 09AABCS1234D1Z5", S_BODY),
            Spacer(1, 5),
            Paragraph("\u2315  www.streamverse.com", S_BODY),
            Paragraph("\u2709  support@streamverse.com", S_BODY),
            Paragraph("\u2706  +91 98765 43210", S_BODY),
        ]
        return make_card("Company Details", rows)

    # ── ROW 1 RIGHT: Invoice Details (borderless kv list) ─────────────────────
    def build_invoice_details():
        sv = status_raw(inv)
        sv_cap = sv.capitalize()
        color_map = {
            "PAID":     "#15803D", "FAILED": "#B91C1C",
            "REFUNDED": "#1D4ED8",
        }
        fc = color_map.get(sv, "#B45309")
        status_para = Paragraph(
            f'<font color="{fc}"><b>{sv_cap}</b></font>', S_VALUE
        )

        inv_date = fmt_date(inv.generated_at)
        due_date = fmt_date(inv.due_date)

        interval = "Monthly"
        if subscription and subscription.billing_interval:
            raw = subscription.billing_interval
            interval = (raw.value.capitalize()
                        if hasattr(raw, "value") else str(raw).capitalize())

        days_add = 365 if interval.lower().startswith(("ann", "year")) else 30
        end_dt = (inv.generated_at + timedelta(days=days_add)
                  if inv.generated_at else None)
        billing_period = f"{inv_date} \u2013 {fmt_date(end_dt)}"

        # Reference # — date-based format matching the reference image
        cur_code = safe(inv.currency_code, "INR")
        ref_num = f"REF-{inv.generated_at.strftime('%Y-%m%d')}-{inv.id}" \
            if inv.generated_at else f"REF-{inv.id}"

        pairs = [
            ("Invoice #",      safe(inv.invoice_number)),
            ("Reference #",    ref_num),
            ("Invoice Date",   inv_date),
            ("Due Date",       due_date),
            ("Billing Period", billing_period),
            ("Currency",       cur_display_str(cur_code)),
            ("Status",         status_para),
        ]
        # No card border — just a tight kv list aligned to the right column
        kv = kv_table(pairs, label_w=85, sep_w=8,
                      val_w=CARD_W - 93, parent_w=CARD_W)
        # Wrap so it aligns to the top of the right column
        wrapper = Table([[kv]], colWidths=[CARD_W])
        wrapper.setStyle(TableStyle([
            ("VALIGN",       (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING",  (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING",   (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 0),
        ]))
        return wrapper

    # ── ROW 2 LEFT: Bill To Card ──────────────────────────────────────────────
    def build_customer_card():
        cname   = safe(customer.name if customer else None)
        cid     = f"CUST-{customer.id}" if customer else "—"
        cemail  = safe(customer.email if customer else None)
        cphone  = safe(customer.phone_number if customer else None)
        caddr   = safe(customer.address if customer else None)
        cstate  = safe(getattr(customer, "state", None))
        ccountry= safe(customer.country if customer else None)

        pairs = [
            ("Name",        cname),
            ("Customer ID", cid),
            ("Email",       cemail),
            ("Phone",       cphone),
            ("Address",     caddr),
            ("State",       cstate),
            ("Country",     ccountry),
        ]
        return make_card("Bill To", [kv_table(pairs)], icon="person")

    # ── ROW 2 RIGHT: Subscription Details Card ────────────────────────────────
    def build_subscription_card():
        sub_id = f"SUB-{inv.subscription_id}" if inv.subscription_id else "—"
        plan_name = resolve_plan_name(db, inv)

        interval = "Monthly"
        if subscription and subscription.billing_interval:
            raw = subscription.billing_interval
            interval = (raw.value.capitalize()
                        if hasattr(raw, "value") else str(raw).capitalize())

        renewal = "—"
        if subscription and subscription.billing_cycles:
            cycles = sorted(subscription.billing_cycles,
                            key=lambda c: c.end_date, reverse=True)
            if cycles:
                renewal = fmt_date(cycles[0].next_billing_date)
        if renewal == "—" and inv.due_date:
            renewal = fmt_date(inv.due_date)

        pairs = [
            ("Subscription ID", sub_id),
            ("Plan Name",       plan_name),
            ("Billing Interval",interval),
            ("Renewal Date",    renewal),
        ]
        return make_card("Subscription Details", [kv_table(pairs)], icon="card")

    # ── ROW 3: Itemized Line Items Table ──────────────────────────────────────
    def build_items_table():
        cur      = safe(inv.currency_code, "INR")
        plan_fee = float(inv.new_plan_price or inv.amount or 0.0)
        p_credit = float(getattr(inv, "proration_credit", 0.0) or 0.0)
        p_debit  = float(getattr(inv, "proration_debit",  0.0) or 0.0)
        t_name   = safe(getattr(inv, "tax_name", "GST") or "GST", "GST")
        t_pct    = float(getattr(inv, "tax_percentage", None)
                         or getattr(inv, "gst_percentage", 0) or 0)
        t_amt    = float(getattr(inv, "tax_amount", None)
                         or getattr(inv, "gst_amount",  0) or 0)
        plan_name = resolve_plan_name(db, inv)

        # Column widths sum exactly to CONTENT_W (~539 pt on A4 with 28pt margins)
        # #(28) | Description(desc_w) | Qty(48) | UnitPrice(112) | Amount(112)
        _fixed = 28 + 48 + 112 + 112  # 300
        desc_w = CONTENT_W - _fixed   # ~239
        CW = [28, desc_w, 48, 112, 112]

        def th(txt, align=0):
            sty = {0: S_TH, 1: S_TH_C, 2: S_TH_R}[align]
            return Paragraph(f"<b>{txt}</b>", sty)

        header = [
            th("#"), th("Description"), th("Quantity", 1),
            th(f"Unit Price ({cur})", 2), th(f"Amount ({cur})", 2)
        ]

        row_data = [
            (f"Plan Fee ({plan_name})",       1,  plan_fee),
            ("Proration Credit",              1, -p_credit),
            ("Proration Debit",               1,  p_debit),
            ("Usage Charges",                 1,  0.00),
            ("Discount",                      1,  0.00),
            (f"{t_name} ({t_pct:.1f}%)",     1,  t_amt),
        ]

        body_rows = []
        for i, (desc, qty, amt) in enumerate(row_data, 1):
            body_rows.append([
                Paragraph(str(i), S_TD_C),
                Paragraph(desc,   S_BODY),
                Paragraph(str(qty), S_TD_C),
                Paragraph(fmt_num(amt), S_TD_R),
                Paragraph(fmt_num(amt), S_TD_R),
            ])

        all_rows = [header] + body_rows
        t = Table(all_rows, colWidths=CW)

        row_count = len(all_rows)
        ts = [
            # Header
            ("BACKGROUND",   (0, 0), (-1, 0), C_PURPLE),
            ("TEXTCOLOR",    (0, 0), (-1, 0), C_WHITE),
            # Grid
            ("GRID",         (0, 0), (-1, -1), 0.5, C_BORDER),
            # Alternating body rows
            ("ROWBACKGROUNDS",(0, 1), (-1, -1), [C_WHITE, C_BG]),
            # Padding
            ("TOPPADDING",   (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
            ("LEFTPADDING",  (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        ]
        t.setStyle(TableStyle(ts))
        return t

    # ── ROW 4 LEFT: Payment Details Card ─────────────────────────────────────
    def build_payment_card():
        sv       = status_raw(inv).capitalize()
        txn_id   = safe(payment.transaction_id if payment else None)
        pay_date = "—"
        if payment and payment.created_at:
            pay_date = payment.created_at.strftime("%d %b %Y %I:%M %p")

        pay_method = "—"
        gateway    = "—"
        if payment and payment.payment_method:
            pm = payment.payment_method
            mt = pm.method_type
            pay_method = (mt.value.upper() if hasattr(mt, "value")
                          else str(mt).upper())
            gateway = safe(pm.provider)

        pairs = [
            ("Payment Status", sv),
            ("Transaction ID", txn_id),
            ("Payment Date",   pay_date),
            ("Payment Method", pay_method),
            ("Gateway Name",   gateway),
        ]
        return make_card("Payment Details", [kv_table(pairs)], icon="card")

    # ── ROW 4 RIGHT: Invoice Summary Card ────────────────────────────────────
    def build_summary_card():
        cur      = safe(inv.currency_code, "INR")
        plan_fee = float(inv.new_plan_price or inv.amount or 0.0)
        p_credit = float(getattr(inv, "proration_credit", 0.0) or 0.0)
        p_debit  = float(getattr(inv, "proration_debit",  0.0) or 0.0)
        t_name   = safe(getattr(inv, "tax_name", "GST") or "GST", "GST")
        t_pct    = float(getattr(inv, "tax_percentage", None)
                         or getattr(inv, "gst_percentage", 0) or 0)
        t_amt    = float(getattr(inv, "tax_amount", None)
                         or getattr(inv, "gst_amount",  0) or 0)
        subtotal = plan_fee - p_credit + p_debit
        total    = float(inv.total_amount or 0.0)

        # Summary table fits inside the card's inner content area
        # Card inner col = CARD_W - 20; padding 10pt each side → content = CARD_W - 40
        content_w = CARD_W - 40
        LW = content_w * 0.60
        RW = content_w * 0.40

        def s_row(label, amount):
            return [Paragraph(label, S_BODY),
                    Paragraph(fmt_cur(amount, cur), S_SUM_R)]

        data = [
            s_row("Subtotal",                            subtotal),
            s_row("Total Discount",                      0.00),
            # Proration Credit is a deduction — show as negative
            s_row("Total Proration Credit",             -p_credit),
            s_row("Total Usage Charges",                 0.00),
            s_row(f"Tax Amount ({t_name} {t_pct:.0f}%)", t_amt),
            # Grand Total — purple row, white text
            [Paragraph("<b>Grand Total</b>", S_SUM_TOTAL_L),
             Paragraph(f"<b>{fmt_cur(total, cur)}</b>", S_SUM_TOTAL_R)],
        ]

        t = Table(data, colWidths=[LW, RW])
        t.setStyle(TableStyle([
            # Borders on all non-total rows
            ("GRID",         (0, 0), (-1, -2), 0.5, C_BORDER),
            ("BACKGROUND",   (0, 0), (-1, -2), C_WHITE),
            # Grand Total purple strip
            ("BACKGROUND",   (0, -1), (-1, -1), C_PURPLE),
            ("TEXTCOLOR",    (0, -1), (-1, -1), C_WHITE),
            ("LINEABOVE",    (0, -1), (-1, -1), 1.5, C_PURPLE),
            # Padding
            ("TOPPADDING",   (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
            ("LEFTPADDING",  (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        ]))

        # Wrap in card with 'Invoice Summary' header + doc icon
        return make_card("Invoice Summary", [t], icon="doc")

    # ── ROW 5: Four Footer Cards ───────────────────────────────────────────────────────
    def build_footer_cards():
        FC_W = (CONTENT_W - 3 * 10) / 4   # 4 cards, 3 gaps of 10 pt

        def mini_card(title, lines, icon_kind=None):
            cell_w = FC_W - 14   # inner width (7pt L + 7pt R padding)
            # Title row: optional icon + title text
            if icon_kind:
                ic = make_icon(icon_kind, 10)
                t_inner = Table([[ic, Paragraph(title, S_FOOT_H)]],
                                colWidths=[13, cell_w - 13])
                t_inner.setStyle(TableStyle([
                    ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING",   (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
                    ("TOPPADDING",    (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ]))
                title_row = t_inner
            else:
                title_row = Paragraph(title, S_FOOT_H)
            data = [[title_row]]
            for line in lines:
                data.append([Paragraph(line, S_FOOT_B)])
            t = Table(data, colWidths=[cell_w])
            t.setStyle(TableStyle([
                ("BACKGROUND",   (0, 0), (-1, -1), C_WHITE),
                ("BOX",          (0, 0), (-1, -1), 0.5, C_BORDER),
                ("LEFTPADDING",  (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING",   (0, 0), (-1, 0),  8),
                ("BOTTOMPADDING",(0, 0), (-1, 0),  4),
                ("TOPPADDING",   (0, 1), (-1, -1), 2),
                ("BOTTOMPADDING",(0, 1), (-1, -1), 2),
                # Bottom padding of last row
                ("BOTTOMPADDING",(0, -1), (-1, -1), 8),
            ]))
            outer = Table([[t]], colWidths=[FC_W])
            outer.setStyle(TableStyle([
                ("LEFTPADDING",  (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING",   (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING",(0, 0), (-1, -1), 0),
            ]))
            return outer

        terms   = mini_card("Terms & Conditions", [
            "This is a system-generated invoice",
            "and does not require any signature.",
        ], icon_kind="doc")
        refund  = mini_card("Refund Policy", [
            "Refunds are processed as per our",
            "refund policy. Visit our website",
            "for more details.",
        ], icon_kind="refresh")
        support = mini_card("Support", [
            "support@streamverse.com",
            "+91 98765 43210",
            "www.streamverse.com",
        ], icon_kind="mail")
        thanks  = mini_card("Thank You!", [
            "Thank you for choosing",
            "StreamVerse. We value",
            "your business!",
        ], icon_kind="star")

        GAP = 10
        row = Table(
            [[terms, "", refund, "", support, "", thanks]],
            colWidths=[FC_W, GAP, FC_W, GAP, FC_W, GAP, FC_W]
        )
        row.setStyle(TableStyle([
            ("VALIGN",       (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING",  (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING",   (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 0),
        ]))
        return row

    # ── Copyright Bar ──────────────────────────────────────────────────────────
    def build_copyright():
        copy_text = Paragraph(
            "© 2026 StreamVerse Private Limited. All rights reserved.",
            S_COPY
        )
        t = Table([[copy_text]], colWidths=[CONTENT_W])
        t.setStyle(TableStyle([
            ("BACKGROUND",   (0, 0), (-1, -1), C_PURPLE),
            ("TOPPADDING",   (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
            ("LEFTPADDING",  (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
        ]))
        return t

    # ══════════════════════════════════════════════════════════════════════════
    # BUILD DOCUMENT
    # ══════════════════════════════════════════════════════════════════════════
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=LM, rightMargin=RM,
        topMargin=28,  bottomMargin=28,
    )

    story = [
        build_header(),
        HRFlowable(width="100%", thickness=0.75, color=C_BORDER,
                   spaceAfter=10, spaceBefore=10),
        side_by_side(build_company_card(), build_invoice_details()),
        Spacer(1, 12),
        side_by_side(build_customer_card(), build_subscription_card()),
        Spacer(1, 12),
        build_items_table(),
        Spacer(1, 12),
        side_by_side(build_payment_card(), build_summary_card()),
        Spacer(1, 14),
        build_footer_cards(),
        Spacer(1, 14),
        build_copyright(),
    ]

    doc.build(story)
    return buffer.getvalue()

