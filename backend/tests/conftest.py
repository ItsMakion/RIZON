import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.db import Base
from app.main import app
from app.api.deps import get_db

# Use an in-memory SQLite database for tests or a separate test postgres DB
# For simplicity in this environment, we might want to use the same DB or a test one.
# Let's use sqlite for speed and isolation if possible, but app uses postgres specific features (asyncpg).
# So we should stick to the postgres DB but maybe a different name or just transaction rollbacks.
# Given the docker-compose setup, we can use the same DB but we need to be careful.
# Ideally, we override the dependency.

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@db:5432/RIZON" # Use the same for now, assuming dev env.

engine = create_async_engine(DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestingSessionLocal() as session:
        yield session
        # Rollback is handled by the session context manager if exception, but here we want to clean up?
        # For now, let's just yield session.
        # To truly isolate, we might want to drop tables after or use nested transactions.
        await session.rollback()

@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
