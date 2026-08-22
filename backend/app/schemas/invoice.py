from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class InvoiceResponse(BaseModel):
    id: int
    customer_id: int
    subscription_id: int

    invoice_number: str
    amount: float
    status: str

    generated_at: datetime
    due_date: datetime

    pricing_model: str
    invoice_type: str
    plan_name: str
    base_amount: float
    gst_percentage: int
    gst_amount: float
    total_amount: float
    
    tax_name: str
    tax_code: str
    tax_percentage: float
    tax_amount: float
    currency_code: str
    exchange_rate: float
    base_currency: str

    previous_plan_name: Optional[str] = None
    previous_plan_price: Optional[float] = None
    new_plan_name: Optional[str] = None
    new_plan_price: Optional[float] = None
    upgrade_difference: Optional[float] = None
    proration_credit: Optional[float] = 0.0
    proration_debit: Optional[float] = 0.0

    # Refund fields (for future readiness)
    refund_amount: Optional[float] = None
    gst_reversal: Optional[float] = None
    refund_date: Optional[datetime] = None
    refund_status: Optional[str] = None
    original_invoice_reference: Optional[str] = None

    payment_id: Optional[int] = None
    payment_method_name: Optional[str] = None
    is_refundable: bool = False
    refund_eligible_until: Optional[datetime] = None
    
    retry_status: Optional[str] = None
    retry_attempt: Optional[int] = None
    max_attempts: Optional[int] = None
    next_retry_date: Optional[datetime] = None
    last_retry_date: Optional[datetime] = None
    failure_reason: Optional[str] = None

    class Config:
        from_attributes = True
