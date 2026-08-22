from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import UserRole


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(
        Enum(UserRole),
        default=UserRole.CUSTOMER,
        nullable=False
    )
    phone_number = Column(String, nullable=True)
    country = Column(String, nullable=False)
    country_code = Column(String, nullable=False, default="IN")
    currency_code = Column(String, nullable=False, default="INR")
    locale = Column(String, nullable=False, default="en-IN")
    timezone = Column(String, nullable=False, default="Asia/Kolkata")
    tax_region = Column(String, nullable=False, default="GST")
    address = Column(String, nullable=True)
    has_used_trial = Column(Boolean, default=False, nullable=False)
    
    business_name = Column(String, nullable=True)
    business_tax_id = Column(String, nullable=True)
    tax_exempt = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    subscriptions = relationship(
        "Subscription",
        back_populates="customer",
        cascade="all, delete-orphan"
    )

    billing_cycles = relationship(
        "BillingCycle",
        back_populates="customer",
        cascade="all, delete-orphan"
    )

    invoices = relationship(
        "Invoice",
        back_populates="customer",
        cascade="all, delete-orphan"
    )

    payments = relationship(
        "Payment",
        back_populates="customer",
        cascade="all, delete-orphan"
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="customer"
    )
