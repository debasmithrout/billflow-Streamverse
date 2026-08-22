from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class PaymentMethodCreate(BaseModel):
    method_type: str = Field(..., description="'card', 'upi', 'netbanking', or 'wallet'")
    provider: str = Field(..., description="e.g. VISA, Mastercard, SBI, Paytm")
    display_name: str
    last_four: Optional[str] = Field(None, pattern=r"^\d{4}$")
    upi_id: Optional[str] = Field(None, pattern=r"^[\w.-]+@[\w.-]+$")
    bank_name: Optional[str] = None
    wallet_name: Optional[str] = None
    expiry_month: Optional[int] = Field(None, ge=1, le=12)
    expiry_year: Optional[int] = Field(None, ge=2026)
    is_default: bool = False
    is_active: bool = True

class PaymentMethodUpdate(BaseModel):
    display_name: Optional[str] = None
    expiry_month: Optional[int] = Field(None, ge=1, le=12)
    expiry_year: Optional[int] = Field(None, ge=2026)
    is_default: Optional[bool] = None

class PaymentMethodResponse(BaseModel):
    id: int
    customer_id: int
    method_type: str
    provider: str
    display_name: str
    last_four: Optional[str] = None
    upi_id: Optional[str] = None
    bank_name: Optional[str] = None
    wallet_name: Optional[str] = None
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None
    expiry_date: Optional[str] = None
    is_default: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CategoryBreakdown(BaseModel):
    card: float
    upi: float
    netbanking: float
    wallet: float

class PaymentSummaryResponse(BaseModel):
    total_spent: float
    total_payments_count: int
    attributed_amount: float
    unattributed_amount: float
    category_breakdown: CategoryBreakdown
