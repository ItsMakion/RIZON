from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class PurchaseRequestBase(BaseModel):
    request_id: str
    title: str
    department: str
    description: Optional[str] = None
    status: str = "pending_approval"
    total_value: Decimal

class PurchaseRequestCreate(BaseModel):
    title: str
    department: str
    description: Optional[str] = None
    total_value: Decimal

class PurchaseRequestUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    total_value: Optional[Decimal] = None
    status: Optional[str] = None

class PurchaseRequestResponse(PurchaseRequestBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    requester_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
