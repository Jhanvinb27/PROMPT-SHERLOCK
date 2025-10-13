"""
Configuration settings with environment variables
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Configuration
    APP_NAME: str = "Prompt Detective API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/prompt_detective")
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    PUBLIC_API_BASE_URL: str = os.getenv("PUBLIC_API_BASE_URL", "http://localhost:8000")
    CLOUDINARY_CLOUD_NAME: Optional[str] = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: Optional[str] = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: Optional[str] = os.getenv("CLOUDINARY_API_SECRET")
    
    # API Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "meta-llama/llama-4-maverick-17b-128e-instruct")
    
    # OAuth
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    
    # Email Service (Gmail SMTP)
    EMAIL_PROVIDER: str = os.getenv("EMAIL_PROVIDER", "gmail")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "tryreverseai@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    EMAIL_FROM_ADDRESS: str = os.getenv("EMAIL_FROM_ADDRESS", "tryreverseai@gmail.com")
    EMAIL_FROM_NAME: str = os.getenv("EMAIL_FROM_NAME", "Reverse AI")
    
    # Resend API (HTTP-based, works on Render free tier)
    RESEND_API_KEY: Optional[str] = os.getenv("RESEND_API_KEY")
    
    # Frontend URL (for email links and OAuth redirects)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # CORS
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,https://your-frontend-domain.com"
    )
    
    @property
    def allowed_origins_list(self) -> list[str]:
        """Convert comma-separated origins to list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def cloud_storage_configured(self) -> bool:
        """Return True if Cloudinary credentials are present."""
        return all(
            [
                self.CLOUDINARY_CLOUD_NAME,
                self.CLOUDINARY_API_KEY,
                self.CLOUDINARY_API_SECRET,
            ]
        )
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra fields from .env file

settings = Settings()