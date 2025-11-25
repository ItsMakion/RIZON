from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.v1.endpoints import auth
from app.db import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="RIZON API", version="0.1", lifespan=lifespan)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
async def root(): return {"message": "RIZON API running"}
