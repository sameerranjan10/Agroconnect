"""
AgroConnect - Core Configuration
Loads settings from environment variables / .env file
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AgroConnect"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://agrouser:agropass@localhost:5432/agroconnect"

    # JWT
    SECRET_KEY: str = "change-me-in-production-32-chars-min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    VITE_GOOGLE_CLIENT_ID: str = ""
    # Government/Open Data API
    DATA_GOV_API_KEY: str = ""

    @property
    def google_client_id(self) -> str:
        return self.GOOGLE_CLIENT_ID or self.VITE_GOOGLE_CLIENT_ID

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — loaded once per process."""
    return Settings()


settings = get_settings()
