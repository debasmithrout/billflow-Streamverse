from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import PaymentStatus


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

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
    currency_code = Column(String(3), nullable=False, default="INR")
    exchange_rate = Column(Float, nullable=False, default=1.0)
    base_currency = Column(String(3), nullable=False, default="INR")

    status = Column(
        Enum(PaymentStatus),
        nullable=False
    )

    transaction_id = Column(
        String,
        unique=True,
        nullable=False
    )

    payment_method_id = Column(
        Integer,
        ForeignKey("payment_methods.id", ondelete="SET NULL"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    customer = relationship(
        "Customer",
        back_populates="payments"
    )

    invoice = relationship(
        "Invoice",
        back_populates="payments"
    )

    payment_method = relationship(
        "PaymentMethod"
    )
