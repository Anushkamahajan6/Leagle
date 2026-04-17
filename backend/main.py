from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from core.database import create_tables
from routers import regulations, policies

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events"""
    # Startup
    await create_tables()
    logger.info("✅ FastAPI server started")
    yield
    # Shutdown
    logger.info("🛑 FastAPI server shutdown")


app = FastAPI(
    title="CodeWizards AI Compliance API",
    description="Semantic regulation analysis and compliance management system",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(regulations.router)
app.include_router(policies.router)
# More routers will be added:
# app.include_router(impact.router)
# app.include_router(alerts.router)
# app.include_router(rag.router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CodeWizards Compliance API",
        "version": "0.1.0"
    }


@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": "CodeWizards AI Compliance Management System",
        "description": "Semantic regulation analysis and compliance tracking",
        "docs_url": "/docs",
        "version": "0.1.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
