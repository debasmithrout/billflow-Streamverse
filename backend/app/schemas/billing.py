from pydantic import BaseModel, Field
from typing import List


class RevenueSummaryResponse(BaseModel):
    total_revenue: float = Field(..., example=15450.0, description="Total historical revenue from all successful payments")
    monthly_recurring_revenue: float = Field(..., example=2495.0, description="Current Monthly Recurring Revenue (MRR)")
    annual_recurring_revenue: float = Field(..., example=29940.0, description="Current Annual Recurring Revenue (ARR)")
    today_revenue: float = Field(..., example=599.0, description="Revenue collected today")
    monthly_revenue: float = Field(..., example=1990.0, description="Sum of active monthly plan subscriptions")
    annual_revenue: float = Field(..., example=6060.0, description="Sum of active annual plan subscriptions")


class MRRPlanBreakdown(BaseModel):
    plan_id: int = Field(..., example=1)
    plan_name: str = Field(..., example="Standard")
    active_subscriptions: int = Field(..., example=5)
    mrr_contribution: float = Field(..., example=1495.0)


class MRRResponse(BaseModel):
    mrr: float = Field(..., example=2495.0, description="Current Monthly Recurring Revenue")
    arr: float = Field(..., example=29940.0, description="Current Annual Recurring Revenue")
    active_subscriptions_count: int = Field(..., example=12, description="Total active subscriptions")
    breakdown_by_plan: List[MRRPlanBreakdown] = Field(..., description="MRR contribution broken down by plan")
