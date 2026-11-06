from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), nullable=False)  # 'income' or 'expense'
    category = Column(String(50), nullable=False, index=True)
    transaction_date = Column(Date, default=date.today, nullable=False, index=True)

    # Anomaly / Outlier metadata (flagged by Isolation Forest or rules)
    is_flagged_anomaly = Column(Boolean, default=False, nullable=False)
    anomaly_reason = Column(String(255), nullable=True)
    anomaly_score = Column(Float, nullable=True)
    review_status = Column(String(20), default="unreviewed")  # unreviewed, confirmed_ok, reviewed

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="transactions")
