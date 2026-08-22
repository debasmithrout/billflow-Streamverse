from sqlalchemy.orm import Session
from datetime import datetime
from app.repositories import billing_repository
from app.database.unit_of_work import UnitOfWork

def get_dashboard_stats(db: Session):
    uow = UnitOfWork(db)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    data = billing_repository.get_dashboard_data(uow.session, today_start)

    return {
        "total_customers": data["total_customers"],
        "active_subscriptions": data["active_subscriptions"],
        "trial_users": data["trial_users"],
        "past_due_users": data["past_due_users"],
        "cancelled_users": data["cancelled_users"],
        "monthly_revenue": data["monthly_revenue"],
        "annual_revenue": data["annual_revenue"],
        "total_payments": data["total_payments"],
        "failed_payments": data["failed_payments"],
        "total_invoices": data["total_invoices"],
        "platform_overview": {
            "totalCustomers": data["total_customers"],
            "activePlans": f"{data['active_plans_count']} Available",
            "activeSubscriptions": data["active_subscriptions"],
            "trialUsers": data["trial_users"],
            "monthlyRevenue": f"{int(data['monthly_revenue']):,}"
        },
        "today_summary": {
            "newCustomers": data["new_customers"],
            "newSubscriptions": data["new_subscriptions"],
            "revenue": f"{int(data['today_revenue']):,}",
            "invoicesGenerated": data["invoices_generated"]
        }
    }

def get_billing_analytics(db: Session):
    uow = UnitOfWork(db)
    current_year = datetime.utcnow().year
    data = billing_repository.get_analytics_data(uow.session, current_year)

    paid_count = data["paid_count"]
    failed_count = data["failed_count"]
    
    success_rate = 100
    if (paid_count + failed_count) > 0:
        success_rate = int((paid_count / (paid_count + failed_count)) * 100)

    revenue_chart = []
    months_mapped = {int(row.month): float(row.total) for row in data["month_data"]}
    months_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for idx, name in enumerate(months_names, 1):
        revenue_chart.append({
            "month": name,
            "revenue": months_mapped.get(idx, 0.0)
        })

    return {
        "stats": {
            "totalRevenue": data["total_revenue"],
            "customersCount": data["total_cust"],
            "activeCount": data["active_subs"],
            "trialCount": data["trial_subs"]
        },
        "revenueChart": revenue_chart[-6:],
        "planDistribution": [
            { "name": name, "count": count } for name, count in data["plan_counts"]
        ],
        "paymentsChart": {
            "successRate": success_rate,
            "failedCount": failed_count,
            "successCount": paid_count
        },
        "trendsChart": {
            "signups": data["signups_list"],
            "cancellations": data["cancels_list"],
            "months": data["months_list"]
        }
    }


def get_action_center_stats(db: Session) -> dict:
    from sqlalchemy import func
    from datetime import datetime, timedelta
    from app import models
    from app.services.exchange_rate_service import ExchangeRateService

    uow = UnitOfWork(db)
    session = uow.session
    
    # 1. Overdue Invoices
    overdue_invoices = session.query(models.Invoice).filter(
        models.Invoice.status == models.InvoiceStatus.UNPAID,
        models.Invoice.due_date < datetime.utcnow()
    ).all()
    overdue_count = len(overdue_invoices)
    overdue_amount = sum(inv.total_amount for inv in overdue_invoices)

    # 2. Renewals Today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    renew_cycles = session.query(models.BillingCycle).join(models.Subscription).filter(
        models.Subscription.status == models.SubscriptionStatus.ACTIVE,
        models.BillingCycle.next_billing_date >= today_start,
        models.BillingCycle.next_billing_date < today_end
    ).all()
    renew_count = len(renew_cycles)
    renew_revenue = sum(cycle.subscription.billing_price for cycle in renew_cycles)

    # 3. Failed Payments
    failed_payments = session.query(models.Payment).filter(
        models.Payment.status == models.PaymentStatus.FAILED
    ).all()
    failed_count = len(failed_payments)
    failed_amount = sum(p.amount for p in failed_payments)

    # 4. Refund Approvals Pending
    pending_refunds = session.query(models.Refund).filter(
        models.Refund.status == models.RefundStatus.PENDING
    ).all()
    refund_count = len(pending_refunds)
    refund_amount = sum(r.amount for r in pending_refunds)

    # 5. Trial Users Ending Soon
    trial_ending_count = session.query(models.Subscription).join(models.BillingCycle).filter(
        models.Subscription.status == models.SubscriptionStatus.TRIAL,
        models.BillingCycle.next_billing_date >= datetime.utcnow(),
        models.BillingCycle.next_billing_date <= datetime.utcnow() + timedelta(days=3)
    ).count()

    reporting_currency = ExchangeRateService.get_reporting_currency(session)

    return {
        "reporting_currency": reporting_currency,
        "overdue_invoices": {"count": overdue_count, "amount": overdue_amount},
        "renewals_today": {"count": renew_count, "amount": renew_revenue},
        "failed_payments": {"count": failed_count, "amount": failed_amount},
        "refund_approvals": {"count": refund_count, "amount": refund_amount},
        "trial_users_ending": {"count": trial_ending_count}
    }



def get_revenue_summary(db: Session):
    uow = UnitOfWork(db)
    return billing_repository.get_revenue_summary_data(uow.session)


def get_mrr_analytics(db: Session):
    uow = UnitOfWork(db)
    return billing_repository.get_mrr_data(uow.session)


def get_tax_summary(db: Session):
    from sqlalchemy import func
    from app import models
    uow = UnitOfWork(db)
    session = uow.session

    total_tax = session.query(func.sum(func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount))).filter(
        models.Invoice.status == models.InvoiceStatus.PAID
    ).scalar() or 0.0

    country_res = session.query(
        models.Customer.country,
        func.sum(func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount))
    ).join(models.Invoice, models.Invoice.customer_id == models.Customer.id)\
     .filter(models.Invoice.status == models.InvoiceStatus.PAID)\
     .group_by(models.Customer.country).all()

    tax_by_country = [{"country": r[0], "amount": float(r[1] or 0.0)} for r in country_res]

    type_res = session.query(
        models.Invoice.invoice_type,
        func.sum(func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount))
    ).filter(models.Invoice.status == models.InvoiceStatus.PAID)\
     .group_by(models.Invoice.invoice_type).all()

    tax_by_type = [{"tax_type": r[0] or "RENEWAL", "amount": float(r[1] or 0.0)} for r in type_res]

    return {
        "total_tax_collected": float(total_tax),
        "tax_by_country": tax_by_country,
        "tax_by_type": tax_by_type
    }


def get_tax_report(db: Session, start_date = None, end_date = None):
    from sqlalchemy import func
    from app import models
    uow = UnitOfWork(db)
    session = uow.session

    query = session.query(
        models.Invoice.generated_at,
        models.Invoice.invoice_number,
        models.Invoice.base_amount,
        func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount).label("gst_amount"),
        models.Invoice.total_amount,
        models.Customer.name,
        models.Customer.country
    ).join(models.Customer, models.Invoice.customer_id == models.Customer.id)\
     .filter(models.Invoice.status == models.InvoiceStatus.PAID)

    if start_date:
        query = query.filter(models.Invoice.generated_at >= start_date)
    if end_date:
        query = query.filter(models.Invoice.generated_at <= end_date)

    res = query.order_by(models.Invoice.generated_at.desc()).all()

    report_items = []
    for r in res:
        report_items.append({
            "date": r[0].isoformat() if r[0] else "",
            "invoice_number": r[1],
            "base_amount": float(r[2]),
            "tax_amount": float(r[3]),
            "total_amount": float(r[4]),
            "customer_name": r[5],
            "country": r[6]
        })

    return {
        "report": report_items,
        "total_count": len(report_items)
    }


def get_tax_analytics(db: Session, start_date=None, end_date=None):
    from sqlalchemy import func
    from app import models
    from datetime import datetime, timedelta
    
    # KPIs time ranges
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    today_end = today_start + timedelta(days=1)
    month_start = datetime(now.year, now.month, 1)
    year_start = datetime(now.year, 1, 1)
    
    # 1. Total Tax in filtered range
    total_tax_query = db.query(func.sum(func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount))).filter(
        models.Invoice.status == models.InvoiceStatus.PAID
    )
    if start_date:
        total_tax_query = total_tax_query.filter(models.Invoice.generated_at >= start_date)
    if end_date:
        total_tax_query = total_tax_query.filter(models.Invoice.generated_at <= end_date)
    total_tax_val = total_tax_query.scalar() or 0.0
    
    # 2. Today's Tax
    today_tax_val = db.query(func.sum(func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount))).filter(
        models.Invoice.status == models.InvoiceStatus.PAID,
        models.Invoice.generated_at >= today_start,
        models.Invoice.generated_at < today_end
    ).scalar() or 0.0
    
    # 3. Monthly Tax
    monthly_tax_val = db.query(func.sum(func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount))).filter(
        models.Invoice.status == models.InvoiceStatus.PAID,
        models.Invoice.generated_at >= month_start,
        models.Invoice.generated_at <= now
    ).scalar() or 0.0
    
    # 4. Yearly Tax
    yearly_tax_val = db.query(func.sum(func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount))).filter(
        models.Invoice.status == models.InvoiceStatus.PAID,
        models.Invoice.generated_at >= year_start,
        models.Invoice.generated_at <= now
    ).scalar() or 0.0

    # Trend grouping by date
    trend_query = db.query(
        func.date(models.Invoice.generated_at).label('date'),
        func.sum(func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount)).label('tax')
    ).filter(
        models.Invoice.status == models.InvoiceStatus.PAID
    )
    if start_date:
        trend_query = trend_query.filter(models.Invoice.generated_at >= start_date)
    if end_date:
        trend_query = trend_query.filter(models.Invoice.generated_at <= end_date)
    trend_res = trend_query.group_by(func.date(models.Invoice.generated_at)).order_by(func.date(models.Invoice.generated_at)).all()
    
    trend = [{"date": str(r[0]), "tax": float(r[1] or 0.0)} for r in trend_res]

    # Country breakdown
    country_query = db.query(
        models.Customer.country,
        func.sum(func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount)).label('tax'),
        func.sum(models.Invoice.total_amount).label('revenue')
    ).join(models.Customer, models.Invoice.customer_id == models.Customer.id)\
     .filter(models.Invoice.status == models.InvoiceStatus.PAID)
    if start_date:
        country_query = country_query.filter(models.Invoice.generated_at >= start_date)
    if end_date:
        country_query = country_query.filter(models.Invoice.generated_at <= end_date)
    country_res = country_query.group_by(models.Customer.country).all()
    
    total_tax_in_range = sum(float(r[1] or 0.0) for r in country_res)
    country_breakdown = []
    for r in country_res:
        t_val = float(r[1] or 0.0)
        r_val = float(r[2] or 0.0)
        p_val = (t_val / total_tax_in_range * 100.0) if total_tax_in_range > 0 else 0.0
        country_breakdown.append({
            "country": r[0] or "Unknown",
            "tax": t_val,
            "revenue": r_val,
            "percentage": round(p_val, 2)
        })

    # Plan breakdown
    plan_query = db.query(
        func.coalesce(models.Invoice.new_plan_name, 'Subscription Plan').label('plan_name'),
        func.sum(func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount)).label('tax'),
        func.sum(models.Invoice.total_amount).label('revenue'),
        func.count(func.distinct(models.Invoice.customer_id)).label('customers')
    ).filter(models.Invoice.status == models.InvoiceStatus.PAID)
    if start_date:
        plan_query = plan_query.filter(models.Invoice.generated_at >= start_date)
    if end_date:
        plan_query = plan_query.filter(models.Invoice.generated_at <= end_date)
    plan_res = plan_query.group_by(models.Invoice.new_plan_name).all()
    
    plan_breakdown = []
    for r in plan_res:
        plan_breakdown.append({
            "plan_name": r[0] or "Subscription Plan",
            "tax": float(r[1] or 0.0),
            "revenue": float(r[2] or 0.0),
            "customers": int(r[3] or 0)
        })

    # Payment method breakdown
    pm_query = db.query(
        models.PaymentMethod.method_type,
        func.sum(func.coalesce(models.Invoice.tax_amount, models.Invoice.gst_amount)).label('tax'),
        func.sum(models.Invoice.total_amount).label('revenue')
    ).join(models.Payment, models.Payment.invoice_id == models.Invoice.id)\
     .outerjoin(models.PaymentMethod, models.Payment.payment_method_id == models.PaymentMethod.id)\
     .filter(
         models.Invoice.status == models.InvoiceStatus.PAID,
         models.Payment.status == models.PaymentStatus.SUCCESS
     )
    if start_date:
         pm_query = pm_query.filter(models.Invoice.generated_at >= start_date)
    if end_date:
         pm_query = pm_query.filter(models.Invoice.generated_at <= end_date)
    pm_res = pm_query.group_by(models.PaymentMethod.method_type).all()
    
    payment_method_breakdown = []
    for r in pm_res:
        method = r[0]
        if not method:
            method = "Mock Payment"
        payment_method_breakdown.append({
            "payment_method": method,
            "tax": float(r[1] or 0.0),
            "revenue": float(r[2] or 0.0)
        })

    return {
        "kpis": {
            "total_tax": float(total_tax_val),
            "today_tax": float(today_tax_val),
            "monthly_tax": float(monthly_tax_val),
            "yearly_tax": float(yearly_tax_val)
        },
        "trend": trend,
        "country_breakdown": country_breakdown,
        "plan_breakdown": plan_breakdown,
        "payment_method_breakdown": payment_method_breakdown
    }


