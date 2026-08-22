from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import InvoiceStatus


class Invoice(Base):
    __tablename__ = "invoices"

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

    invoice_number = Column(
        String,
        unique=True,
        nullable=False
    )

    amount = Column(Float, nullable=False)
    currency_code = Column(String(3), nullable=False, default="INR")
    exchange_rate = Column(Float, nullable=False, default=1.0)
    base_currency = Column(String(3), nullable=False, default="INR")

    pricing_model = Column(
        String,
        nullable=False
    )

    invoice_type = Column(
        String,
        nullable=False
    )

    previous_plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    previous_plan_name = Column(String, nullable=True)
    previous_plan_price = Column(Float, nullable=True)

    new_plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    new_plan_name = Column(String, nullable=True)
    new_plan_price = Column(Float, nullable=True)

    upgrade_difference = Column(Float, nullable=True)
    proration_credit = Column(Float, default=0.0, nullable=True)
    proration_debit = Column(Float, default=0.0, nullable=True)

    base_amount = Column(Float, nullable=False)
    gst_percentage = Column(Integer, default=18, nullable=False)
    gst_amount = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    tax_name = Column(String, default="GST", nullable=False)
    tax_code = Column(String, default="GST", nullable=False)
    tax_percentage = Column(Float, default=18.0, nullable=False)
    tax_amount = Column(Float, default=0.0, nullable=False)

    status = Column(
        Enum(InvoiceStatus),
        default=InvoiceStatus.UNPAID,
        nullable=False
    )

    generated_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    due_date = Column(DateTime, nullable=False)

    customer = relationship(
        "Customer",
        back_populates="invoices"
    )

    subscription = relationship(
        "Subscription",
        back_populates="invoices"
    )

    payments = relationship(
        "Payment",
        back_populates="invoice",
        cascade="all, delete-orphan"
    )
