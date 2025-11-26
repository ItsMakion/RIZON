from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, procurement, purchase_requests, payments, revenue, audit_logs, analytics, files, roles
from app.db import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="RIZON API", version="0.1", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(procurement.router, prefix="/api/v1/procurement", tags=["procurement"])
app.include_router(purchase_requests.router, prefix="/api/v1/purchase-requests", tags=["purchase-requests"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(revenue.router, prefix="/api/v1/revenue", tags=["revenue"])
app.include_router(audit_logs.router, prefix="/api/v1/audit-logs", tags=["audit-logs"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(files.router, prefix="/api/v1/files", tags=["files"])
app.include_router(roles.router, prefix="/api/v1/roles", tags=["roles"])

@app.get("/")
async def root(): return {"message": "RIZON API running"}

