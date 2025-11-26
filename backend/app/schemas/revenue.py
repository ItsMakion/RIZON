from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class RevenueBase(BaseModel):
    revenue_id: str
    source: str
    category: str
    description: Optional[str] = None
    amount: Decimal
    status: str = "pending"
    due_date: Optional[datetime] = None

class RevenueCreate(BaseModel):
    source: str
    category: str
    description: Optional[str] = None
    amount: Decimal
    due_date: Optional[datetime] = None

class RevenueUpdate(BaseModel):
    source: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    collected_date: Optional[datetime] = None

class RevenueResponse(RevenueBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    collected_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
