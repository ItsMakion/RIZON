from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.api import deps
from app.models.purchase_request import PurchaseRequest
from app.models.user import User
from app.schemas.purchase_request import PurchaseRequestCreate, PurchaseRequestUpdate, PurchaseRequestResponse

router = APIRouter()

def generate_request_id() -> str:
    """Generate a unique request ID like PR-2023-089"""
    from datetime import datetime
    import random
    year = datetime.now().year
    num = random.randint(1, 999)
    return f"PR-{year}-{num:03d}"

@router.get("/", response_model=List[PurchaseRequestResponse])
async def list_purchase_requests(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    status: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """List all purchase requests with optional filtering"""
    query = select(PurchaseRequest)
    
    # Apply filters
    conditions = []
    if status:
        conditions.append(PurchaseRequest.status == status)
    if department:
        conditions.append(PurchaseRequest.department == department)
    if search:
        conditions.append(
            or_(
                PurchaseRequest.title.ilike(f"%{search}%"),
                PurchaseRequest.request_id.ilike(f"%{search}%")
            )
        )
    
    if conditions:
        query = query.where(*conditions)
    
    query = query.offset(skip).limit(limit).order_by(PurchaseRequest.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{request_id}", response_model=PurchaseRequestResponse)
async def get_purchase_request(
    request_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get a single purchase request by ID"""
    result = await db.execute(select(PurchaseRequest).where(PurchaseRequest.id == request_id))
    purchase_request = result.scalars().first()
    if not purchase_request:
        raise HTTPException(status_code=404, detail="Purchase request not found")
    return purchase_request

@router.post("/", response_model=PurchaseRequestResponse)
async def create_purchase_request(
    request_in: PurchaseRequestCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Create a new purchase request"""
    request_id = generate_request_id()
    
    purchase_request = PurchaseRequest(
        request_id=request_id,
        title=request_in.title,
        department=request_in.department,
        description=request_in.description,
        total_value=request_in.total_value,
        requester_id=current_user.id,
    )
    db.add(purchase_request)
    await db.commit()
    await db.refresh(purchase_request)
    return purchase_request

@router.put("/{request_id}", response_model=PurchaseRequestResponse)
async def update_purchase_request(
    request_id: int,
    request_in: PurchaseRequestUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Update a purchase request"""
    result = await db.execute(select(PurchaseRequest).where(PurchaseRequest.id == request_id))
    purchase_request = result.scalars().first()
    if not purchase_request:
        raise HTTPException(status_code=404, detail="Purchase request not found")
    
    # Update fields
    update_data = request_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(purchase_request, field, value)
    
    await db.commit()
    await db.refresh(purchase_request)
    return purchase_request

@router.post("/{request_id}/approve", response_model=PurchaseRequestResponse)
async def approve_purchase_request(
    request_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Approve a purchase request"""
    result = await db.execute(select(PurchaseRequest).where(PurchaseRequest.id == request_id))
    purchase_request = result.scalars().first()
    if not purchase_request:
        raise HTTPException(status_code=404, detail="Purchase request not found")
    
    purchase_request.status = "approved"
    await db.commit()
    await db.refresh(purchase_request)
    return purchase_request

@router.post("/{request_id}/reject", response_model=PurchaseRequestResponse)
async def reject_purchase_request(
    request_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Reject a purchase request"""
    result = await db.execute(select(PurchaseRequest).where(PurchaseRequest.id == request_id))
    purchase_request = result.scalars().first()
    if not purchase_request:
        raise HTTPException(status_code=404, detail="Purchase request not found")
    
    purchase_request.status = "rejected"
    await db.commit()
    await db.refresh(purchase_request)
    return purchase_request
