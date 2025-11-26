from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.role import Role
from app.models.permission import Permission
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse, PermissionResponse
from app.core.permissions import has_permission

router = APIRouter()

@router.get("/permissions", response_model=List[PermissionResponse])
async def list_permissions(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    """List all available permissions"""
    result = await db.execute(select(Permission))
    return result.scalars().all()

@router.get("/", response_model=List[RoleResponse])
async def list_roles(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    """List all roles"""
    result = await db.execute(select(Role).options(selectinload(Role.permissions)))
    return result.scalars().all()

@router.post("/", response_model=RoleResponse)
async def create_role(
    role_in: RoleCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    # authorized: bool = Depends(has_permission("roles", "create")) # Uncomment when permissions seeded
) -> Any:
    """Create a new role"""
    # Check if role exists
    result = await db.execute(select(Role).where(Role.name == role_in.name))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Role already exists")
    
    role = Role(name=role_in.name, description=role_in.description)
    
    # Add permissions
    if role_in.permissions:
        result = await db.execute(select(Permission).where(Permission.id.in_(role_in.permissions)))
        permissions = result.scalars().all()
        role.permissions = permissions
    
    db.add(role)
    await db.commit()
    await db.refresh(role)
    
    # Re-fetch with permissions loaded
    result = await db.execute(select(Role).options(selectinload(Role.permissions)).where(Role.id == role.id))
    return result.scalars().first()

@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    """Get role by ID"""
    result = await db.execute(select(Role).options(selectinload(Role.permissions)).where(Role.id == role_id))
    role = result.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.put("/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int,
    role_in: RoleUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    # authorized: bool = Depends(has_permission("roles", "update"))
) -> Any:
    """Update role"""
    result = await db.execute(select(Role).options(selectinload(Role.permissions)).where(Role.id == role_id))
    role = result.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role_in.name:
        role.name = role_in.name
    if role_in.description:
        role.description = role_in.description
    
    if role_in.permissions is not None:
        result = await db.execute(select(Permission).where(Permission.id.in_(role_in.permissions)))
        permissions = result.scalars().all()
        role.permissions = permissions
    
    await db.commit()
    await db.refresh(role)
    return role

@router.delete("/{role_id}")
async def delete_role(
    role_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    # authorized: bool = Depends(has_permission("roles", "delete"))
) -> Any:
    """Delete role"""
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    await db.delete(role)
    await db.commit()
    return {"message": "Role deleted successfully"}
