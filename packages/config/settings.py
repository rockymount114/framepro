from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Root directory of the monorepo (3 levels up from packages/config/settings.py)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "FramePro API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/v1"
    
    # Security & Auth
    SECRET_KEY: str = "super-secret-framepro-jwt-key-change-in-prod"
    JWT_SECRET_KEY: str = "super-secret-framepro-jwt-key-change-in-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Admin Panel Credentials
    ADMIN_DEFAULT_EMAIL: str = "admin@framepro.com"
    ADMIN_DEFAULT_PASSWORD: str = "admin-secure-pass-2026!"
    ADMIN_API_KEY: str = "framepro-admin-key-9f8e7d6c"

    # Database & Cache
    DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage (Cloudflare R2)
    R2_BUCKET: str = "framepro-assets"
    R2_ENDPOINT: str = "https://r2.cloudflare.com"
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""

    # AI API Keys
    GEMINI_API_KEY: str = "mock_gemini_key"
    OPENAI_API_KEY: str = "mock_openai_key"
    CLAUDE_API_KEY: str = "mock_claude_key"

    model_config = SettingsConfigDict(
        env_file=(str(ENV_FILE), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()


