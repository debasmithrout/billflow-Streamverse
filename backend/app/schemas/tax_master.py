from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TaxMasterBase(BaseModel):
    tax_name: str
    tax_code: str
    country: str
    state: Optional[str] = None
    tax_type: str
    tax_percentage: float
    is_active: bool = True
    effective_from: datetime
    effective_to: Optional[datetime] = None
    reverse_charge: bool = False


class TaxMasterCreate(TaxMasterBase):
    pass


class TaxMasterUpdate(BaseModel):
    tax_name: Optional[str] = None
    tax_code: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    tax_type: Optional[str] = None
    tax_percentage: Optional[float] = None
    is_active: Optional[bool] = None
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    reverse_charge: Optional[bool] = None


class TaxMasterResponse(TaxMasterBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
