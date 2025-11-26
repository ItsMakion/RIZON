from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, func

from app.api import deps
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse

router = APIRouter()

def generate_payment_id() -> str:
    """Generate a unique payment ID like PAY-2023-156"""
    from datetime import datetime
    import random
    year = datetime.now().year
    num = random.randint(1, 999)
    return f"PAY-{year}-{num:03d}"

@router.get("/", response_model=List[PaymentResponse])
async def list_payments(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    status: Optional[str] = Query(None),
    method: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """List all payments with optional filtering"""
    query = select(Payment)
    
    # Apply filters
    conditions = []
    if status:
        conditions.append(Payment.status == status)
    if method:
        conditions.append(Payment.method == method)
    if search:
        conditions.append(
            or_(
                Payment.payee.ilike(f"%{search}%"),
                Payment.payment_id.ilike(f"%{search}%"),
                Payment.reference.ilike(f"%{search}%")
            )
        )
    
    if conditions:
        query = query.where(*conditions)
    
    query = query.offset(skip).limit(limit).order_by(Payment.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/stats", response_model=Dict[str, Any])
async def get_payment_stats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get payment statistics"""
    # Pending payments
    pending_result = await db.execute(
        select(func.count(Payment.id), func.sum(Payment.amount))
        .where(Payment.status == "pending_approval")
    )
    pending_count, pending_amount = pending_result.first()
    
    # Scheduled payments
    scheduled_result = await db.execute(
        select(func.count(Payment.id), func.sum(Payment.amount))
        .where(Payment.status == "scheduled")
    )
    scheduled_count, scheduled_amount = scheduled_result.first()
    
    # Completed payments this month
    from datetime import datetime
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    completed_result = await db.execute(
        select(func.count(Payment.id), func.sum(Payment.amount))
        .where(Payment.status == "completed")
        .where(Payment.payment_date >= current_month_start)
    )
    completed_count, completed_amount = completed_result.first()
    
    return {
        "pending": {
            "count": pending_count or 0,
            "amount": float(pending_amount or 0)
        },
        "scheduled": {
            "count": scheduled_count or 0,
            "amount": float(scheduled_amount or 0)
        },
        "completed_this_month": {
            "count": completed_count or 0,
            "amount": float(completed_amount or 0)
        }
    }

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get a single payment by ID"""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalars().first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment_in: PaymentCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Create/schedule a new payment"""
    payment_id = generate_payment_id()
    
    payment = Payment(
        payment_id=payment_id,
        payee=payment_in.payee,
        reference=payment_in.reference,
        method=payment_in.method,
        amount=payment_in.amount,
        notes=payment_in.notes,
        payment_date=payment_in.payment_date,
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return payment

@router.post("/{payment_id}/process", response_model=PaymentResponse)
async def process_payment(
    payment_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Process a payment (triggers integration)"""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalars().first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Use payment service to process payment
    from app.services.payment_service import payment_service
    
    try:
        process_result = await payment_service.process_payment(payment, db, current_user.id)
        return payment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment processing failed: {str(e)}")

