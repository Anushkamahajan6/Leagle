import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import create_tables
from services.qdrant_service import ensure_collection_exists

# Import all routers
from routers import regulations, policies, impact, alerts, rag

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

app.include_router(regulations.router, prefix="/api/regulations", tags=["regulations"])
app.include_router(policies.router, prefix="/api/policies", tags=["policies"])
app.include_router(impact.router, prefix="/api/impact", tags=["impact"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(rag.router, prefix="/api/rag", tags=["rag"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
