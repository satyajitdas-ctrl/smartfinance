from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.category_correction import CategoryCorrection
from app.models.user import User
from app.schemas.ml import CategoryPredictRequest, CategoryPredictResponse, CorrectionCreate
from app.ml.categorizer import categorizer
from app.api.deps import get_current_user

router = APIRouter()


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
