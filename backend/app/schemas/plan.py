from pydantic import BaseModel
from typing import Optional, List

from app.models.enums import BillingInterval


class PlanPriceBase(BaseModel):
    currency_code: str
    price: float
    billing_interval: BillingInterval = BillingInterval.MONTHLY
    is_default: bool = False
    is_active: bool = True


class PlanPriceCreate(PlanPriceBase):
    pass


class PlanPriceUpdate(BaseModel):
    price: Optional[float] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None


class PlanPriceResponse(PlanPriceBase):
    id: int
    plan_id: int

    class Config:
        from_attributes = True


class PlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    features: Optional[str] = None
    price: float
    billing_interval: BillingInterval = BillingInterval.MONTHLY
    trial_period_days: int = 0


class PlanCreate(PlanBase):
    pass


class PlanUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    features: Optional[str] = None
    price: float
    billing_interval: BillingInterval
    trial_period_days: int


class PlanResponse(PlanBase):
    id: int
    is_archived: bool
    show_trial: bool = True
    prices: List[PlanPriceResponse] = []

    class Config:
        from_attributes = True
