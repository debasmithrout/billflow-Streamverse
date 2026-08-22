from pydantic import BaseModel
from datetime import datetime


class RetryConfigurationBase(BaseModel):
    retry_attempt: int
    retry_after_days: int
    is_active: bool = True


class RetryConfigurationCreate(RetryConfigurationBase):
    pass


class RetryConfigurationResponse(RetryConfigurationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
