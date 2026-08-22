from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import RetryStatus


class RetryQueue(Base):
    __tablename__ = "retry_queues"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    subscription_id = Column(
        Integer,
        ForeignKey("subscriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    invoice_id = Column(
        Integer,
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    payment_id = Column(
        Integer,
        ForeignKey("payments.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    retry_attempt = Column(Integer, default=0, nullable=False)
    retry_status = Column(Enum(RetryStatus), default=RetryStatus.PENDING, nullable=False, index=True)

    scheduled_retry_date = Column(DateTime, nullable=False, index=True)
    actual_retry_date = Column(DateTime, nullable=True)
    next_retry_date = Column(DateTime, nullable=True)
    failure_reason = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    customer = relationship("Customer", backref="retry_entries")
    subscription = relationship("Subscription", backref="retry_entries")
    invoice = relationship("Invoice", backref="retry_entries")
    payment = relationship("Payment", backref="retry_entries")
