from datetime import datetime
from sqlalchemy import Column, Integer, Boolean, DateTime
from app.core.database import Base


class RetryConfiguration(Base):
    __tablename__ = "retry_configurations"

    id = Column(Integer, primary_key=True, index=True)
    retry_attempt = Column(Integer, unique=True, nullable=False)
    retry_after_days = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
