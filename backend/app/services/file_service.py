import os
import uuid
import aiofiles
from typing import Optional
from fastapi import UploadFile, HTTPException
from pathlib import Path

class FileService:
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Allowed file types
        self.allowed_extensions = {
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 
            'jpg', 'jpeg', 'png', 'gif',
            'txt', 'csv', 'zip'
        }
        
        # Max file size: 10MB
        self.max_file_size = 10 * 1024 * 1024
    
    def validate_file(self, file: UploadFile) -> None:
        """Validate file type and size"""
        # Check file extension
        if file.filename:
            ext = file.filename.split('.')[-1].lower()
            if ext not in self.allowed_extensions:
                raise HTTPException(
                    status_code=400,
                    detail=f"File type .{ext} not allowed. Allowed types: {', '.join(self.allowed_extensions)}"
                )
    
    def generate_filename(self, original_filename: str) -> str:
        """Generate unique filename"""
        ext = original_filename.split('.')[-1].lower()
        unique_id = str(uuid.uuid4())
        return f"{unique_id}.{ext}"
    
    async def save_file(self, file: UploadFile) -> tuple[str, int]:
        """
        Save uploaded file to disk
        Returns: (file_path, file_size)
        """
        self.validate_file(file)
        
        # Generate unique filename
        filename = self.generate_filename(file.filename)
        file_path = self.upload_dir / filename
        
        # Save file
        file_size = 0
        async with aiofiles.open(file_path, 'wb') as f:
            while chunk := await file.read(1024 * 1024):  # Read 1MB at a time
                file_size += len(chunk)
                if file_size > self.max_file_size:
                    # Delete partial file
                    await aiofiles.os.remove(file_path)
                    raise HTTPException(
                        status_code=400,
                        detail=f"File too large. Max size: {self.max_file_size / 1024 / 1024}MB"
                    )
                await f.write(chunk)
        
        return str(filename), file_size
    
    async def delete_file(self, filename: str) -> None:
        """Delete file from disk"""
        file_path = self.upload_dir / filename
        if file_path.exists():
            await aiofiles.os.remove(file_path)
    
    def get_file_path(self, filename: str) -> Path:
        """Get full path to file"""
        return self.upload_dir / filename

file_service = FileService()
