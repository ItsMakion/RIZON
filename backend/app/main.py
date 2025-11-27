from fastapi import FastAPI, WebSocket, Query, status
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, procurement, purchase_requests, payments, revenue, audit_logs, analytics, files, roles, notifications, export, fraud
from app.db import engine, Base
from app.websocket.connection_manager import manager
from app.core import security

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="RIZON API", version="0.1", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(export.router, prefix="/api/v1/export", tags=["export"])
app.include_router(fraud.router, prefix="/api/v1/fraud", tags=["fraud"])

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, token: str = Query(...)):
    try:
        # Verify token
        payload = security.verify_token(token)
        token_user_id = int(payload.get("sub"))
        if token_user_id != user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except Exception:
        manager.disconnect(websocket, user_id)

@app.get("/")
async def root(): return {"message": "RIZON API running"}

