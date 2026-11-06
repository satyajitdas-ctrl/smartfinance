from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
import app.models  # Ensures all model tables are registered with Base metadata
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager: handles startup and shutdown logic."""
    # Create all database tables on startup if they do not exist
    Base.metadata.create_all(bind=engine)
    print(f"[*] {settings.PROJECT_NAME} initialized database successfully.")
    yield
    print(f"[*] {settings.PROJECT_NAME} shutting down cleanly.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Personal Finance Assistant API — FinWise AI",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", summary="Root Status Endpoint")
def root():
    return {
        "message": "Welcome to FinWise AI — Intelligent Personal Finance Platform",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
        "version": "1.0.0",
    }
