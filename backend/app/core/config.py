import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "F1 Insights Monolith"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    ADMIN_API_KEY: str = os.getenv("ADMIN_API_KEY", "f1-insights-admin-secret-key-2026")
    
    # Storage
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", os.path.join(BASE_DIR, "backend", "data", "f1_insights.db"))
    
    # Server & Port
    PORT: int = int(os.getenv("PORT", 8000))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Notifications
    DISCORD_WEBHOOK_URL: str = os.getenv("DISCORD_WEBHOOK_URL", "")
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")
    
    # AI & External APIs
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    class Config:
        case_sensitive = True
        extra = "ignore"
        env_file = ".env"

settings = Settings()
