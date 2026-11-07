import csv
import io
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.ml.categorizer import categorizer
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/export-csv", summary="Export User Transactions as CSV")
def export_transactions_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generates a downloadable CSV archive containing all authenticated user transactions."""
    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    # Write Header
    writer.writerow(["Date", "Description", "Amount", "Type", "Category", "AnomalyFlag", "ReviewStatus"])

    for t in transactions:
        writer.writerow([
            t.transaction_date.isoformat(),
            t.description,
            f"{t.amount:.2f}",
            t.transaction_type,
            t.category,
            "YES" if t.is_flagged_anomaly else "NO",
            t.review_status or "unreviewed",
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="finwise_transactions.csv"'},
    )


@router.get("/sample-csv", summary="Download Sample CSV Template")
def download_sample_csv():
    """Provides a sample CSV template for users to format their statements."""
    sample_content = (
        "Date,Description,Amount,Type,Category\n"
        "2026-11-01,Tech Salary Deposit,125000,income,Salary\n"
        "2026-11-02,Apartment Rent,18000,expense,Rent\n"
        "2026-11-03,Swiggy Lunch Order,450,expense,Food\n"
        "2026-11-04,Uber Office Ride,280,expense,Transportation\n"
        "2026-11-05,Amazon Electronics Purchase,3200,expense,Shopping\n"
        "2026-11-06,Electricity Bill Payment,1850,expense,Bills\n"
    )
    return Response(
        content=sample_content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="finwise_sample_transactions.csv"'},
    )


@router.post("/import-csv", summary="Import and Validate Transactions from CSV")
async def import_transactions_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Parses, validates, and imports transactions from a CSV file.
    - Validates columns (Date, Description, Amount, Type, Category).
    - Detects and skips duplicate transactions already present in database.
    - Uses ML categorizer to infer category if empty or set to Other.
    - Returns structured summary of imported rows, skipped duplicates, and validation errors.
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a standard .csv file.",
        )

    content_bytes = await file.read()
    try:
        content_text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        content_text = content_bytes.decode("latin-1")

    reader = csv.reader(io.StringIO(content_text))
    rows = list(reader)

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded CSV file is empty.",
        )

    # Clean headers (strip whitespace and lowercase)
    header = [h.strip().lower() for h in rows[0]]
    expected = ["date", "description", "amount"]
    for req in expected:
        if req not in header:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required CSV column '{req.capitalize()}'. Expected columns: Date, Description, Amount, Type, Category",
            )

    date_idx = header.index("date")
    desc_idx = header.index("description")
    amt_idx = header.index("amount")
    type_idx = header.index("type") if "type" in header else -1
    cat_idx = header.index("category") if "category" in header else -1

    imported: List[Transaction] = []
    duplicates_count = 0
    errors: List[str] = []

    # Cache existing transactions to prevent duplicates
    existing_records = {
        (
            t.transaction_date.isoformat(),
            t.description.strip().lower(),
            round(t.amount, 2),
        )
        for t in db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    }

    for row_num, row in enumerate(rows[1:], start=2):
        if not row or all(c.strip() == "" for c in row):
            continue

        if len(row) <= max(date_idx, desc_idx, amt_idx):
            errors.append(f"Row {row_num}: Incomplete data fields.")
            continue

        raw_date = row[date_idx].strip()
        raw_desc = row[desc_idx].strip()
        raw_amt = row[amt_idx].strip()
        raw_type = row[type_idx].strip().lower() if type_idx != -1 and len(row) > type_idx else "expense"
        raw_cat = row[cat_idx].strip() if cat_idx != -1 and len(row) > cat_idx else ""

        # Validate Date
        parsed_date = None
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"):
            try:
                parsed_date = datetime.strptime(raw_date, fmt).date()
                break
            except ValueError:
                continue

        if not parsed_date:
            errors.append(f"Row {row_num}: Invalid date format '{raw_date}'. Please use YYYY-MM-DD.")
            continue

        # Validate Amount
        try:
            amount = float(raw_amt.replace(",", "").replace("₹", "").replace("$", ""))
            if amount <= 0:
                errors.append(f"Row {row_num}: Amount must be positive ({raw_amt}).")
                continue
        except ValueError:
            errors.append(f"Row {row_num}: Non-numeric amount '{raw_amt}'.")
            continue

        # Validate Type
        if raw_type not in ("income", "expense"):
            raw_type = "expense"

        # Auto-infer Category with ML if empty or "Other"
        if not raw_cat or raw_cat.lower() in ("other", "general", ""):
            if raw_type == "income":
                category = "Salary"
            else:
                pred = categorizer.predict(raw_desc)
                category = pred["predicted_category"]
        else:
            category = raw_cat.capitalize()

        # Duplicate Check
        key = (parsed_date.isoformat(), raw_desc.lower(), round(amount, 2))
        if key in existing_records:
            duplicates_count += 1
            continue

        tx = Transaction(
            user_id=current_user.id,
            description=raw_desc,
            amount=amount,
            transaction_type=raw_type,
            category=category,
            transaction_date=parsed_date,
        )
        db.add(tx)
        imported.append(tx)
        existing_records.add(key)

    if imported:
        db.commit()

    return {
        "message": f"Successfully processed CSV: {len(imported)} transactions imported, {duplicates_count} duplicates skipped.",
        "total_rows_evaluated": len(rows) - 1,
        "imported_count": len(imported),
        "duplicates_skipped": duplicates_count,
        "errors_count": len(errors),
        "errors": errors[:10],
    }
