from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class BudgetBase(BaseModel):
    category: str = Field(..., min_length=1, max_length=50)
    monthly_limit: float = Field(..., gt=0)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2020, le=2100)


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    monthly_limit: float = Field(..., gt=0)


class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BudgetStatus(BaseModel):
    id: int
    category: str
    monthly_limit: float
    spent_amount: float
    remaining_amount: float
    percentage_used: float
    month: int
    year: int
    is_exceeded: bool
