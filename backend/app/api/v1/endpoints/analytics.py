from datetime import date, timedelta
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/category-breakdown", summary="Get Category Expense Breakdown")
def get_category_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020, le=2100),
):
    """Calculates category-wise expense distribution and percentage shares from the database."""
    today = date.today()
    target_year = year or today.year
    target_month = month or today.month

    # Total expenses for the selected period
    query = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == "expense",
    )

    if month and year:
        start_date = date(target_year, target_month, 1)
        next_month = target_month + 1 if target_month < 12 else 1
        next_year = target_year if target_month < 12 else target_year + 1
        end_date = date(next_year, next_month, 1) - timedelta(days=1)
        query = query.filter(Transaction.transaction_date.between(start_date, end_date))

    results = (
        db.query(
            Transaction.category,
            func.coalesce(func.sum(Transaction.amount), 0.0).label("total_amount"),
            func.count(Transaction.id).label("count"),
        )
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense",
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    total_expense = sum(r.total_amount for r in results)

    breakdown = []
    palette = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6", "#f43f5e", "#14b8a6", "#64748b"]

    for idx, r in enumerate(results):
        pct = round((r.total_amount / total_expense * 100), 1) if total_expense > 0 else 0.0
        breakdown.append({
            "category": r.category,
            "amount": round(r.total_amount, 2),
            "percentage": pct,
            "count": r.count,
            "color": palette[idx % len(palette)],
        })

    return {
        "total_expense": round(total_expense, 2),
        "period": f"{target_year}-{target_month:02d}",
        "categories": breakdown,
    }


@router.get("/monthly-comparison", summary="Month-over-Month Category Comparison")
def get_monthly_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Compares current month category expenditures against previous month records."""
    today = date.today()
    curr_start = date(today.year, today.month, 1)

    # Previous month boundaries
    if today.month == 1:
        prev_start = date(today.year - 1, 12, 1)
        prev_end = date(today.year, 1, 1) - timedelta(days=1)
    else:
        prev_start = date(today.year, today.month - 1, 1)
        prev_end = curr_start - timedelta(days=1)

    # Current month by category
    curr_records = (
        db.query(
            Transaction.category,
            func.coalesce(func.sum(Transaction.amount), 0.0).label("amount"),
        )
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense",
            Transaction.transaction_date >= curr_start,
        )
        .group_by(Transaction.category)
        .all()
    )
    curr_map = {r.category: round(r.amount, 2) for r in curr_records}

    # Previous month by category
    prev_records = (
        db.query(
            Transaction.category,
            func.coalesce(func.sum(Transaction.amount), 0.0).label("amount"),
        )
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense",
            Transaction.transaction_date.between(prev_start, prev_end),
        )
        .group_by(Transaction.category)
        .all()
    )
    prev_map = {r.category: round(r.amount, 2) for r in prev_records}

    all_categories = sorted(list(set(curr_map.keys()) | set(prev_map.keys())))
    comparison = []

    for cat in all_categories:
        c_amt = curr_map.get(cat, 0.0)
        p_amt = prev_map.get(cat, 0.0)
        diff = round(c_amt - p_amt, 2)
        pct_change = round(((c_amt - p_amt) / p_amt * 100), 1) if p_amt > 0 else 100.0 if c_amt > 0 else 0.0

        comparison.append({
            "category": cat,
            "current_month": c_amt,
            "previous_month": p_amt,
            "difference": diff,
            "percentage_change": pct_change,
            "trend": "increased" if diff > 0 else "decreased" if diff < 0 else "neutral",
        })

    return {
        "current_month": today.strftime("%B %Y"),
        "previous_month": prev_start.strftime("%B %Y"),
        "categories": comparison,
    }


@router.get("/cashflow-trends", summary="Historical 6-Month Cash Flow Trends")
def get_cashflow_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calculates income, expense, and savings trends over the last 6 months."""
    today = date.today()
    trends = []

    for i in range(5, -1, -1):
        # Calculate month i months ago
        year = today.year
        month = today.month - i
        while month <= 0:
            month += 12
            year -= 1

        start_d = date(year, month, 1)
        next_m = month + 1 if month < 12 else 1
        next_y = year if month < 12 else year + 1
        end_d = date(next_y, next_m, 1) - timedelta(days=1)

        inc = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(
                Transaction.user_id == current_user.id,
                Transaction.transaction_type == "income",
                Transaction.transaction_date.between(start_d, end_d),
            )
            .scalar()
        )

        exp = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(
                Transaction.user_id == current_user.id,
                Transaction.transaction_type == "expense",
                Transaction.transaction_date.between(start_d, end_d),
            )
            .scalar()
        )

        sav = round(inc - exp, 2) if inc > exp else 0.0

        trends.append({
            "month": start_d.strftime("%b"),
            "year": year,
            "income": round(inc, 2),
            "expenses": round(exp, 2),
            "savings": sav,
        })

    return trends
