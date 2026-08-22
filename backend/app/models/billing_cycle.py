from datetime import datetime

from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base


class BillingCycle(Base):
    __tablename__ = "billing_cycles"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False
    )

    subscription_id = Column(
        Integer,
        ForeignKey("subscriptions.id", ondelete="CASCADE"),
        nullable=False
    )

    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    renewal_date = Column(DateTime, nullable=False)
    next_billing_date = Column(DateTime, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    customer = relationship(
        "Customer",
        back_populates="billing_cycles"
    )

    subscription = relationship(
        "Subscription",
        back_populates="billing_cycles"
    )
