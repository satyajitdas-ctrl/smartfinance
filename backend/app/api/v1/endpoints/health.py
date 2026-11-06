from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings

router = APIRouter()


@router.get("/health", summary="System Health and Status Check")
def health_check(db: Session = Depends(get_db)):
    """Verifies that FastAPI server and database connection are both healthy."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "app_name": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "default_currency": "INR",
        "currency_symbol": "₹",
        "llm_provider": settings.LLM_PROVIDER,
        "version": "1.0.0",
    }
