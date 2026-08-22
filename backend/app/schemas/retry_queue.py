from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.enums import RetryStatus


class RetryQueueBase(BaseModel):
    customer_id: int
    subscription_id: int
    invoice_id: int
    payment_id: int
    retry_attempt: int
    retry_status: RetryStatus
    scheduled_retry_date: datetime
    actual_retry_date: Optional[datetime] = None
    next_retry_date: Optional[datetime] = None
    failure_reason: Optional[str] = None


class RetryQueueCreate(BaseModel):
    customer_id: int
    subscription_id: int
    invoice_id: int
    payment_id: int
    retry_attempt: int = 0
    scheduled_retry_date: datetime
    failure_reason: Optional[str] = None


class RetryQueueResponse(RetryQueueBase):
    id: int
    created_at: datetime
    updated_at: datetime
    status: str
    error_message: Optional[str] = None
    max_attempts: int

    class Config:
        from_attributes = True

