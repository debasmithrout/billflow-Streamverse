from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app import models, schemas
from app.auth import get_current_user, admin_required, customer_required
from app.services import auth_service
from app.core.rate_limiter import limiter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=schemas.CustomerResponse
)
@limiter.limit("3/minute")
def register(
    request: Request,
    response: Response,
    customer: schemas.CustomerCreate,
    db: Session = Depends(get_db)
):
    return auth_service.register_customer(db, customer)


@router.post(
    "/login",
    response_model=schemas.Token
)
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    login_data: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    return auth_service.authenticate_customer(db, login_data)


@router.get(
    "/me",
    response_model=schemas.CustomerResponse
)
def get_me(
    current_user: models.Customer = Depends(get_current_user)
):
    return current_user


@router.get("/admin-test")
def admin_test(
    admin: models.Customer = Depends(admin_required)
):
    return {
        "message": "Welcome Admin!"
    }


@router.get("/customer-test")
def customer_test(
    customer: models.Customer = Depends(customer_required)
):
    return {
        "message": "Welcome Customer!"
    }
