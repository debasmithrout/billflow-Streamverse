import os
from dotenv import load_dotenv

# Find and load the root .env file relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dotenv_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path)

# Database Configuration
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "DEBU1234")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "billflow_db")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:DEBU1234@localhost:5432/billflow_db")

# Security & JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "billflow_secret_key_change_this_in_production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Celery & Redis Configuration
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
CELERY_TIMEZONE = os.getenv("CELERY_TIMEZONE", "Asia/Kolkata")

# Gmail SMTP Configuration
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "your_email@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your_app_password")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

# Application Configuration
APP_NAME = os.getenv("APP_NAME", "StreamVerse")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Hardened Business Rules Configs
REFUND_WINDOW_DAYS = int(os.getenv("REFUND_WINDOW_DAYS", "7"))
WEBHOOK_RETRY_LIMIT = int(os.getenv("WEBHOOK_RETRY_LIMIT", "3"))
WEBHOOK_RETRY_DELAY_SECONDS = int(os.getenv("WEBHOOK_RETRY_DELAY_SECONDS", "60"))
CANCELLATION_GRACE_PERIOD_DAYS = int(os.getenv("CANCELLATION_GRACE_PERIOD_DAYS", "0"))
WEBHOOK_ENDPOINT_URL = os.getenv("WEBHOOK_ENDPOINT_URL", "http://localhost:8000/webhook-receiver")
