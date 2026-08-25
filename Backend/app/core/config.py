# app/core/config.py

from dotenv import load_dotenv
import os

load_dotenv()


class Settings:

    _raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    if _raw_db_url and _raw_db_url.startswith("postgres://"):
        _raw_db_url = _raw_db_url.replace("postgres://", "postgresql://", 1)

    DATABASE_URL = _raw_db_url

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

    ALGORITHM = os.getenv("ALGORITHM", "HS256")

    _expire = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    try:
        ACCESS_TOKEN_EXPIRE_MINUTES = int(_expire)
    except (ValueError, TypeError):
        ACCESS_TOKEN_EXPIRE_MINUTES = 1440

    # Email Settings
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    _smtp_port = os.getenv("SMTP_PORT", "587")
    try:
        SMTP_PORT = int(_smtp_port)
    except (ValueError, TypeError):
        SMTP_PORT = 587

    SMTP_USERNAME = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    MAIL_FROM_ADDRESS = os.getenv("MAIL_FROM_ADDRESS")
    MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "Employee Management System")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "false").lower() == "true"
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


settings = Settings()

