from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import RefundStatus


class Refund(Base):
    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True, index=True)

    payment_id = Column(
        Integer,
        ForeignKey("payments.id", ondelete="CASCADE"),
        nullable=False
    )
    
    customer_id = Column(
        Integer,
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False
    )
    
    invoice_id = Column(
        Integer,
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False
    )

    amount = Column(Float, nullable=False)
    
    reason = Column(String, nullable=False)

    status = Column(
        Enum(RefundStatus),
        default=RefundStatus.PENDING,
        nullable=False
    )

    admin_notes = Column(String, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    processed_at = Column(DateTime, nullable=True)

    gateway_refund_id = Column(String(128), nullable=True)
    gateway_response = Column(JSON, nullable=True)

    payment = relationship(
        "Payment",
        backref="refunds"
    )
    
    customer = relationship(
        "Customer",
        backref="refunds"
    )

    invoice = relationship(
        "Invoice",
        backref="refunds"
    )
