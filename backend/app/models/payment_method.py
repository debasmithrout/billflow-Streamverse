from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    method_type = Column(String(32), nullable=False)  # 'card', 'upi', 'netbanking', 'wallet'
    provider = Column(String(64), nullable=False)     # 'VISA', 'Mastercard', 'SBI', 'Paytm', etc.
    display_name = Column(String(128), nullable=False)
    
    last_four = Column(String(4), nullable=True)
    upi_id = Column(String(128), nullable=True)
    bank_name = Column(String(128), nullable=True)
    wallet_name = Column(String(128), nullable=True)
    
    expiry_month = Column(Integer, nullable=True)
    expiry_year = Column(Integer, nullable=True)
    
    is_default = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    customer = relationship("Customer", backref="payment_methods")
