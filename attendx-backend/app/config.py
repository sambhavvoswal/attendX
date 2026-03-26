"""
AttendX — Backend Configuration
Loads environment variables using pydantic-settings.
"""
import json
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Firebase
    FIREBASE_SERVICE_ACCOUNT_JSON: str = "{}"

    # Google OAuth2 (for Sheets API — Phase 2)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:7860/api/sheets/oauth-callback"

    # Email (Resend)
    RESEND_API_KEY: str = ""

    # Frontend URL (for CORS + email links)
    FRONTEND_URL: str = "http://localhost:5173"

    @property
    def firebase_credentials(self) -> dict:
        """Parse the service account JSON string into a dict."""
        return json.loads(self.FIREBASE_SERVICE_ACCOUNT_JSON)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
