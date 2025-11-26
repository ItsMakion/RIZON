from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class PaymentBase(BaseModel):
    payment_id: str
    payee: str
    reference: str
    method: str
    amount: Decimal
    status: str = "pending_approval"
    notes: Optional[str] = None

class PaymentCreate(BaseModel):
    payee: str
    reference: str
    method: str
    amount: Decimal
    notes: Optional[str] = None
    payment_date: Optional[datetime] = None

class PaymentUpdate(BaseModel):
    payee: Optional[str] = None
    reference: Optional[str] = None
    method: Optional[str] = None
    amount: Optional[Decimal] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    payment_date: Optional[datetime] = None

class PaymentResponse(PaymentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    payment_date: Optional[datetime] = None
    processed_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
