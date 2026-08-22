from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

from app.core.database import get_db
from app import models
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)

oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False
)


def get_current_user_optional(
    token: str = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db)
):
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if payload is None:
            return None
        email = payload.get("sub")
        customer = (
            db.query(models.Customer)
            .filter(models.Customer.email == email)
            .first()
        )
        return customer
    except Exception:
        return None


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    email = payload.get("sub")

    customer = (
        db.query(models.Customer)
        .filter(models.Customer.email == email)
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return customer


def admin_required(
    current_user: models.Customer = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


def customer_required(
    current_user: models.Customer = Depends(get_current_user)
):
    if current_user.role != models.UserRole.CUSTOMER:
        raise HTTPException(
            status_code=403,
            detail="Customer access required"
        )

    return current_user