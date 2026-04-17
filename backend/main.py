import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import create_tables
from services.qdrant_service import ensure_collection_exists

# Import all routers
from routers import regulations, policies, impact, alerts, rag, upload, analytics
from services.websocket_service import sio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run on startup and shutdown."""
    logger.info("Starting up...")
    await create_tables()
    ensure_collection_exists()
    logger.info("Infrastructure ready.")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="AI Compliance Management System",
    version="1.0.0",
    description="Regulatory intelligence platform powered by Qdrant + LLM RAG",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from services.uk_legis_service import sync_uk_feed
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from fastapi import Depends

@app.post("/api/regulations/sync/uk")
async def trigger_uk_sync(db: AsyncSession = Depends(get_db)):
    count = await sync_uk_feed(db, limit=10)
    return {"status": "success", "count": count}

app.include_router(regulations.router, prefix="/api/regulations", tags=["regulations"])
app.include_router(policies.router, prefix="/api/policies", tags=["policies"])
app.include_router(impact.router, prefix="/api/impact", tags=["impact"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(rag.router, prefix="/api/rag", tags=["rag"])
app.include_router(upload.router, prefix="/api/ingest", tags=["ingest"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

# Wrap the FastAPI app with Socket.io ASGIApp
import socketio
socket_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path='/ws/socket.io')

if __name__ == "__main__":
    import uvicorn
    # Use the socket_app as the entry point since it wraps the FastAPI app
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)
