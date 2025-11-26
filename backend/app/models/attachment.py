from sqlalchemy import Column, Integer, String, DateTime, BigInteger
from datetime import datetime
from app.db import Base

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(BigInteger, nullable=False)  # Size in bytes
    mime_type = Column(String, nullable=False)
    
    # Polymorphic relation - can attach to any entity
    entity_type = Column(String, nullable=False)  # e.g., "procurement", "payment"
    entity_id = Column(Integer, nullable=False)
    
    uploaded_by = Column(Integer, nullable=False)  # User ID
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    description = Column(String, nullable=True)
