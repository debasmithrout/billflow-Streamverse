from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Enum, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import BillingInterval

class PlanPrice(Base):
    __tablename__ = "plan_prices"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(
        Integer,
        ForeignKey("plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    currency_code = Column(String(3), nullable=False, index=True)
    price = Column(Float, nullable=False)
    billing_interval = Column(
        Enum(BillingInterval),
        default=BillingInterval.MONTHLY,
        nullable=False,
        index=True
    )
    is_default = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    plan = relationship("Plan", back_populates="prices")

    __table_args__ = (
        UniqueConstraint("plan_id", "currency_code", "billing_interval", name="unique_plan_currency_interval"),
    )
