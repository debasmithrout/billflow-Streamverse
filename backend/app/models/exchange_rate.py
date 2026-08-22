from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base

class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    id = Column(Integer, primary_key=True, index=True)
    from_currency = Column(String(3), nullable=False, index=True)
    to_currency = Column(String(3), nullable=False, index=True)
    rate = Column(Float, nullable=False)
    provider = Column(String(50), nullable=False, default="Frankfurter")
    fetched_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
