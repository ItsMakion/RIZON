from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.api import deps
from app.models.procurement import Procurement
from app.models.user import User
from app.schemas.procurement import ProcurementCreate, ProcurementUpdate, ProcurementResponse

router = APIRouter()

def generate_tender_id() -> str:
    """Generate a unique tender ID like TN-2023-067"""
    from datetime import datetime
    import random
    year = datetime.now().year
    num = random.randint(1, 999)
    return f"TN-{year}-{num:03d}"

@router.get("/", response_model=List[ProcurementResponse])
async def list_procurements(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """List all procurements with optional filtering"""
    query = select(Procurement)
    
    # Apply filters
    conditions = []
    if status:
        conditions.append(Procurement.status == status)
    if category:
        conditions.append(Procurement.category == category)
    if search:
        conditions.append(
            or_(
                Procurement.title.ilike(f"%{search}%"),
                Procurement.tender_id.ilike(f"%{search}%")
            )
        )
    
    if conditions:
        query = query.where(*conditions)
    
    query = query.offset(skip).limit(limit).order_by(Procurement.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{procurement_id}", response_model=ProcurementResponse)
async def get_procurement(
    procurement_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get a single procurement by ID"""
    result = await db.execute(select(Procurement).where(Procurement.id == procurement_id))
    procurement = result.scalars().first()
    if not procurement:
        raise HTTPException(status_code=404, detail="Procurement not found")
    return procurement

@router.post("/", response_model=ProcurementResponse)
async def create_procurement(
    procurement_in: ProcurementCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Create a new procurement/tender"""
    tender_id = generate_tender_id()
    
    procurement = Procurement(
        tender_id=tender_id,
        title=procurement_in.title,
        category=procurement_in.category,
        description=procurement_in.description,
        published_date=procurement_in.published_date,
        deadline=procurement_in.deadline,
        estimated_value=procurement_in.estimated_value,
        status=procurement_in.status,
        created_by=current_user.id,
    )
    db.add(procurement)
    await db.commit()
    await db.refresh(procurement)
    return procurement

@router.put("/{procurement_id}", response_model=ProcurementResponse)
async def update_procurement(
    procurement_id: int,
    procurement_in: ProcurementUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Update a procurement"""
    result = await db.execute(select(Procurement).where(Procurement.id == procurement_id))
    procurement = result.scalars().first()
    if not procurement:
        raise HTTPException(status_code=404, detail="Procurement not found")
    
    # Update fields
    update_data = procurement_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(procurement, field, value)
    
    await db.commit()
    await db.refresh(procurement)
    return procurement

@router.delete("/{procurement_id}")
async def delete_procurement(
    procurement_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Delete a procurement"""
    result = await db.execute(select(Procurement).where(Procurement.id == procurement_id))
    procurement = result.scalars().first()
    if not procurement:
        raise HTTPException(status_code=404, detail="Procurement not found")
    
    await db.delete(procurement)
    await db.commit()
    return {"message": "Procurement deleted successfully"}
