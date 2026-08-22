from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.services.audit_service import log_audit_event
from app.repositories import plan_repository
from app.database.unit_of_work import UnitOfWork
from app.core import exceptions

def create_plan(db: Session, plan: schemas.PlanCreate) -> models.Plan:
    uow = UnitOfWork(db)
    if plan_repository.get_plan_by_name(uow.session, plan.name):
        raise exceptions.DuplicateResource("Plan name already exists")

    new_plan = plan_repository.create_plan_record(uow.session, plan.model_dump())

    # Create default plan price record
    default_price = models.PlanPrice(
        plan_id=new_plan.id,
        currency_code="INR",
        price=new_plan.price,
        billing_interval=new_plan.billing_interval,
        is_default=True,
        is_active=True
    )
    uow.session.add(default_price)

    # Audit Log
    log_audit_event(
         uow.session,
         "Plan Created",
         f"Plan '{new_plan.name}' created"
    )
    uow.commit()

    return new_plan

def can_show_trial(customer: models.Customer, db: Session) -> bool:
    if not customer:
        return True
    if customer.has_used_trial:
        return False
        
    # Check if they have ever had a subscription for a paid plan (price > 0 and trial_period_days == 0)
    paid_subs = (
        db.query(models.Subscription)
        .join(models.Plan)
        .filter(
            models.Subscription.customer_id == customer.id,
            models.Plan.price > 0,
            models.Plan.trial_period_days == 0
        )
        .first()
    )
    if paid_subs:
        return False
        
    return True


def get_plans(db: Session, current_user: models.Customer = None) -> List[models.Plan]:
    uow = UnitOfWork(db)
    plans = plan_repository.get_active_plans(uow.session)
    
    show_trial = True
    if current_user:
        show_trial = can_show_trial(current_user, uow.session)
        
    filtered_plans = []
    for plan in plans:
        is_trial = plan.trial_period_days > 0 or "trial" in plan.name.lower()
        if is_trial:
            if show_trial:
                plan.show_trial = True
                filtered_plans.append(plan)
        else:
            plan.show_trial = True
            filtered_plans.append(plan)
            
    return filtered_plans

def get_plan_by_id(db: Session, plan_id: int) -> models.Plan:
    uow = UnitOfWork(db)
    plan = plan_repository.get_plan_by_id(uow.session, plan_id)

    if not plan:
        raise exceptions.ResourceNotFound("Plan not found")

    return plan

def update_plan(db: Session, plan_id: int, plan_data: schemas.PlanUpdate) -> models.Plan:
    uow = UnitOfWork(db)
    plan = plan_repository.get_plan_by_id(uow.session, plan_id)
    if not plan:
        raise exceptions.ResourceNotFound("Plan not found")

    existing_plan = plan_repository.get_plan_by_name_excluding_id(uow.session, plan_data.name, plan_id)

    if existing_plan:
        raise exceptions.DuplicateResource("Plan name already exists")

    plan.name = plan_data.name
    plan.description = plan_data.description
    plan.features = plan_data.features
    plan.price = plan_data.price
    plan.billing_interval = plan_data.billing_interval
    plan.trial_period_days = plan_data.trial_period_days

    # Sync default plan price record
    default_price = (
        uow.session.query(models.PlanPrice)
        .filter(
            models.PlanPrice.plan_id == plan.id,
            models.PlanPrice.currency_code == "INR",
            models.PlanPrice.billing_interval == plan.billing_interval
        )
        .first()
    )
    if default_price:
        default_price.price = plan_data.price
    else:
        # Create default price if it does not exist
        default_price = models.PlanPrice(
            plan_id=plan.id,
            currency_code="INR",
            price=plan_data.price,
            billing_interval=plan_data.billing_interval,
            is_default=True,
            is_active=True
        )
        uow.session.add(default_price)

    # Audit Log
    log_audit_event(
         uow.session,
         "Plan Updated",
         f"Plan '{plan.name}' updated"
    )

    uow.commit()

    return plan

def archive_plan(db: Session, plan_id: int) -> models.Plan:
    uow = UnitOfWork(db)
    plan = plan_repository.get_plan_by_id(uow.session, plan_id)
    if not plan:
        raise exceptions.ResourceNotFound("Plan not found")

    if plan.is_archived:
        raise exceptions.BusinessRuleViolation("Plan already archived")

    plan.is_archived = True
    
    # Audit Log
    log_audit_event(
        uow.session,
        "Plan Archived",
        f"Plan '{plan.name}' archived"
    )

    uow.commit()

    return plan


def add_plan_price(db: Session, plan_id: int, price_data: schemas.PlanPriceCreate) -> models.PlanPrice:
    uow = UnitOfWork(db)
    # Check if plan exists
    plan = uow.session.query(models.Plan).filter(models.Plan.id == plan_id).first()
    if not plan:
        raise exceptions.ResourceNotFound("Plan not found")

    # Check for duplicate
    existing = (
        uow.session.query(models.PlanPrice)
        .filter(
            models.PlanPrice.plan_id == plan_id,
            models.PlanPrice.currency_code == price_data.currency_code,
            models.PlanPrice.billing_interval == price_data.billing_interval
        )
        .first()
    )
    if existing:
        if not existing.is_active:
            # Reactivate and update price
            existing.is_active = True
            existing.price = price_data.price
            if price_data.is_default:
                # Disable other defaults
                uow.session.query(models.PlanPrice).filter(
                    models.PlanPrice.plan_id == plan_id,
                    models.PlanPrice.billing_interval == price_data.billing_interval,
                    models.PlanPrice.id != existing.id
                ).update({"is_default": False})
                existing.is_default = True
            uow.commit()
            return existing
        else:
            raise exceptions.DuplicateResource("Pricing entry already exists for this currency and interval")

    # If is_default is true, deactivate all other default price configurations for this plan and interval
    if price_data.is_default:
        uow.session.query(models.PlanPrice).filter(
            models.PlanPrice.plan_id == plan_id,
            models.PlanPrice.billing_interval == price_data.billing_interval
        ).update({"is_default": False})

    new_price = models.PlanPrice(
        plan_id=plan_id,
        currency_code=price_data.currency_code,
        price=price_data.price,
        billing_interval=price_data.billing_interval,
        is_default=price_data.is_default,
        is_active=price_data.is_active
    )
    uow.session.add(new_price)
    
    # Audit Log
    log_audit_event(
        uow.session,
        "Plan Price Added",
        f"Price of {price_data.currency_code} {price_data.price} added to Plan {plan.name}."
    )
    uow.commit()
    uow.session.refresh(new_price)
    return new_price


def update_plan_price(db: Session, price_id: int, price_data: schemas.PlanPriceUpdate) -> models.PlanPrice:
    uow = UnitOfWork(db)
    price_entry = uow.session.query(models.PlanPrice).filter(models.PlanPrice.id == price_id).first()
    if not price_entry:
        raise exceptions.ResourceNotFound("Plan price entry not found")

    if price_data.price is not None:
        price_entry.price = price_data.price

    if price_data.is_active is not None:
        if not price_data.is_active and price_entry.is_default:
            raise exceptions.BusinessRuleViolation("Cannot deactivate the default price. Set another price as default first.")
        price_entry.is_active = price_data.is_active

    if price_data.is_default is not None:
        if price_data.is_default:
            # Mark all other prices for this plan/interval as not default
            uow.session.query(models.PlanPrice).filter(
                models.PlanPrice.plan_id == price_entry.plan_id,
                models.PlanPrice.billing_interval == price_entry.billing_interval,
                models.PlanPrice.id != price_id
            ).update({"is_default": False})
            price_entry.is_default = True
        else:
            # If turning off default, make sure there's another default active price, or prevent it
            price_entry.is_default = False
            # Check if there is another default
            other_default = (
                uow.session.query(models.PlanPrice)
                .filter(
                    models.PlanPrice.plan_id == price_entry.plan_id,
                    models.PlanPrice.billing_interval == price_entry.billing_interval,
                    models.PlanPrice.is_default == True,
                    models.PlanPrice.is_active == True,
                    models.PlanPrice.id != price_id
                )
                .first()
            )
            if not other_default:
                raise exceptions.BusinessRuleViolation("At least one active price must be marked as default.")

    log_audit_event(
        uow.session,
        "Plan Price Updated",
        f"Plan price {price_entry.id} updated."
    )
    uow.commit()
    uow.session.refresh(price_entry)
    return price_entry


def soft_delete_plan_price(db: Session, price_id: int) -> models.PlanPrice:
    uow = UnitOfWork(db)
    price_entry = uow.session.query(models.PlanPrice).filter(models.PlanPrice.id == price_id).first()
    if not price_entry:
        raise exceptions.ResourceNotFound("Plan price entry not found")

    if price_entry.is_default:
        raise exceptions.BusinessRuleViolation("Cannot delete the default price. Set another price as default first.")

    price_entry.is_active = False

    log_audit_event(
        uow.session,
        "Plan Price Deactivated",
        f"Plan price {price_entry.id} deactivated (soft-deleted)."
    )
    uow.commit()
    return price_entry
