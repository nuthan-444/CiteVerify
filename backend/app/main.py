"""Main FastAPI application entry point for CiteVerify."""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine
from app.models import Base
from app.routers import auth, documents, claims, citations, verification, reports

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("citeverify")


# Create tables and directories immediately on import for both server and test contexts
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events: create tables and upload dir on startup."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized.")

    # Ensure uploads directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info(f"Upload directory verified at {settings.UPLOAD_DIR}")

    yield

    logger.info("CiteVerify backend shutting down.")


app = FastAPI(
    title="CiteVerify API",
    description="AI-Powered Citation & Claim Verification Platform for Academic Papers",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
origins = settings.cors_origins_list
if "*" not in origins and "http://localhost:5173" not in origins:
    origins.append("http://localhost:5173")
if "http://127.0.0.1:5173" not in origins:
    origins.append("http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["health"])
def health_check():
    """Health check endpoint to verify backend status and connectivity."""
    return {
        "status": "ok",
        "service": "CiteVerify Backend",
        "database": "connected",
        "version": "1.0.0",
    }


# Include all API routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(claims.router)
app.include_router(citations.router)
app.include_router(verification.router)
app.include_router(reports.router)
