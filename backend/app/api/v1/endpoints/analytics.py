from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timedelta

from app.api import deps
from app.models.user import User
from app.models.procurement import Procurement
from app.models.payment import Payment
from app.models.purchase_request import PurchaseRequest
from app.models.revenue import Revenue

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard_stats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get dashboard statistics"""
    
    # Active tenders
    active_tenders_result = await db.execute(
        select(func.count(Procurement.id)).where(Procurement.status == "active")
    )
    active_tenders = active_tenders_result.scalar() or 0
    
    # Pending purchase requests
    pending_requests_result = await db.execute(
        select(func.count(PurchaseRequest.id)).where(PurchaseRequest.status == "pending_approval")
    )
    pending_requests = pending_requests_result.scalar() or 0
    
    # Pending payments
    pending_payments_result = await db.execute(
        select(func.count(Payment.id), func.sum(Payment.amount))
        .where(Payment.status == "pending_approval")
    )
    pending_payments_count, pending_payments_amount = pending_payments_result.first()
    
    # Revenue this month
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    revenue_result = await db.execute(
        select(func.sum(Revenue.amount))
        .where(Revenue.status == "collected")
        .where(Revenue.collected_date >= current_month_start)
    )
    revenue_this_month = revenue_result.scalar() or 0
    
    return {
        "active_tenders": active_tenders,
        "pending_purchase_requests": pending_requests,
        "pending_payments": {
            "count": pending_payments_count or 0,
            "amount": float(pending_payments_amount or 0)
        },
        "revenue_this_month": float(revenue_this_month)
    }

@router.get("/procurement-trends", response_model=Dict[str, Any])
async def get_procurement_trends(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get procurement trends over time"""
    # Get procurement count by status
    status_result = await db.execute(
        select(Procurement.status, func.count(Procurement.id))
        .group_by(Procurement.status)
    )
    status_counts = {status: count for status, count in status_result.all()}
    
    # Get procurement count by category
    category_result = await db.execute(
        select(Procurement.category, func.count(Procurement.id))
        .group_by(Procurement.category)
    )
    category_counts = {category: count for category, count in category_result.all()}
    
    return {
        "by_status": status_counts,
        "by_category": category_counts
    }

@router.get("/payment-summary", response_model=Dict[str, Any])
async def get_payment_summary(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get payment summary by method and status"""
    # Get payment count and amount by method
    method_result = await db.execute(
        select(Payment.method, func.count(Payment.id), func.sum(Payment.amount))
        .group_by(Payment.method)
    )
    method_summary = {
        method: {"count": count, "amount": float(amount or 0)}
        for method, count, amount in method_result.all()
    }
    
    # Get payment count and amount by status
    status_result = await db.execute(
        select(Payment.status, func.count(Payment.id), func.sum(Payment.amount))
        .group_by(Payment.status)
    )
    status_summary = {
        status: {"count": count, "amount": float(amount or 0)}
        for status, count, amount in status_result.all()
    }
    
    return {
        "by_method": method_summary,
        "by_status": status_summary
    }
