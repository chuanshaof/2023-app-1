"""
config.py
"""

from pydantic_settings import BaseSettings
import base64
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./db.sqlite3"
    SECRET_KEY: str = "YOUR_SECRET_KEY"
    ORIGINS: str = "*"
    ALGORITHM: str = "HS256"
    ANTHROPIC_API_KEY: str = os.environ.get("ANTHROPIC_API_KEY")


settings = Settings()
