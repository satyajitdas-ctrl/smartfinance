from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.category_correction import CategoryCorrection
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.user import User
from app.schemas.ml import (
    CategoryPredictRequest,
    CategoryPredictResponse,
    CorrectionCreate,
    AnomalyItem,
    ForecastResponse,
)
from app.ml.categorizer import categorizer
from app.ml.anomaly_detector import anomaly_detector
from app.ml.forecaster import expense_forecaster
from app.api.deps import get_current_user

router = APIRouter()


# ----------------------------------------------------
# 1. NLP / TF-IDF Categorizer Endpoints
# ----------------------------------------------------

@router.post("/predict-category", response_model=CategoryPredictResponse, summary="Predict Expense Category with ML")
def predict_category(payload: CategoryPredictRequest):
    """Predicts expense category using trained TF-IDF + Logistic Regression model."""
    result = categorizer.predict(payload.description)
    return CategoryPredictResponse(**result)


@router.post("/correct-category", summary="Submit Category Correction for Active Learning")
def correct_category(
    correction: CorrectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Stores user corrections to improve future machine learning models."""
    db_correction = CategoryCorrection(
        user_id=current_user.id,
        description=correction.description.strip(),
        original_category=correction.original_category.strip(),
        corrected_category=correction.corrected_category.strip(),
    )
    db.add(db_correction)
    db.commit()
    db.refresh(db_correction)

    return {
        "message": "Category correction logged successfully for future model retraining.",
        "correction_id": db_correction.id,
        "description": db_correction.description,
        "corrected_category": db_correction.corrected_category,
    }


@router.get("/model-info", summary="Get Categorizer Model Telemetry")
def get_model_info():
    """Returns metadata regarding active Scikit-learn model."""
    return {
        "model_name": "FinWise Expense Categorizer",
        "algorithm": "TF-IDF Vectorizer + Multinomial Logistic Regression",
        "version": categorizer.version,
        "categories_supported": categorizer.classes,
        "status": "active",
    }


# ----------------------------------------------------
# 2. Isolation Forest Anomaly Detection Endpoints
# ----------------------------------------------------

@router.get("/anomalies", response_model=List[AnomalyItem], summary="Get Flagged Transaction Anomalies")
def get_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns unusual transactions flagged by the Isolation Forest engine or statistical rules.
    If no anomalies are flagged yet, runs an on-the-fly detection scan.
    """
    # 1. Check if user has already flagged transactions
    flagged = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.is_flagged_anomaly == True,
        )
        .order_by(Transaction.transaction_date.desc())
        .all()
    )

    if not flagged:
        # Trigger an automatic scan across user transactions
        scan_and_update_anomalies(db, current_user.id)
        flagged = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == current_user.id,
                Transaction.is_flagged_anomaly == True,
            )
            .order_by(Transaction.transaction_date.desc())
            .all()
        )

    return [
        AnomalyItem(
            transaction_id=t.id,
            description=t.description,
            amount=t.amount,
            category=t.category,
            transaction_date=t.transaction_date.isoformat(),
            anomaly_reason=t.anomaly_reason or "Statistically unusual expenditure detected",
            anomaly_score=t.anomaly_score or 0.85,
            review_status=t.review_status or "unreviewed",
        )
        for t in flagged
    ]


@router.post("/anomalies/detect", summary="Run Isolation Forest Anomaly Scan")
def trigger_anomaly_detection(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Runs Scikit-learn Isolation Forest and category Z-score anomaly detector
    on all user expense transactions, updating transaction flags and returning results.
    """
    flagged_list = scan_and_update_anomalies(db, current_user.id)
    return {
        "message": f"Anomaly detection completed. Flagged {len(flagged_list)} unusual transactions for review.",
        "anomalies_detected": len(flagged_list),
        "anomalies": flagged_list,
    }


@router.post("/anomalies/{transaction_id}/review", summary="Review Flagged Anomaly")
def review_anomaly(
    transaction_id: int,
    status_choice: str = "confirmed_ok",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Marks a flagged transaction as reviewed (e.g. 'confirmed_ok' or 'reviewed')."""
    tx = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
        .first()
    )
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    tx.review_status = status_choice
    db.commit()
    db.refresh(tx)

    return {
        "message": f"Transaction {transaction_id} marked as {status_choice}.",
        "transaction_id": tx.id,
        "review_status": tx.review_status,
    }


def scan_and_update_anomalies(db: Session, user_id: int) -> List[dict]:
    """Helper function to run IsolationForest on user expenses and persist tags to DB."""
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
        )
        .all()
    )

    if not transactions:
        return []

    tx_dicts = [
        {
            "id": t.id,
            "description": t.description,
            "amount": t.amount,
            "category": t.category,
            "transaction_date": t.transaction_date.isoformat(),
            "transaction_type": t.transaction_type,
            "review_status": t.review_status,
        }
        for t in transactions
    ]

    detected = anomaly_detector.detect_anomalies(tx_dicts)
    detected_ids = {d["transaction_id"]: d for d in detected}

    # Update database records
    for t in transactions:
        if t.id in detected_ids:
            anom_info = detected_ids[t.id]
            t.is_flagged_anomaly = True
            t.anomaly_reason = anom_info["anomaly_reason"]
            t.anomaly_score = anom_info["anomaly_score"]
            if not t.review_status:
                t.review_status = "unreviewed"
        else:
            # If previously flagged but no longer an anomaly
            if t.review_status != "confirmed_ok":
                t.is_flagged_anomaly = False
                t.anomaly_reason = None
                t.anomaly_score = None

    db.commit()
    return detected


# ----------------------------------------------------
# 3. Monthly Budget & Expense Forecaster Endpoints
# ----------------------------------------------------

@router.get("/forecast", response_model=ForecastResponse, summary="Predict Monthly Expenses with ML")
def get_expense_forecast(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Calculates time-series moving-window regression and category-level spending projections
    for the upcoming month, comparing forecasts against the user's allocated category budgets.
    """
    # 1. Fetch user transactions
    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .all()
    )
    tx_dicts = [
        {
            "amount": t.amount,
            "category": t.category,
            "transaction_type": t.transaction_type,
            "transaction_date": t.transaction_date.isoformat(),
        }
        for t in transactions
    ]

    # 2. Fetch user budgets
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == current_user.id)
        .all()
    )
    b_dicts = [
        {
            "category": b.category,
            "monthly_limit": b.monthly_limit,
        }
        for b in budgets
    ]

    forecast_data = expense_forecaster.forecast(tx_dicts, b_dicts)
    return ForecastResponse(**forecast_data)
