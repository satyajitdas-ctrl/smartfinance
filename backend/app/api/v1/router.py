from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, transactions

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health & Status"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
