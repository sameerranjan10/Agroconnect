from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8001
    model_dir: str = "app/ml_models"
    log_level: str = "info"

    @property
    def model_path(self) -> Path:
        return Path(self.model_dir)

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
