from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class TransactionBase(BaseModel):
    description: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0)
    transaction_type: str = Field(..., pattern="^(income|expense)$")
    category: str = Field(..., min_length=1, max_length=50)
    transaction_date: date = Field(default_factory=date.today)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    transaction_type: Optional[str] = Field(None, pattern="^(income|expense)$")
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    transaction_date: Optional[date] = None
    review_status: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    is_flagged_anomaly: bool = False
    anomaly_reason: Optional[str] = None
    anomaly_score: Optional[float] = None
    review_status: str = "unreviewed"
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionSummary(BaseModel):
    total_income: float
    total_expenses: float
    current_balance: float
    total_savings: float
    savings_rate_percentage: float
    monthly_spending: float
    transactions_count: int
