from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    database_url: str = "postgresql+asyncpg://user:password@localhost/compliance_db"
    
    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_url: str | None = None
    qdrant_api_key: str | None = None
    qdrant_collection: str = "regulations_v1"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # LLM
    gemini_api_key: str = ""
    openai_api_key: str = ""
    groq_api_key: str = ""
    llm_model: str = "gemini-2.0-flash" 
    llm_provider: str = "groq"  # "gemini" or "groq"
    
    # App
    secret_key: str = "your-secret-key-change-in-production"
    environment: str = "development"
    
    class Config:
        env_file = str(Path(__file__).parent.parent.parent / ".env")
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Cache the settings object to avoid reloading from environment each time"""
    return Settings()


settings = get_settings()