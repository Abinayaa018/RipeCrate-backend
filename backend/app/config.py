from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "RipeCrate API"
    ENV: str = "development"

    # Use SQLite by default for zero-config local dev.
    # For production, set DATABASE_URL to a Postgres DSN, e.g.:
    #   postgresql+psycopg2://ripecrate:ripecrate@postgres:5432/ripecrate
    DATABASE_URL: str = "sqlite:///./ripecrate.db"

    JWT_SECRET_KEY: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12  # 12 hours

    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Location where trained models are stored (relative to backend/)
    ML_MODELS_DIR: str = "ml/models"

    class Config:
        env_file = ".env"


settings = Settings()
