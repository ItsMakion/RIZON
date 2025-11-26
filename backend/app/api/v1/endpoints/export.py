from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.user import User
from app.models.payment import Payment
from app.models.procurement import Procurement
from app.services.export_service import export_service

router = APIRouter()

@router.get("/{module}")
async def export_data(
    module: str,
    format: str = Query("csv", regex="^(csv|excel)$"),
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Export data for a specific module"""
    
    data = []
    filename = f"{module}_export"
    
    if module == "payments":
        result = await db.execute(select(Payment))
        payments = result.scalars().all()
        data = [
            {
                "id": p.id,
                "amount": p.amount,
                "vendor": p.vendor,
                "status": p.status,
                "date": p.payment_date,
                "method": p.payment_method
            }
            for p in payments
        ]
    elif module == "procurement":
        result = await db.execute(select(Procurement))
        tenders = result.scalars().all()
        data = [
            {
                "id": t.id,
                "title": t.title,
                "status": t.status,
                "budget": t.budget,
                "deadline": t.deadline
            }
            for t in tenders
        ]
    else:
        raise HTTPException(status_code=400, detail="Invalid module")
    
    if format == "csv":
        stream = export_service.export_to_csv(data)
        media_type = "text/csv"
        filename += ".csv"
    else:
        stream = export_service.export_to_excel(data)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename += ".xlsx"
        
    return StreamingResponse(
        stream,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
