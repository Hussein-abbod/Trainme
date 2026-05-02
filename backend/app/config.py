"""
Application configuration via pydantic-settings.
Values are loaded from the .env file automatically.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # ── Database ─────────────────────────────────────
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "trainme_db"
    DB_SSL: bool = False

    # ── JWT ───────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # ── App ───────────────────────────────────────────
    APP_NAME: str = "TrainMe API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False  # Set True in .env only for SQL echo debugging
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # ── File Upload ───────────────────────────────────
    MAX_FILE_SIZE_MB: int = 5
    CLOUDINARY_URL: str = ""

    @property
    def database_url(self) -> str:
        base = (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            f"?charset=utf8mb4"
        )
        if self.DB_SSL:
            base += "&ssl_disabled=false"
        return base

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
