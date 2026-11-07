from datetime import datetime, timezone, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetStatus

router = APIRouter()


@router.get("/", response_model=List[BudgetResponse])
def get_budgets(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all category budgets configured by the authenticated user."""
    query = db.query(Budget).filter(Budget.user_id == current_user.id)
    if month is not None:
        query = query.filter(Budget.month == month)
    if year is not None:
        query = query.filter(Budget.year == year)
    return query.all()


@router.get("/status")
def get_budgets_status(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Computes real-time budget utilization per category.
    Cross-references each budget limit against actual expense transactions
    recorded for that category in the given month and year.
    """
    now = datetime.now(timezone.utc)
    target_month = month if month is not None else now.month
    target_year = year if year is not None else now.year

    # 1. Fetch user budgets for target month and year
    budgets = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == target_month,
            Budget.year == target_year,
        )
        .all()
    )

    # 2. Fetch sum of actual expenses per category for target month and year
    expense_sums = (
        db.query(
            Transaction.category,
            func.coalesce(func.sum(Transaction.amount), 0.0).label("total_spent"),
        )
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense",
            extract("month", Transaction.transaction_date) == target_month,
            extract("year", Transaction.transaction_date) == target_year,
        )
        .group_by(Transaction.category)
        .all()
    )

    spent_dict = {row.category: float(row.total_spent) for row in expense_sums}

    category_statuses: List[dict] = []
    total_budget = 0.0
    total_spent = 0.0

    for b in budgets:
        spent = spent_dict.get(b.category, 0.0)
        remaining = max(0.0, b.monthly_limit - spent)
        pct = round((spent / b.monthly_limit) * 100, 1) if b.monthly_limit > 0 else 0.0

        total_budget += b.monthly_limit
        total_spent += spent

        category_statuses.append({
            "id": b.id,
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "spent_amount": spent,
            "remaining_amount": remaining,
            "percentage_used": pct,
            "month": b.month,
            "year": b.year,
            "is_exceeded": spent > b.monthly_limit,
        })

    overall_pct = round((total_spent / total_budget) * 100, 1) if total_budget > 0 else 0.0

    return {
        "month": target_month,
        "year": target_year,
        "total_budget": total_budget,
        "total_spent": total_spent,
        "overall_percentage_used": overall_pct,
        "is_overall_exceeded": total_spent > total_budget,
        "budgets": category_statuses,
    }


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creates or updates a monthly budget for a specific category.
    If a budget already exists for the user, category, month, and year, its limit is updated.
    """
    existing = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.category == payload.category,
            Budget.month == payload.month,
            Budget.year == payload.year,
        )
        .first()
    )

    if existing:
        existing.monthly_limit = payload.monthly_limit
        db.commit()
        db.refresh(existing)
        return existing

    new_budget = Budget(
        user_id=current_user.id,
        category=payload.category,
        monthly_limit=payload.monthly_limit,
        month=payload.month,
        year=payload.year,
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    payload: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing budget limit by ID."""
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")

    budget.monthly_limit = payload.monthly_limit
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a budget configuration."""
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")

    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully", "id": budget_id}


@router.post("/seed-defaults", response_model=List[BudgetResponse])
def seed_default_budgets(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Seed standard realistic Indian monthly budget allocations for easy testing."""
    now = datetime.now(timezone.utc)
    target_month = month if month is not None else now.month
    target_year = year if year is not None else now.year

    defaults = [
        ("Food", 15000.0),
        ("Rent", 18000.0),
        ("Shopping", 8000.0),
        ("Transportation", 5000.0),
        ("Entertainment", 4000.0),
        ("Bills", 6000.0),
        ("Healthcare", 3000.0),
        ("Education", 5000.0),
    ]

    created = []
    for category, limit in defaults:
        existing = (
            db.query(Budget)
            .filter(
                Budget.user_id == current_user.id,
                Budget.category == category,
                Budget.month == target_month,
                Budget.year == target_year,
            )
            .first()
        )
        if not existing:
            b = Budget(
                user_id=current_user.id,
                category=category,
                monthly_limit=limit,
                month=target_month,
                year=target_year,
            )
            db.add(b)
            created.append(b)

    db.commit()
    for b in created:
        db.refresh(b)

    # Return all user budgets for this month/year
    return (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == target_month,
            Budget.year == target_year,
        )
        .all()
    )
