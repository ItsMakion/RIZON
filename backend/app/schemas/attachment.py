from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class AttachmentBase(BaseModel):
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    entity_type: str
    entity_id: int
    description: Optional[str] = None

class AttachmentCreate(BaseModel):
    entity_type: str
    entity_id: int
    description: Optional[str] = None

class AttachmentResponse(AttachmentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    file_path: str
    uploaded_by: int
    uploaded_at: datetime
