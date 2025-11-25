from app.db import engine, AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncEngine

def test_db_config():
    assert isinstance(engine, AsyncEngine)
    assert AsyncSessionLocal is not None
