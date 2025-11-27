from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api import deps
from app.models.fraud_alert import FraudAlert
from app.models.user import User
from pydantic import BaseModel
from datetime import datetime

class FraudAlertResponse(BaseModel):
    id: int
    payment_id: int
    severity: str
    description: str
    is_resolved: bool
    detected_at: datetime
    
    class Config:
        from_attributes = True

router = APIRouter()

@router.get("/", response_model=List[FraudAlertResponse])
async def list_fraud_alerts(
    resolved: bool = False,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """List fraud alerts"""
    query = select(FraudAlert).where(FraudAlert.is_resolved == resolved).order_by(FraudAlert.detected_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.put("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Resolve a fraud alert"""
    result = await db.execute(select(FraudAlert).where(FraudAlert.id == alert_id))
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = current_user.id
    
    await db.commit()
    return {"message": "Alert resolved"}
