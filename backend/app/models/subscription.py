from datetime import datetime

from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime, String, Float
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import SubscriptionStatus, BillingInterval


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False
    )

    plan_id = Column(
        Integer,
        ForeignKey("plans.id"),
        nullable=False
    )

    status = Column(
        Enum(SubscriptionStatus),
        default=SubscriptionStatus.TRIAL,
        nullable=False
    )

    # Status timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    trial_started_at = Column(DateTime, nullable=True)
    activated_at = Column(DateTime, nullable=True)
    past_due_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    trial_status = Column(String, nullable=True)

    # Future use (Pause/Resume APIs)
    paused_at = Column(DateTime, nullable=True)

    # Billing contract fields
    currency_code = Column(String(3), nullable=False, default="INR")
    billing_price = Column(Float, nullable=False, default=0.0)
    billing_interval = Column(Enum(BillingInterval), nullable=False, default=BillingInterval.MONTHLY)
    plan_price_id = Column(Integer, ForeignKey("plan_prices.id", ondelete="RESTRICT"), nullable=True)

    customer = relationship(
        "Customer",
        back_populates="subscriptions"
    )

    plan = relationship(
        "Plan",
        back_populates="subscriptions"
    )

    plan_price = relationship(
        "PlanPrice"
    )

    billing_cycles = relationship(
        "BillingCycle",
        back_populates="subscription",
        cascade="all, delete-orphan"
    )

    invoices = relationship(
        "Invoice",
        back_populates="subscription",
        cascade="all, delete-orphan"
    )
