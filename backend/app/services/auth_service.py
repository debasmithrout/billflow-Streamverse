from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app import models, schemas
from app.core.security import hash_password, verify_password
from app.services.audit_service import log_audit_event
from app.repositories import auth_repository
from app.database.unit_of_work import UnitOfWork
from app.core import exceptions

def register_customer(db: Session, customer: schemas.CustomerCreate) -> models.Customer:
    uow = UnitOfWork(db)
    existing = auth_repository.get_customer_by_email(uow.session, customer.email)

    if existing:
        raise exceptions.DuplicateResource("Email already registered")

    from app.services.region_service import RegionService
    region_defaults = RegionService.get_defaults(customer.country)

    customer_dict = {
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
    new_customer = auth_repository.create_customer(uow.session, customer_dict)

    # Get Trial Plan automatically
    trial_plan = auth_repository.get_first_active_trial_plan(uow.session)
    if not trial_plan:
        trial_plan = auth_repository.get_first_plan(uow.session)

    now = datetime.utcnow()
    renewal_date = now + timedelta(days=trial_plan.trial_period_days if trial_plan else 7)
    
    sub_dict = {
        "customer_id": new_customer.id,
        "plan_id": trial_plan.id if trial_plan else 1,
        "status": models.SubscriptionStatus.TRIAL,
        "created_at": now,
        "trial_started_at": now
    }
    new_sub = auth_repository.create_subscription(uow.session, sub_dict)

    # Create Billing Cycle
    cycle_dict = {
        "customer_id": new_customer.id,
        "subscription_id": new_sub.id,
        "start_date": now,
        "end_date": renewal_date + timedelta(days=30),
        "renewal_date": renewal_date,
        "next_billing_date": renewal_date
    }
    auth_repository.create_billing_cycle(uow.session, cycle_dict)

    # Save events in Audit Logs
    log_audit_event(
        uow.session,
        "Customer Created",
        f"Customer '{new_customer.name}' registered successfully.",
        customer_id=new_customer.id
    )

    log_audit_event(
        uow.session,
        "Subscription Created",
        f"Trial Subscription {new_sub.id} automatically initialized on registration.",
        customer_id=new_customer.id
    )

    uow.commit()

    # Trigger customer lifecycle email tasks
    from app.celery_worker import safe_task_delay
    from app.email_tasks import send_welcome_email_task, send_trial_started_email_task
    
    safe_task_delay(send_welcome_email_task, new_customer.name, new_customer.email)
    safe_task_delay(
        send_trial_started_email_task,
        new_customer.name,
        new_customer.email,
        now.strftime("%Y-%m-%d"),
        renewal_date.strftime("%Y-%m-%d")
    )

    return new_customer

def authenticate_customer(db: Session, login_data: schemas.LoginRequest) -> dict:
    uow = UnitOfWork(db)
    customer = auth_repository.get_customer_by_email(uow.session, login_data.email)

    if not customer:
        raise exceptions.AuthenticationFailed("Invalid email or password")

    if not verify_password(
        login_data.password,
        customer.password
    ):
        raise exceptions.AuthenticationFailed("Invalid email or password")

    from app.core.security import create_access_token
    token = create_access_token(
        {
            "sub": customer.email,
            "role": customer.role.value
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }
