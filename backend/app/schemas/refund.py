from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.enums import RefundStatus

class RefundBase(BaseModel):
    payment_id: int
    amount: float = Field(..., gt=0)
    reason: str

class RefundCreate(RefundBase):
    pass

class RefundAdminAction(BaseModel):
    admin_notes: Optional[str] = None

class RefundResponse(RefundBase):
    id: int
    customer_id: int
    invoice_id: int
    status: RefundStatus
    admin_notes: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        orm_mode = True
