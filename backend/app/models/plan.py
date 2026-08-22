from sqlalchemy import Column, Integer, String, Float, Boolean, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import BillingInterval


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    features = Column(String, nullable=True)

    price = Column(Float, nullable=False)

    billing_interval = Column(
        Enum(BillingInterval),
        default=BillingInterval.MONTHLY,
        nullable=False
    )

    trial_period_days = Column(
        Integer,
        default=0,
        nullable=False
    )

    is_archived = Column(
        Boolean,
        default=False,
        nullable=False
    )

    subscriptions = relationship(
        "Subscription",
        back_populates="plan"
    )

    prices = relationship(
        "PlanPrice",
        back_populates="plan",
        cascade="all, delete-orphan"
    )
