
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .config import settings

"""
Connects to the AWS RDS instance using sessionmaker

I'm unsure about this, but could we have refactored out 'create_engine' and 'sessionmaker'?
How will this affect the sessions and overall calls made to the database?

https://docs.sqlalchemy.org/en/20/core/connections.html
Suggests that 'create_engine' and 'sessionmaker' should be scoped globally
"""

def get_db() -> Session:
    rds_engine = create_engine(settings.AWS_RDS_API_KEY)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=rds_engine)

    db = SessionLocal()  # Replace with your session creation logic
    try:
        yield db
    finally:
        db.close()