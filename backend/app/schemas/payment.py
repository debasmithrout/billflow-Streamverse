from pydantic import BaseModel, Field
from datetime import datetime


class PaymentResponse(BaseModel):
    id: int
    customer_id: int
    invoice_id: int

    amount: float
    currency_code: str
    exchange_rate: float
    base_currency: str
    status: str
    transaction_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class TaxEstimateRequest(BaseModel):
    base_amount: float = Field(..., gt=0, description="Base amount before tax", example=600.0)
    gst_rate: float = Field(default=18.0, ge=0, description="GST rate percentage", example=18.0)


class TaxEstimateResponse(BaseModel):
    base_amount: float = Field(..., example=600.0, description="Base amount before tax")
    gst_rate: float = Field(..., example=18.0, description="GST rate percentage applied")
    gst_amount: float = Field(..., example=108.0, description="Calculated GST tax amount")
    total_amount: float = Field(..., example=708.0, description="Total amount including GST")

