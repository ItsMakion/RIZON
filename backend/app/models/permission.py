from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)  # e.g., "procurement:create"
    description = Column(String, nullable=True)
    resource = Column(String, nullable=False)  # e.g., "procurement"
    action = Column(String, nullable=False)    # e.g., "create"

    # Relationship defined in Role model to avoid circular import issues
    # roles = relationship("Role", secondary="role_permissions", back_populates="permissions")
