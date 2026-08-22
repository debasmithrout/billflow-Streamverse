from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SystemSettingResponse(BaseModel):
    key: str
    value: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ExchangeRateResponse(BaseModel):
    id: int
    from_currency: str
    to_currency: str
    rate: float
    provider: str
    fetched_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class ExchangeRateOverrideRequest(BaseModel):
    from_currency: str = Field(..., min_length=3, max_length=3, description="ISO-4217 currency code")
    to_currency: str = Field(..., min_length=3, max_length=3, description="ISO-4217 currency code")
    rate: float = Field(..., gt=0.0, description="Manual override exchange rate")

class ReportingCurrencyUpdateRequest(BaseModel):
    currency_code: str = Field(..., min_length=3, max_length=3, description="ISO-4217 currency code")
