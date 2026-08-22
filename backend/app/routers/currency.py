from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app import models
from app.auth import admin_required
from app.services.exchange_rate_service import ExchangeRateService, SUPPORTED_CURRENCIES
from app.models.exchange_rate import ExchangeRate
from app.core.rate_limiter import limiter
from app.schemas.exchange_rate import (
    ExchangeRateResponse, 
    ExchangeRateOverrideRequest, 
    ReportingCurrencyUpdateRequest
)

router = APIRouter(
    prefix="/admin/currency",
    tags=["Currency & Exchange Rates"]
)

@router.get("/rates", response_model=List[ExchangeRateResponse])
def get_exchange_rates(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    """
    List all current exchange rates stored in the database.
    """
    rates = db.query(ExchangeRate).order_by(ExchangeRate.from_currency, ExchangeRate.to_currency).all()
    return rates

@router.post("/sync")
@limiter.limit("2/hour")
def sync_exchange_rates(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    """
    Manually trigger latest exchange rates sync from Frankfurter provider.
    """
    try:
        ExchangeRateService.sync_latest_rates(db)
        return {"message": "Exchange rates synchronized successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to synchronize exchange rates: {str(e)}")

@router.post("/override", response_model=ExchangeRateResponse)
@limiter.limit("10/hour")
def override_exchange_rate(
    request: Request,
    response: Response,
    body: ExchangeRateOverrideRequest,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    """
    Manually override the rate of a currency pair.
    """
    from_cur = body.from_currency.strip().upper()
    to_cur = body.to_currency.strip().upper()

    if from_cur not in SUPPORTED_CURRENCIES or to_cur not in SUPPORTED_CURRENCIES:
        raise HTTPException(status_code=400, detail="One or both currency codes are not supported.")

    if from_cur == to_cur:
        raise HTTPException(status_code=400, detail="Cannot override rate for identical currency pairs.")

    rate_record = (
        db.query(ExchangeRate)
        .filter(ExchangeRate.from_currency == from_cur, ExchangeRate.to_currency == to_cur)
        .first()
    )
    
    sync_time = datetime.utcnow()
    if rate_record:
        rate_record.rate = body.rate
        rate_record.provider = "Manual Override"
        rate_record.fetched_at = sync_time
    else:
        rate_record = ExchangeRate(
            from_currency=from_cur,
            to_currency=to_cur,
            rate=body.rate,
            provider="Manual Override",
            fetched_at=sync_time
        )
        db.add(rate_record)

    db.commit()
    db.refresh(rate_record)
    
    # Clear cache to apply override instantly
    ExchangeRateService.clear_cache()
    
    return rate_record

@router.get("/settings")
def get_currency_settings(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    """
    View base reporting currency and last synced date.
    """
    base_currency = ExchangeRateService.get_reporting_currency(db)
    
    # Get last synced timestamp
    last_sync_record = db.query(ExchangeRate).order_by(ExchangeRate.fetched_at.desc()).first()
    last_synced_at = last_sync_record.fetched_at if last_sync_record else None
    
    return {
        "reporting_base_currency": base_currency,
        "last_synced_at": last_synced_at,
        "supported_currencies": SUPPORTED_CURRENCIES
    }

@router.post("/settings")
def update_currency_settings(
    body: ReportingCurrencyUpdateRequest,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    """
    Update reporting base currency setting.
    """
    currency_code = body.currency_code.strip().upper()
    try:
        updated = ExchangeRateService.update_reporting_currency(db, currency_code)
        return {"reporting_base_currency": updated, "message": "Reporting base currency updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
