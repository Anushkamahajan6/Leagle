from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    database_url: str = "postgresql+asyncpg://user:password@localhost/compliance_db"
    
    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_collection: str = "regulations_v1"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # LLM
    gemini_api_key: str = ""
    openai_api_key: str = ""
    
    # App
    secret_key: str = "your-secret-key-change-in-production"
    environment: str = "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Cache the settings object to avoid reloading from environment each time"""
    return Settings()


settings = get_settings()
