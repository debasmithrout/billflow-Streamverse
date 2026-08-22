from pydantic import BaseModel
from datetime import datetime


class BillingCycleResponse(BaseModel):
    id: int
    customer_id: int
    subscription_id: int

    start_date: datetime
    end_date: datetime
    renewal_date: datetime
    next_billing_date: datetime

    created_at: datetime

    class Config:
        from_attributes = True
