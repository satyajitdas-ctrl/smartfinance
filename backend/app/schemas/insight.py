from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AIInsightResponse(BaseModel):
    id: int
    user_id: int
    insight_type: str
    title: str
    message: str
    severity: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
