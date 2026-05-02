"""
SQLAlchemy database engine, session factory, and Base class.
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.exc import OperationalError
import logging

from app.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

# Aiven (and other cloud MySQL providers) require SSL.
# PyMySQL accepts ssl connect_args to enforce the TLS handshake.
connect_args = {"ssl": {"ssl_disabled": False}} if settings.DB_SSL else {}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping=True,       # reconnect on stale connections
    pool_recycle=3600,        # recycle connections every hour
    pool_size=5,
    max_overflow=10,
    echo=settings.DEBUG,      # log SQL queries in debug mode
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


def get_db():
    """FastAPI dependency: yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Verify the database is reachable. Used in startup health check."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except OperationalError as exc:
        logger.error("Database connection failed: %s", exc)
        return False


def create_tables():
    """Create all tables defined via ORM models (idempotent)."""
    from app import models  # noqa: F401 — import triggers model registration
    Base.metadata.create_all(bind=engine)
    logger.info("All database tables created / verified.")
