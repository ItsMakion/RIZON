from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """List current user's notifications"""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Mark notification as read"""
    result = await db.execute(
        select(Notification)
        .where(Notification.id == notification_id, Notification.user_id == current_user.id)
    )
    notification = result.scalars().first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return notification

@router.put("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Mark all notifications as read"""
    # This requires an update query
    # SQLAlchemy async update is a bit different
    # For simplicity, fetch all unread and update loop, or use update statement
    # Using update statement:
    from sqlalchemy import update
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.commit()
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Delete notification"""
    result = await db.execute(
        select(Notification)
        .where(Notification.id == notification_id, Notification.user_id == current_user.id)
    )
    notification = result.scalars().first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    await db.delete(notification)
    await db.commit()
    return {"message": "Notification deleted"}
