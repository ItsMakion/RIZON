from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.api import deps
from app.models.revenue import Revenue
from app.models.user import User
from app.schemas.revenue import RevenueCreate, RevenueUpdate, RevenueResponse

router = APIRouter()

def generate_revenue_id() -> str:
    """Generate a unique revenue ID like REV-2023-089"""
    from datetime import datetime
    import random
    year = datetime.now().year
    num = random.randint(1, 999)
    return f"REV-{year}-{num:03d}"

@router.get("/", response_model=List[RevenueResponse])
async def list_revenues(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """List all revenue records with optional filtering"""
    query = select(Revenue)
    
    # Apply filters
    conditions = []
    if status:
        conditions.append(Revenue.status == status)
    if category:
        conditions.append(Revenue.category == category)
    if search:
        conditions.append(
            or_(
                Revenue.source.ilike(f"%{search}%"),
                Revenue.revenue_id.ilike(f"%{search}%")
            )
        )
    
    if conditions:
        query = query.where(*conditions)
    
    query = query.offset(skip).limit(limit).order_by(Revenue.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{revenue_id}", response_model=RevenueResponse)
async def get_revenue(
    revenue_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get a single revenue record by ID"""
    result = await db.execute(select(Revenue).where(Revenue.id == revenue_id))
    revenue = result.scalars().first()
    if not revenue:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    return revenue

@router.post("/", response_model=RevenueResponse)
async def create_revenue(
    revenue_in: RevenueCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Create a new revenue record"""
    revenue_id = generate_revenue_id()
    
    revenue = Revenue(
        revenue_id=revenue_id,
        source=revenue_in.source,
        category=revenue_in.category,
        description=revenue_in.description,
        amount=revenue_in.amount,
        due_date=revenue_in.due_date,
    )
    db.add(revenue)
    await db.commit()
    await db.refresh(revenue)
    return revenue

@router.put("/{revenue_id}", response_model=RevenueResponse)
async def update_revenue(
    revenue_id: int,
    revenue_in: RevenueUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Update a revenue record"""
    result = await db.execute(select(Revenue).where(Revenue.id == revenue_id))
    revenue = result.scalars().first()
    if not revenue:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    
    # Update fields
    update_data = revenue_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(revenue, field, value)
    
    await db.commit()
    await db.refresh(revenue)
    return revenue
