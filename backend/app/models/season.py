# app/models/season.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Season(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True, index=True)
    series_id = Column(Integer, ForeignKey("series.id", ondelete="CASCADE"), nullable=False)
    season_number = Column(Integer, nullable=False)
    title = Column(String, nullable=True)
    description = Column(String, nullable=True)
    poster = Column(String, nullable=True)
    order = Column(Integer, default=0, nullable=False)

    series = relationship("Series", back_populates="seasons")
    episodes = relationship("Episode", back_populates="season", cascade="all, delete-orphan")
