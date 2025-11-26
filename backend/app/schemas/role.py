from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class PermissionBase(BaseModel):
    name: str
    resource: str
    action: str
    description: Optional[str] = None

class PermissionCreate(PermissionBase):
    pass

class PermissionResponse(PermissionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    permissions: List[int] = []  # List of permission IDs

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[int]] = None

class RoleResponse(RoleBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    permissions: List[PermissionResponse] = []
