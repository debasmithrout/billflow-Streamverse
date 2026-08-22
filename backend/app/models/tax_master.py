from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.core.database import Base


class TaxMaster(Base):
    __tablename__ = "tax_masters"

    id = Column(Integer, primary_key=True, index=True)
    tax_name = Column(String, nullable=False)
    tax_code = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False, index=True)
    state = Column(String, nullable=True, index=True)
    tax_type = Column(String, nullable=False)
    tax_percentage = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    reverse_charge = Column(Boolean, default=False, nullable=False)
    effective_from = Column(DateTime, nullable=False)
    effective_to = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
