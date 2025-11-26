from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class ProcurementBase(BaseModel):
    tender_id: str
    title: str
    category: str
    description: Optional[str] = None
    published_date: datetime
    deadline: datetime
    estimated_value: Decimal
    status: str = "draft"
    bids_count: int = 0

class ProcurementCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    published_date: datetime
    deadline: datetime
    estimated_value: Decimal
    status: str = "draft"

class ProcurementUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    published_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    estimated_value: Optional[Decimal] = None
    status: Optional[str] = None
    bids_count: Optional[int] = None

class ProcurementResponse(ProcurementBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
