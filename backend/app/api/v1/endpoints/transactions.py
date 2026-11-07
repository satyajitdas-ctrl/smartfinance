from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionSummary,
)
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[TransactionResponse], summary="List User Transactions with Filters")
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(None, description="Search description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    transaction_type: Optional[str] = Query(None, pattern="^(income|expense)$", description="Filter by income/expense"),
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Retrieves all transactions strictly isolated to the authenticated user."""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if search:
        query = query.filter(Transaction.description.ilike(f"%{search.strip()}%"))

    if category and category.lower() != "all":
        query = query.filter(Transaction.category.ilike(category.strip()))

    if transaction_type and transaction_type.lower() != "all":
        query = query.filter(Transaction.transaction_type == transaction_type.lower())

    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)

    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)

    transactions = (
        query.order_by(Transaction.transaction_date.desc(), Transaction.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return transactions


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED, summary="Create Transaction")
def create_transaction(
    tx_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Creates a new transaction for the current user and checks for initial anomalies."""
    # Baseline statistical anomaly check: flag if food/dining > ₹8,000 or single expense > ₹30,000
    is_anomaly = False
    anomaly_reason = None
    anomaly_score = None

    if tx_in.transaction_type == "expense":
        if tx_in.category.lower() == "food" and tx_in.amount > 6000:
            is_anomaly = True
            anomaly_reason = f"High food expenditure (₹{tx_in.amount:,.2f}) significantly exceeds typical dining threshold."
            anomaly_score = round(min(0.95, tx_in.amount / 10000), 2)
        elif tx_in.amount > 40000 and tx_in.category.lower() not in ["rent", "investments", "education"]:
            is_anomaly = True
            anomaly_reason = f"Unusually large discretionary expenditure of ₹{tx_in.amount:,.2f} recorded."
            anomaly_score = 0.85

    db_tx = Transaction(
        user_id=current_user.id,
        description=tx_in.description.strip(),
        amount=round(float(tx_in.amount), 2),
        transaction_type=tx_in.transaction_type.lower(),
        category=tx_in.category.strip(),
        transaction_date=tx_in.transaction_date,
        is_flagged_anomaly=is_anomaly,
        anomaly_reason=anomaly_reason,
        anomaly_score=anomaly_score,
        review_status="unreviewed" if is_anomaly else "confirmed_ok",
    )
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    return db_tx


@router.get("/summary", response_model=TransactionSummary, summary="Get Financial Summary Telemetry")
def get_transaction_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calculates live totals, net balance, savings rate, and monthly velocity directly from database records."""
    today = date.today()
    start_of_month = date(today.year, today.month, 1)

    # All-time / cumulative calculations
    income_sum = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "income",
        )
        .scalar()
    )

    expense_sum = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense",
        )
        .scalar()
    )

    # Current month's expenses
    monthly_expense = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense",
            Transaction.transaction_date >= start_of_month,
        )
        .scalar()
    )

    count = (
        db.query(func.count(Transaction.id))
        .filter(Transaction.user_id == current_user.id)
        .scalar()
    )

    balance = round(income_sum - expense_sum, 2)
    savings = round(balance if balance > 0 else 0.0, 2)
    savings_rate = round((savings / income_sum * 100), 1) if income_sum > 0 else 0.0

    return TransactionSummary(
        total_income=round(income_sum, 2),
        total_expenses=round(expense_sum, 2),
        current_balance=balance,
        total_savings=savings,
        savings_rate_percentage=savings_rate,
        monthly_spending=round(monthly_expense, 2),
        transactions_count=count,
    )


@router.get("/{tx_id}", response_model=TransactionResponse, summary="Get Single Transaction")
def get_transaction_by_id(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetches single transaction ensuring strict user ownership."""
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == tx_id, Transaction.user_id == current_user.id)
        .first()
    )
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID {tx_id} not found.",
        )
    return tx


@router.put("/{tx_id}", response_model=TransactionResponse, summary="Update Transaction")
def update_transaction(
    tx_id: int,
    tx_update: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Updates an existing transaction owned by the user."""
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == tx_id, Transaction.user_id == current_user.id)
        .first()
    )
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID {tx_id} not found.",
        )

    if tx_update.description is not None:
        tx.description = tx_update.description.strip()
    if tx_update.amount is not None:
        tx.amount = round(float(tx_update.amount), 2)
    if tx_update.transaction_type is not None:
        tx.transaction_type = tx_update.transaction_type.lower()
    if tx_update.category is not None:
        tx.category = tx_update.category.strip()
    if tx_update.transaction_date is not None:
        tx.transaction_date = tx_update.transaction_date
    if tx_update.review_status is not None:
        tx.review_status = tx_update.review_status

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{tx_id}", summary="Delete Transaction")
def delete_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes a transaction owned by the user."""
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == tx_id, Transaction.user_id == current_user.id)
        .first()
    )
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID {tx_id} not found.",
        )

    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully", "id": tx_id}


@router.post("/seed", response_model=List[TransactionResponse], summary="Seed Realistic User Transactions")
def seed_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Populates user account with realistic baseline transactions if none exist."""
    existing_count = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .count()
    )
    if existing_count > 0:
        return (
            db.query(Transaction)
            .filter(Transaction.user_id == current_user.id)
            .order_by(Transaction.transaction_date.desc())
            .all()
        )

    sample_data = [
        ("Monthly Tech Company Salary", 125000.0, "income", "Salary", date(2026, 11, 1), False, None),
        ("BHK Apartment Rent Transfer", 18000.0, "expense", "Rent", date(2026, 11, 2), False, None),
        ("Swiggy Gourmet Biryani Feast", 850.0, "expense", "Food", date(2026, 11, 3), False, None),
        ("Uber City Office Commute", 320.0, "expense", "Transportation", date(2026, 11, 4), False, None),
        ("Amazon Electronics Keyboard Upgrade", 4200.0, "expense", "Shopping", date(2026, 11, 5), False, None),
        ("Reliance Jio Fiber Broadband", 999.0, "expense", "Bills", date(2026, 11, 5), False, None),
        ("Zomato Dinner with Friends", 1450.0, "expense", "Food", date(2026, 11, 6), False, None),
        ("Metro Smart Card Recharge", 500.0, "expense", "Transportation", date(2026, 11, 6), False, None),
        ("Apollo Pharmacy Medicines", 620.0, "expense", "Healthcare", date(2026, 11, 7), False, None),
        ("Blinkit Quick Grocery Order", 1120.0, "expense", "Food", date(2026, 11, 7), False, None),
        ("Annual Tech Conference Registration", 14500.0, "expense", "Education", date(2026, 11, 7), True, "Expense is 4.5x above standard education threshold."),
    ]

    created = []
    for desc, amt, t_type, cat, d, anom, anom_reason in sample_data:
        tx = Transaction(
            user_id=current_user.id,
            description=desc,
            amount=amt,
            transaction_type=t_type,
            category=cat,
            transaction_date=d,
            is_flagged_anomaly=anom,
            anomaly_reason=anom_reason,
            anomaly_score=0.82 if anom else None,
            review_status="unreviewed" if anom else "confirmed_ok",
        )
        db.add(tx)
        created.append(tx)

    db.commit()
    for tx in created:
        db.refresh(tx)

    return created
