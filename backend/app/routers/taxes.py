from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app import models, schemas
from app.auth import admin_required
from app.services.tax_service import TaxService
from app.repositories import tax_repository
from app.core.rate_limiter import limiter

router = APIRouter(
    prefix="/admin/taxes",
    tags=["Taxes"]
)


@router.get("/", response_model=List[schemas.TaxMasterResponse])
@limiter.limit("30/minute")
def list_taxes(
    request: Request,
    response: Response,
    active_only: bool = False,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    if active_only:
        return TaxService.fetch_active_taxes(db)
    return tax_repository.list_taxes(db)


@router.get("/{id}", response_model=schemas.TaxMasterResponse)
@limiter.limit("30/minute")
def get_tax_by_id(
    id: int,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    tax = tax_repository.get_tax_by_id(db, id)
    if not tax:
        raise HTTPException(status_code=404, detail="Tax rule not found")
    return tax


@router.post("/", response_model=schemas.TaxMasterResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_tax(
    tax_in: schemas.TaxMasterCreate,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return TaxService.create_tax(db, tax_in)


@router.put("/{id}", response_model=schemas.TaxMasterResponse)
@limiter.limit("30/minute")
def update_tax(
    id: int,
    tax_update: schemas.TaxMasterUpdate,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    try:
        return TaxService.update_tax(db, id, tax_update)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}")
@limiter.limit("30/minute")
def delete_tax(
    id: int,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    success = TaxService.delete_tax(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Tax rule not found or could not be deleted")
    return {"message": "Tax rule deleted successfully"}
