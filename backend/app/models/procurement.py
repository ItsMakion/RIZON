from sqlalchemy import Boolean, Column, Integer, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.sql import func
from app.db import Base

class Procurement(Base):
    __tablename__ = "procurements"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    published_date = Column(DateTime(timezone=True), nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=False)
    estimated_value = Column(Numeric(precision=12, scale=2), nullable=False)
    status = Column(String, default="draft")  # draft, active, evaluation, awarded, archived
    bids_count = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
