from fastapi import HTTPException, Depends, status
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.api import deps
from app.models.user import User
from app.models.role import Role
from sqlalchemy.ext.asyncio import AsyncSession

class PermissionChecker:
    def __init__(self, resource: str, action: str):
        self.resource = resource
        self.action = action

    async def __call__(
        self,
        current_user: User = Depends(deps.get_current_user),
        db: AsyncSession = Depends(deps.get_db)
    ):
        # Superusers have all permissions
        if current_user.is_superuser:
            return True

        # Get user's role
        # Assuming User.role stores the role name (string)
        # We need to fetch the Role object and its permissions
        result = await db.execute(
            select(Role)
            .options(selectinload(Role.permissions))
            .where(Role.name == current_user.role)
        )
        role = result.scalars().first()

        if not role:
            # If role doesn't exist in DB (legacy or mismatch), deny
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role not found or invalid"
            )

        # Check if role has the required permission
        has_perm = any(
            p.resource == self.resource and p.action == self.action
            for p in role.permissions
        )

        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not enough permissions. Required: {self.resource}:{self.action}"
            )
        
        return True

def has_permission(resource: str, action: str):
    return PermissionChecker(resource, action)
