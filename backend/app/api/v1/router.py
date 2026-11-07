from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, transactions, analytics, ml

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health & Status"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(ml.router, prefix="/ml", tags=["Machine Learning"])
