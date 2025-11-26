from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.sql import func
from app.db import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String, unique=True, index=True, nullable=False)
    payee = Column(String, nullable=False)
    reference = Column(String, nullable=False)
    method = Column(String, nullable=False)  # bank_transfer, airtel_money, tnm_mobile, check
    amount = Column(Numeric(precision=12, scale=2), nullable=False)
    status = Column(String, default="pending_approval")  # pending_approval, scheduled, processing, completed, failed
    payment_date = Column(DateTime(timezone=True), nullable=True)
    processed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
