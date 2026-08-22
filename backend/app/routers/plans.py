from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app import models, schemas
from app.auth import admin_required, get_current_user_optional
from app.services import plan_service

router = APIRouter(
    prefix="/plans",
    tags=["Plans"]
)


@router.post(
    "/",
    response_model=schemas.PlanResponse
)
def create_plan(
    plan: schemas.PlanCreate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return plan_service.create_plan(db, plan)


@router.get(
    "/",
    response_model=List[schemas.PlanResponse]
)
def view_plans(
    db: Session = Depends(get_db),
    current_user: Optional[models.Customer] = Depends(get_current_user_optional)
):
    return plan_service.get_plans(db, current_user)


@router.get(
    "/{plan_id}",
    response_model=schemas.PlanResponse
)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
    return plan_service.get_plan_by_id(db, plan_id)


@router.put(
    "/{plan_id}",
    response_model=schemas.PlanResponse
)
def update_plan(
    plan_id: int,
    plan_data: schemas.PlanUpdate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return plan_service.update_plan(db, plan_id, plan_data)


@router.patch(
    "/{plan_id}/archive",
    response_model=schemas.PlanResponse
)
def archive_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return plan_service.archive_plan(db, plan_id)


@router.post(
    "/{plan_id}/prices",
    response_model=schemas.PlanPriceResponse
)
def add_plan_price(
    plan_id: int,
    price_data: schemas.PlanPriceCreate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return plan_service.add_plan_price(db, plan_id, price_data)


@router.put(
    "/prices/{price_id}",
    response_model=schemas.PlanPriceResponse
)
def update_plan_price(
    price_id: int,
    price_data: schemas.PlanPriceUpdate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return plan_service.update_plan_price(db, price_id, price_data)


@router.delete(
    "/prices/{price_id}",
    response_model=schemas.PlanPriceResponse
)
def soft_delete_plan_price(
    price_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return plan_service.soft_delete_plan_price(db, price_id)
