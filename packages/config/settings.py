from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FramePro API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/v1"
    
    # Security & Auth
    SECRET_KEY: str = "super-secret-framepro-jwt-key-change-in-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database & Cache
    DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage (Cloudflare R2)
    R2_BUCKET: str = "framepro-assets"
    R2_ENDPOINT: str = "https://r2.cloudflare.com"

    # AI API Keys
    GEMINI_API_KEY: str = "mock_gemini_key"
    OPENAI_API_KEY: str = "mock_openai_key"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
