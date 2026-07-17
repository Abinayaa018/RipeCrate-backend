import json
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "RipeCrate API"
    ENV: str = "development"

    DATABASE_URL: str = "sqlite:///./ripecrate.db"

    JWT_SECRET_KEY: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12

    # Accepts a JSON array string from env or a Python list
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000","https://ripe-crate.vercel.app","https://ripe-crate-frontend.vercel.app","https://ripecrate-frontend.vercel.app"]'

    ML_MODELS_DIR: str = "ml/models"

    class Config:
        env_file = ".env"

    def get_cors_origins(self) -> list[str]:
        try:
            origins = json.loads(self.CORS_ORIGINS)
            if isinstance(origins, list):
                return origins
        except (json.JSONDecodeError, TypeError):
            pass
        # Single string fallback
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
