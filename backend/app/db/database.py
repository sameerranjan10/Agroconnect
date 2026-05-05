"""
AgroConnect - Database Configuration
SQLAlchemy async engine + session factory.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


# Synchronous engine (psycopg2)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,          # test connections before use
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,         # log SQL in debug mode
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class shared by all ORM models."""
    pass


def get_db():
    """
    FastAPI dependency: yields a DB session and ensures it is closed
    after the request completes (or on error).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
