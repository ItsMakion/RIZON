import asyncio
import sys
import os

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import AsyncSessionLocal, engine, Base
from app.models.role import Role
from app.models.permission import Permission
from sqlalchemy.future import select

async def seed():
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("Seeding RBAC data...")
    async with AsyncSessionLocal() as session:
        # Create permissions
        permissions = [
            # Procurement
            {"name": "procurement:read", "resource": "procurement", "action": "read", "description": "View procurement data"},
            {"name": "procurement:create", "resource": "procurement", "action": "create", "description": "Create new tenders"},
            {"name": "procurement:update", "resource": "procurement", "action": "update", "description": "Update existing tenders"},
            {"name": "procurement:delete", "resource": "procurement", "action": "delete", "description": "Delete tenders"},
            
            # Payments
            {"name": "payments:read", "resource": "payments", "action": "read", "description": "View payment data"},
            {"name": "payments:create", "resource": "payments", "action": "create", "description": "Create new payments"},
            {"name": "payments:process", "resource": "payments", "action": "process", "description": "Process payments"},
            
            # Roles
            {"name": "roles:read", "resource": "roles", "action": "read", "description": "View roles"},
            {"name": "roles:create", "resource": "roles", "action": "create", "description": "Create new roles"},
            {"name": "roles:update", "resource": "roles", "action": "update", "description": "Update roles"},
            {"name": "roles:delete", "resource": "roles", "action": "delete", "description": "Delete roles"},
            
            # Users
            {"name": "users:read", "resource": "users", "action": "read", "description": "View users"},
            {"name": "users:update", "resource": "users", "action": "update", "description": "Update users"},
        ]

        db_perms = []
        for p in permissions:
            result = await session.execute(select(Permission).where(Permission.name == p["name"]))
            existing = result.scalars().first()
            if not existing:
                perm = Permission(**p)
                session.add(perm)
                db_perms.append(perm)
            else:
                db_perms.append(existing)
        
        await session.commit()
        
        # Refresh permissions to get IDs
        for p in db_perms:
            await session.refresh(p)

        # Create Roles
        roles = [
            {"name": "admin", "description": "Administrator with full access"},
            {"name": "finance_officer", "description": "Finance Officer"},
            {"name": "procurement_officer", "description": "Procurement Officer"},
            {"name": "analyst", "description": "Data Analyst"},
            {"name": "customer", "description": "Regular User"},
        ]

        for r in roles:
            result = await session.execute(select(Role).where(Role.name == r["name"]))
            existing = result.scalars().first()
            if not existing:
                role = Role(**r)
                
                # Assign permissions based on role
                if r["name"] == "admin":
                    role.permissions = db_perms
                elif r["name"] == "finance_officer":
                    role.permissions = [p for p in db_perms if p.resource in ["payments", "procurement:read"]]
                elif r["name"] == "procurement_officer":
                    role.permissions = [p for p in db_perms if p.resource == "procurement"]
                elif r["name"] == "analyst":
                    role.permissions = [p for p in db_perms if p.action == "read"]
                
                session.add(role)
        
        await session.commit()
        print("RBAC seeded successfully")

if __name__ == "__main__":
    asyncio.run(seed())
