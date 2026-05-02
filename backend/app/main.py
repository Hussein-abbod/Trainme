"""
TrainMe FastAPI Application — main entry point.
"""
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import check_db_connection, create_tables
from app.routers import (
    applications,
    auth,
    bookmarks,
    companies,
    dashboard,
    internships,
    messages,
    notifications,
    students,
)

# ─── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

settings = get_settings()


# ─── Lifespan ─────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    logger.info("Starting TrainMe API v%s …", settings.APP_VERSION)

    # Verify DB connection
    if check_db_connection():
        logger.info("✅ Database connection OK.")
        create_tables()
    else:
        logger.warning(
            "⚠️  Could not connect to MySQL. "
            "Update DB_* values in .env and restart. "
            "The API will start but all DB operations will fail."
        )

    yield  # app runs here

    logger.info("TrainMe API shutting down.")


# ─── App Factory ──────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "TrainMe — Internship Marketplace API\n\n"
        "Two-sided platform connecting Malaysian university students with verified employers.\n\n"
        "**Authentication:** Use `POST /api/v1/auth/login` to get a Bearer token, "
        "then click **Authorize** (🔒) above and paste it."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── API Routers ──────────────────────────────────────────────

API_PREFIX = "/api/v1"

for router_module in [
    auth,
    students,
    companies,
    internships,
    applications,
    bookmarks,
    messages,
    notifications,
    dashboard,
]:
    app.include_router(router_module.router, prefix=API_PREFIX)


# ─── Health Check ─────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health_check():
    """Liveness probe — returns 200 if the API is running."""
    db_ok = check_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "api": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": "connected" if db_ok else "unreachable",
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs",
        "health": "/health",
    }
