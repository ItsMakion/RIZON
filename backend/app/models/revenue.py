from sqlalchemy import Column, Integer, String, DateTime, Numeric, Text
from sqlalchemy.sql import func
from app.db import Base

class Revenue(Base):
    __tablename__ = "revenues"

    id = Column(Integer, primary_key=True, index=True)
    revenue_id = Column(String, unique=True, index=True, nullable=False)
    source = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(Numeric(precision=12, scale=2), nullable=False)
    status = Column(String, default="pending")  # pending, collected, overdue
    due_date = Column(DateTime(timezone=True), nullable=True)
    collected_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
