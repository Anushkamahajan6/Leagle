from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from core.config import settings
import logging

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models"""
    pass


# Create async engine with proper configuration for Neon/PostgreSQL
# Note: asyncpg driver is required for async operations on Neon
engine = create_async_engine(
    settings.database_url,
    echo=False,  # Set to True for SQL logging in debug
    pool_size=5,  # Small pool for Neon free tier
    max_overflow=10,
    pool_pre_ping=True,  # Detect stale connections
    pool_recycle=3600,  # Recycle connections every hour
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncSession:
    """
    FastAPI dependency to inject an async database session.
    Usage in route handlers:
        async def my_route(db: AsyncSession = Depends(get_db)):
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_tables():
    """
    Create all tables in the database.
    Call this during application startup.
    """
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created/verified")
    except Exception as e:
        logger.warning(f"⚠️ Could not create database tables on startup: {e}")
        logger.warning("⚠️ If database is not available, table creation will be deferred")
        # Don't re-raise - allow app to start even if DB is unavailable


async def init_db():
    """Initialize database on application startup"""
    await create_tables()
