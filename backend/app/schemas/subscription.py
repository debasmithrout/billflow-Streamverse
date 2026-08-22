from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.models.enums import SubscriptionStatus


class SubscriptionCreate(BaseModel):
    customer_id: int
    plan_id: int


class SubscriptionResponse(BaseModel):
    id: int
    customer_id: int
    plan_id: int

    status: SubscriptionStatus

    created_at: Optional[datetime]
    trial_started_at: Optional[datetime]
    activated_at: Optional[datetime]
    past_due_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    paused_at: Optional[datetime]
    
    pending_payment_id: Optional[int] = None
    pending_invoice_id: Optional[int] = None

    class Config:
        from_attributes = True


class StatusTransitionUpdate(BaseModel):
    new_status: SubscriptionStatus


class ChangePlanRequest(BaseModel):
    new_plan_id: int


class CancelSubscriptionRequest(BaseModel):
    immediate: bool = True


class PlanBriefSchema(BaseModel):
    id: int = Field(..., example=1)
    name: str = Field(..., example="Standard")
    price: float = Field(..., example=299.0)


class ProrationCalculateRequest(BaseModel):
    customer_id: int = Field(..., description="ID of the customer whose subscription is evaluated", example=1)
    target_plan_id: int = Field(..., description="ID of the target plan to upgrade/downgrade to", example=3)


class ProrationCalculateResponse(BaseModel):
    current_plan: PlanBriefSchema
    target_plan: PlanBriefSchema
    remaining_days: int = Field(..., example=18, description="Remaining days in current billing cycle")
    remaining_ratio: float = Field(..., example=0.60, description="Ratio of billing cycle remaining (0.00 to 1.00)")
    proration_credit: float = Field(..., example=179.40, description="Unused credit from current plan")
    proration_debit: float = Field(..., example=359.40, description="Prorated cost of target plan")
    net_proration: float = Field(..., example=180.00, description="Net proration difference (debit - credit)")
    gst: float = Field(..., example=32.40, description="GST tax amount (18%) applicable on net proration")
    total_payable: float = Field(..., example=212.40, description="Total payable amount including GST")

    currency_code: Optional[str] = None
    currency_symbol: Optional[str] = None
    base_currency: Optional[str] = None
    exchange_rate: Optional[float] = None
    tax_name: Optional[str] = None
    tax_code: Optional[str] = None
    tax_percentage: Optional[float] = None
    tax_amount: Optional[float] = None
    subtotal: Optional[float] = None
    proration_charge: Optional[float] = None
    final_total: Optional[float] = None
    billing_interval: Optional[str] = None
    plan_name: Optional[str] = None
    price_breakdown: Optional[dict] = None
    invoice_preview_items: Optional[list] = None


