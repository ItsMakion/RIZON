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

@router.get("/spending-trends")
async def get_spending_trends(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get monthly spending trends for the last 12 months"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=365)
    
    query = select(Payment).where(
        Payment.status == "completed",
        Payment.payment_date >= start_date
    )
    result = await db.execute(query)
    payments = result.scalars().all()
    
    monthly_data = {}
    for i in range(12):
        d = end_date - timedelta(days=30 * i)
        key = d.strftime("%Y-%m")
        monthly_data[key] = 0
        
    for payment in payments:
        if payment.payment_date:
            key = payment.payment_date.strftime("%Y-%m")
            if key in monthly_data:
                monthly_data[key] += payment.amount
                
    labels = sorted(monthly_data.keys())
    data = [monthly_data[label] for label in labels]
    
    return {
        "labels": labels,
        "datasets": [
            {
                "label": "Monthly Spending",
                "data": data,
                "borderColor": "#3b82f6",
                "backgroundColor": "rgba(59, 130, 246, 0.1)",
                "fill": True
            }
        ]
    }

@router.get("/vendor-performance")
async def get_vendor_performance(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get top vendors by spending"""
    query = select(Payment).where(Payment.status == "completed")
    result = await db.execute(query)
    payments = result.scalars().all()
    
    vendor_stats = {}
    for payment in payments:
        vendor = payment.vendor
        if vendor not in vendor_stats:
            vendor_stats[vendor] = {"amount": 0, "count": 0}
        vendor_stats[vendor]["amount"] += payment.amount
        vendor_stats[vendor]["count"] += 1
        
    sorted_vendors = sorted(vendor_stats.items(), key=lambda x: x[1]["amount"], reverse=True)[:10]
    
    return {
        "labels": [v[0] for v in sorted_vendors],
        "datasets": [
            {
                "label": "Total Spend",
                "data": [v[1]["amount"] for v in sorted_vendors],
                "backgroundColor": "#10b981"
            }
        ]
    }

@router.get("/forecast")
async def get_spending_forecast(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Simple spending forecast for next 3 months"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=180)
    
    query = select(Payment).where(
        Payment.status == "completed",
        Payment.payment_date >= start_date
    )
    result = await db.execute(query)
    payments = result.scalars().all()
    
    monthly_totals = {}
    for payment in payments:
        if payment.payment_date:
            key = payment.payment_date.strftime("%Y-%m")
            monthly_totals[key] = monthly_totals.get(key, 0) + payment.amount
            
    if not monthly_totals:
        return {"labels": [], "datasets": []}
        
    values = list(monthly_totals.values())
    avg_spend = sum(values) / len(values) if values else 0
    
    forecast_data = []
    labels = []
    current_month = end_date
    
    for i in range(1, 4):
        next_month = current_month + timedelta(days=30 * i)
        labels.append(next_month.strftime("%Y-%m"))
        forecast_data.append(avg_spend * (1 + (0.05 * i)))
        
    return {
        "labels": labels,
        "datasets": [
            {
                "label": "Projected Spending",
                "data": forecast_data,
                "borderColor": "#8b5cf6",
                "borderDash": [5, 5],
                "fill": False
            }
        ]
    }
