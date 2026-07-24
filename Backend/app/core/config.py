# app/core/config.py

from dotenv import load_dotenv
import os

load_dotenv()


class Settings:

    DATABASE_URL = os.getenv("DATABASE_URL")

    SECRET_KEY = os.getenv("SECRET_KEY")

    ALGORITHM = os.getenv("ALGORITHM")

    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

    # Email Settings
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    MAIL_FROM_ADDRESS = os.getenv("MAIL_FROM_ADDRESS")
    MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "Employee Management System")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "false").lower() == "true"
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


settings = Settings()
