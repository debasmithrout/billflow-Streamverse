from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import uuid

from app import models
from app.repositories import invoice_repository
from app.database.unit_of_work import UnitOfWork
from app.core import exceptions

def create_invoice(
    db: Session,
    customer_id: int,
    subscription_id: int,
    base_amount: float,
    status: models.InvoiceStatus,
    invoice_type: str = "RENEWAL",
    previous_plan_id: int = None,
    previous_plan_name: str = None,
    previous_plan_price: float = None,
    new_plan_id: int = None,
    new_plan_name: str = None,
    new_plan_price: float = None,
    upgrade_difference: float = None,
    proration_credit: float = 0.0,
    proration_debit: float = 0.0,
    currency_code: str = "INR"
) -> models.Invoice:
    from app.services.tax_service import TaxService
    uow = UnitOfWork(db)
    
    # Resolve reporting base currency and exchange rate
    from app.services.exchange_rate_service import ExchangeRateService
    base_cur = ExchangeRateService.get_reporting_currency(db)
    rate = ExchangeRateService.get_rate(db, currency_code, base_cur)
    
    customer = uow.session.query(models.Customer).filter(models.Customer.id == customer_id).first()
    country = customer.country if customer else "India"
    c_code = customer.country_code if customer else "IN"
    t_reg = customer.tax_region if customer else "GST"
    t_exempt = customer.tax_exempt if customer else False
    
    tax_breakdown = TaxService.calculate_tax(
        db=db, 
        base_amount=base_amount, 
        country=country, 
        country_code=c_code, 
        tax_region=t_reg, 
        tax_exempt=t_exempt
    )
    pricing_model = "GST_EXCLUSIVE"
    
    invoice_number = f"INV-{uuid.uuid4().hex[:10].upper()}"
    invoice_data = {
        "customer_id": customer_id,
        "subscription_id": subscription_id,
        "invoice_number": invoice_number,
        "amount": base_amount,
        "currency_code": currency_code,
        "exchange_rate": rate,
        "base_currency": base_cur,
        "pricing_model": pricing_model,
        "invoice_type": invoice_type,
        "previous_plan_id": previous_plan_id,
        "previous_plan_name": previous_plan_name,
        "previous_plan_price": previous_plan_price,
        "new_plan_id": new_plan_id,
        "new_plan_name": new_plan_name,
        "new_plan_price": new_plan_price,
        "upgrade_difference": upgrade_difference,
        "proration_credit": proration_credit,
        "proration_debit": proration_debit,
        "base_amount": tax_breakdown["base_amount"],
        "gst_percentage": int(tax_breakdown["tax_percentage"]),
        "gst_amount": tax_breakdown["tax_amount"],
        "total_amount": tax_breakdown["total_amount"],
        
        "tax_name": tax_breakdown["tax_name"],
        "tax_code": tax_breakdown["tax_code"],
        "tax_percentage": tax_breakdown["tax_percentage"],
        "tax_amount": tax_breakdown["tax_amount"],
        
        "due_date": datetime.utcnow() + timedelta(days=7),
        "status": status
    }
    return invoice_repository.create_invoice(uow.session, invoice_data)

def get_admin_invoices(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 5
):
    uow = UnitOfWork(db)
    invoices_list, total_count, stats = invoice_repository.get_invoices_paginated(
        uow.session, search, status, page, limit
    )

    formatted = []
    for i in invoices_list:
        sub = invoice_repository.get_subscription_by_id(uow.session, i.subscription_id)
        plan_name = sub.plan.name if (sub and sub.plan) else "StreamVerse Plan"
        
        formatted.append({
            "id": i.id,
            "invoiceNumber": i.invoice_number,
            "customerId": i.customer_id,
            "customerName": i.customer.name if i.customer else "",
            "planName": plan_name,
            "amount": i.amount,
            "status": i.status.value,
            "generatedDate": i.generated_at.strftime("%Y-%m-%d") if i.generated_at else "",
            "dueDate": i.due_date.strftime("%Y-%m-%d") if i.due_date else "",
            "pdfUrl": "#"
        })

    # Calculate monthly collections trend (last 6 months) for paid invoices
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    trend_rows = db.query(
        func.extract('month', models.Invoice.generated_at).label('month'),
        func.sum(models.Invoice.total_amount).label('total')
    ).filter(
        models.Invoice.status == models.InvoiceStatus.PAID,
        models.Invoice.generated_at >= six_months_ago
    ).group_by(func.extract('month', models.Invoice.generated_at)).all()
    
    # Map months to names
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    current_month = datetime.utcnow().month
    trend_map = {int(r[0]): float(r[1] or 0.0) for r in trend_rows}
    
    monthly_trend = []
    for i in range(5, -1, -1):
        m_idx = (current_month - i - 1) % 12 + 1
        monthly_trend.append({
            "month": month_names[m_idx - 1],
            "amount": trend_map.get(m_idx, 0.0)
        })

    return {
        "invoices": formatted,
        "totalCount": total_count,
        "stats": stats,
        "monthly_trend": monthly_trend
    }

def get_admin_invoice_by_id(db: Session, invoice_id: int):
    uow = UnitOfWork(db)
    i = invoice_repository.get_invoice_by_id(uow.session, invoice_id)
    if not i:
        raise exceptions.ResourceNotFound("Invoice not found")
        
    sub = invoice_repository.get_subscription_by_id(uow.session, i.subscription_id)
    plan_name = sub.plan.name if (sub and sub.plan) else "StreamVerse Plan"

    return {
        "id": i.id,
        "invoiceNumber": i.invoice_number,
        "customerId": i.customer_id,
        "customerName": i.customer.name if i.customer else "",
        "planName": plan_name,
        "amount": i.amount,
        "status": i.status.value,
        "generatedDate": i.generated_at.strftime("%Y-%m-%d") if i.generated_at else "",
        "dueDate": i.due_date.strftime("%Y-%m-%d") if i.due_date else "",
        "pdfUrl": "#"
    }
