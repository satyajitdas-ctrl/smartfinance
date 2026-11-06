from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class CategoryPredictRequest(BaseModel):
    description: str = Field(..., min_length=1, max_length=255)


class CategoryPredictResponse(BaseModel):
    description: str
    predicted_category: str
    confidence: float
    model_version: str


class CorrectionCreate(BaseModel):
    description: str
    original_category: str
    corrected_category: str


class AnomalyItem(BaseModel):
    transaction_id: int
    description: str
    amount: float
    category: str
    transaction_date: str
    anomaly_reason: str
    anomaly_score: float
    review_status: str


class ForecastItem(BaseModel):
    category: str
    predicted_amount: float
    historical_avg: float
    trend: str  # 'increasing', 'decreasing', 'stable'


class ForecastResponse(BaseModel):
    forecast_month: str
    total_predicted_expense: float
    current_budget: float
    budget_variance: float
    is_budget_exceeded: bool
    categories: List[ForecastItem]
    disclaimer: str = "Forecasts are algorithmic estimates based on historical spending patterns and should be used as guidance, not guaranteed financial outcomes."
