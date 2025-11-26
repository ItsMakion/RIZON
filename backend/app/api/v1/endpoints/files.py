from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.user import User
from app.models.attachment import Attachment
from app.schemas.attachment import AttachmentResponse, AttachmentCreate
from app.services.file_service import file_service

router = APIRouter()

@router.post("/upload", response_model=AttachmentResponse)
async def upload_file(
    file: UploadFile = File(...),
    entity_type: str = Query(...),
    entity_id: int = Query(...),
    description: str = Query(None),
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Upload a file and attach it to an entity"""
    # Save file to disk
    filename, file_size = await file_service.save_file(file)
    
    # Create attachment record
    attachment = Attachment(
        filename=filename,
        original_filename=file.filename,
        file_path=f"uploads/{filename}",
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        entity_type=entity_type,
        entity_id=entity_id,
        uploaded_by=current_user.id,
        description=description,
    )
    
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)
    
    return attachment

@router.get("/", response_model=List[AttachmentResponse])
async def list_files(
    entity_type: str = Query(None),
    entity_id: int = Query(None),
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """List all files, optionally filtered by entity"""
    query = select(Attachment)
    
    if entity_type and entity_id:
        query = query.where(
            Attachment.entity_type == entity_type,
            Attachment.entity_id == entity_id
        )
    
    query = query.order_by(Attachment.uploaded_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{file_id}/download")
async def download_file(
    file_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Download a file"""
    result = await db.execute(select(Attachment).where(Attachment.id == file_id))
    attachment = result.scalars().first()
    
    if not attachment:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = file_service.get_file_path(attachment.filename)
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=file_path,
        filename=attachment.original_filename,
        media_type=attachment.mime_type
    )

@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Delete a file"""
    result = await db.execute(select(Attachment).where(Attachment.id == file_id))
    attachment = result.scalars().first()
    
    if not attachment:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete from disk
    await file_service.delete_file(attachment.filename)
    
    # Delete from database
    await db.delete(attachment)
    await db.commit()
    
    return {"message": "File deleted successfully"}
