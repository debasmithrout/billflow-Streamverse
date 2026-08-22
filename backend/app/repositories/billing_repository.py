from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app import models
from app.models.exchange_rate import ExchangeRate
from app.services.exchange_rate_service import ExchangeRateService

def get_dashboard_data(db: Session, today_start: datetime) -> dict:
    base_cur = ExchangeRateService.get_reporting_currency(db)
    
    total_customers = db.query(models.Customer).filter(models.Customer.role == models.UserRole.CUSTOMER).count()
    active_subscriptions = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.ACTIVE).count()
    trial_users = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.TRIAL).count()
    past_due_users = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.PAST_DUE).count()
    cancelled_users = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.CANCELLED).count()
    
    monthly_rev = db.query(
        func.sum(
            models.Subscription.billing_price * func.coalesce(ExchangeRate.rate, 1.0)
        )
    ).outerjoin(
        ExchangeRate,
        (ExchangeRate.from_currency == models.Subscription.currency_code) & 
        (ExchangeRate.to_currency == base_cur)
    ).filter(
        models.Subscription.status == models.SubscriptionStatus.ACTIVE,
        models.Subscription.billing_interval == models.BillingInterval.MONTHLY
    ).scalar() or 0.0
    
    annual_rev = db.query(
        func.sum(
            models.Subscription.billing_price * func.coalesce(ExchangeRate.rate, 1.0)
        )
    ).outerjoin(
        ExchangeRate,
        (ExchangeRate.from_currency == models.Subscription.currency_code) & 
        (ExchangeRate.to_currency == base_cur)
    ).filter(
        models.Subscription.status == models.SubscriptionStatus.ACTIVE,
        models.Subscription.billing_interval == models.BillingInterval.ANNUAL
    ).scalar() or 0.0
    
    total_payments = db.query(models.Payment).filter(models.Payment.status == models.PaymentStatus.SUCCESS).count()
    failed_payments = db.query(models.Payment).filter(models.Payment.status == models.PaymentStatus.FAILED).count()
    total_invoices = db.query(models.Invoice).count()
    
    active_plans_count = db.query(models.Plan).filter(models.Plan.is_archived == False).count()
    
    new_customers = db.query(models.Customer).filter(models.Customer.role == models.UserRole.CUSTOMER, models.Customer.created_at >= today_start).count()
    new_subscriptions = db.query(models.Subscription).filter(models.Subscription.created_at >= today_start).count()
    
    today_revenue = db.query(
        func.sum(models.Payment.amount * models.Payment.exchange_rate)
    ).filter(
        models.Payment.status == models.PaymentStatus.SUCCESS, 
        models.Payment.created_at >= today_start
    ).scalar() or 0.0
    
    invoices_generated = db.query(models.Invoice).filter(models.Invoice.generated_at >= today_start).count()

    return {
        "total_customers": total_customers,
        "active_subscriptions": active_subscriptions,
        "trial_users": trial_users,
        "past_due_users": past_due_users,
        "cancelled_users": cancelled_users,
        "monthly_revenue": monthly_rev,
        "annual_revenue": annual_rev,
        "total_payments": total_payments,
        "failed_payments": failed_payments,
        "total_invoices": total_invoices,
        "active_plans_count": active_plans_count,
        "new_customers": new_customers,
        "new_subscriptions": new_subscriptions,
        "today_revenue": today_revenue,
        "invoices_generated": invoices_generated
    }

def get_analytics_data(db: Session, current_year: int) -> dict:
    total_cust = db.query(models.Customer).filter(models.Customer.role == models.UserRole.CUSTOMER).count()
    active_subs = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.ACTIVE).count()
    trial_subs = db.query(models.Subscription).filter(models.Subscription.status == models.SubscriptionStatus.TRIAL).count()
    
    total_revenue = db.query(
        func.sum(models.Payment.amount * models.Payment.exchange_rate)
    ).filter(
        models.Payment.status == models.PaymentStatus.SUCCESS
    ).scalar() or 0.0

    # Dynamic plan distribution query (groups active subscriptions by plan name)
    plan_counts_raw = db.query(
        models.Plan.name,
        func.count(models.Subscription.id)
    ).join(
        models.Subscription, models.Subscription.plan_id == models.Plan.id
    ).filter(
        models.Subscription.status == models.SubscriptionStatus.ACTIVE
    ).group_by(models.Plan.name).all()

    plan_counts = [(r[0], int(r[1] or 0)) for r in plan_counts_raw]

    paid_count = db.query(models.Payment).filter(models.Payment.status == models.PaymentStatus.SUCCESS).count()
    failed_count = db.query(models.Payment).filter(models.Payment.status == models.PaymentStatus.FAILED).count()
    
    month_data = db.query(
        func.extract('month', models.Payment.created_at).label('month'),
        func.sum(models.Payment.amount * models.Payment.exchange_rate).label('total')
    ).filter(
        models.Payment.status == models.PaymentStatus.SUCCESS,
        func.extract('year', models.Payment.created_at) == current_year
    ).group_by(func.extract('month', models.Payment.created_at)).all()

    # Calculate subscriber growth trend (new signups vs churned/cancelled per month for last 6 months)
    from datetime import timedelta
    current_month = datetime.utcnow().month
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    last_6_months = []
    months_list = []
    for i in range(5, -1, -1):
        m_idx = (current_month - i - 1) % 12 + 1
        last_6_months.append(m_idx)
        months_list.append(month_names[m_idx - 1])
        
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    
    signups_raw = db.query(
        func.extract('month', models.Customer.created_at).label('month'),
        func.count(models.Customer.id).label('count')
    ).filter(
        models.Customer.role == models.UserRole.CUSTOMER,
        models.Customer.created_at >= six_months_ago
    ).group_by(func.extract('month', models.Customer.created_at)).all()
    signups_map = {int(r[0]): int(r[1] or 0) for r in signups_raw}
    
    cancels_raw = db.query(
        func.extract('month', models.Subscription.cancelled_at).label('month'),
        func.count(models.Subscription.id).label('count')
    ).filter(
        models.Subscription.status == models.SubscriptionStatus.CANCELLED,
        models.Subscription.cancelled_at >= six_months_ago
    ).group_by(func.extract('month', models.Subscription.cancelled_at)).all()
    cancels_map = {int(r[0]): int(r[1] or 0) for r in cancels_raw}
    
    signups_list = [signups_map.get(m, 0) for m in last_6_months]
    cancels_list = [cancels_map.get(m, 0) for m in last_6_months]

    return {
        "total_cust": total_cust,
        "active_subs": active_subs,
        "trial_subs": trial_subs,
        "total_revenue": total_revenue,
        "plan_counts": plan_counts,
        "paid_count": paid_count,
        "failed_count": failed_count,
        "month_data": month_data,
        "signups_list": signups_list,
        "cancels_list": cancels_list,
        "months_list": months_list
    }

def get_revenue_summary_data(db: Session) -> dict:
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    data = get_dashboard_data(db, today_start)
    
    total_rev = db.query(
        func.sum(models.Payment.amount * models.Payment.exchange_rate)
    ).filter(
        models.Payment.status == models.PaymentStatus.SUCCESS
    ).scalar() or 0.0

    monthly_rev = data["monthly_revenue"]
    annual_rev = data["annual_revenue"]
    mrr = round(monthly_rev + (annual_rev / 12.0), 2)
    arr = round(mrr * 12.0, 2)

    return {
        "total_revenue": round(total_rev, 2),
        "monthly_recurring_revenue": mrr,
        "annual_recurring_revenue": arr,
        "today_revenue": round(data["today_revenue"], 2),
        "monthly_revenue": round(monthly_rev, 2),
        "annual_revenue": round(annual_rev, 2)
    }

def get_mrr_data(db: Session) -> dict:
    base_cur = ExchangeRateService.get_reporting_currency(db)
    
    active_subs_count = db.query(models.Subscription).filter(
        models.Subscription.status == models.SubscriptionStatus.ACTIVE
    ).count()

    plans = db.query(models.Plan).filter(models.Plan.is_archived == False).all()
    breakdown = []
    total_mrr = 0.0

    for plan in plans:
        sub_count = db.query(models.Subscription).filter(
            models.Subscription.plan_id == plan.id,
            models.Subscription.status == models.SubscriptionStatus.ACTIVE
        ).count()

        # Calculate actual contribution based on subscription billing contract values normalized via dynamic/latest exchange rates
        contributions = db.query(
            models.Subscription.billing_price * func.coalesce(ExchangeRate.rate, 1.0),
            models.Subscription.billing_interval
        ).outerjoin(
            ExchangeRate,
            (ExchangeRate.from_currency == models.Subscription.currency_code) & 
            (ExchangeRate.to_currency == base_cur)
        ).filter(
            models.Subscription.plan_id == plan.id,
            models.Subscription.status == models.SubscriptionStatus.ACTIVE
        ).all()
        
        contribution = 0.0
        for price, interval in contributions:
            if interval == models.BillingInterval.ANNUAL:
                contribution += price / 12.0
            else:
                contribution += price
        contribution = round(contribution, 2)

        total_mrr += contribution
        breakdown.append({
            "plan_id": plan.id,
            "plan_name": plan.name,
            "active_subscriptions": sub_count,
            "mrr_contribution": contribution
        })

    mrr = round(total_mrr, 2)
    arr = round(mrr * 12.0, 2)

    return {
        "mrr": mrr,
        "arr": arr,
        "active_subscriptions_count": active_subs_count,
        "breakdown_by_plan": breakdown
    }
