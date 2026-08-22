from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditLogResponse(BaseModel):
    id: int
    event_name: str
    customer_id: Optional[int]
    description: str
    created_at: datetime

    class Config:
        from_attributes = True
