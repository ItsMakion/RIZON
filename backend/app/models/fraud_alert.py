from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from datetime import datetime
from app.db import Base

class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    severity = Column(String, default="medium") # low, medium, high, critical
    description = Column(String, nullable=False)
    is_resolved = Column(Boolean, default=False)
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
