
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .config import settings


def get_db() -> Session:
    rds_engine = create_engine(settings.AWS_RDS_API_KEY)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=rds_engine)

    db = SessionLocal()  # Replace with your session creation logic
    try:
        yield db
    finally:
        db.close()