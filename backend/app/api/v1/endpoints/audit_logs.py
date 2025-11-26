from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse

router = APIRouter()

@router.get("/", response_model=List[AuditLogResponse])
async def list_audit_logs(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    entity_type: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """List all audit logs with optional filtering (read-only)"""
    query = select(AuditLog)
    
    # Apply filters
    conditions = []
    if entity_type:
        conditions.append(AuditLog.entity_type == entity_type)
    if action:
        conditions.append(AuditLog.action == action)
    if user_id:
        conditions.append(AuditLog.user_id == user_id)
    
    if conditions:
        query = query.where(*conditions)
    
    query = query.offset(skip).limit(limit).order_by(AuditLog.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{log_id}", response_model=AuditLogResponse)
async def get_audit_log(
    log_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get a single audit log by ID"""
    result = await db.execute(select(AuditLog).where(AuditLog.id == log_id))
    audit_log = result.scalars().first()
    if not audit_log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return audit_log
