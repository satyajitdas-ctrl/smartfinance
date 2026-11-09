from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User
from app.models.transaction import Transaction
from app.models.budget import Budget


def seed_initial_data(db: Session) -> None:
    """
    Ensures that the default demo account, sample transactions,
    and monthly budgets exist so new clones and local runs work out-of-the-box.
    """
    demo_email = "satyajit@example.com"
    demo_user = db.query(User).filter(User.email == demo_email).first()

    if not demo_user:
        demo_user = User(
            email=demo_email,
            hashed_password=get_password_hash("SecurePassword123!"),
            full_name="Satyajit Das",
            is_active=True,
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print(f"[+] Demo user seeded: {demo_email}")

    # Check transactions
    tx_count = db.query(Transaction).filter(Transaction.user_id == demo_user.id).count()
    if tx_count == 0:
        sample_transactions = [
            ("Monthly Tech Company Salary", 125000.0, "income", "Salary", date(2026, 11, 1), False, None),
            ("BHK Apartment Rent Transfer", 18000.0, "expense", "Rent", date(2026, 11, 2), False, None),
            ("Swiggy Gourmet Biryani Feast", 850.0, "expense", "Food", date(2026, 11, 3), False, None),
            ("Uber City Office Commute", 320.0, "expense", "Transportation", date(2026, 11, 4), False, None),
            ("Amazon Electronics Keyboard Upgrade", 4200.0, "expense", "Shopping", date(2026, 11, 5), False, None),
            ("Reliance Jio Fiber Broadband", 999.0, "expense", "Bills", date(2026, 11, 5), False, None),
            ("Zomato Weekend Dinner with Friends", 1450.0, "expense", "Food", date(2026, 11, 6), False, None),
            ("Cult.fit Gym & Fitness Membership", 2200.0, "expense", "Healthcare", date(2026, 11, 6), False, None),
            ("BookMyShow IMAX Movie Tickets", 900.0, "expense", "Entertainment", date(2026, 11, 7), False, None),
            ("Nature's Basket Weekly Groceries", 3650.0, "expense", "Food", date(2026, 11, 7), False, None),
            ("Freelance Technical Writing Stipend", 15000.0, "income", "Salary", date(2026, 11, 8), False, None),
            ("Tata Power Electricity Utility Bill", 2450.0, "expense", "Bills", date(2026, 11, 8), False, None),
            ("Blinkit Quick Groceries & Snacks", 480.0, "expense", "Food", date(2026, 11, 9), False, None),
            ("Luxury Designer Watch Purchase", 85000.0, "expense", "Shopping", date(2026, 11, 9), True, "Extreme spending outlier: 20x higher than typical category average"),
        ]
        for desc, amt, tx_type, cat, tx_date, is_anom, reason in sample_transactions:
            db.add(
                Transaction(
                    user_id=demo_user.id,
                    description=desc,
                    amount=amt,
                    transaction_type=tx_type,
                    category=cat,
                    transaction_date=tx_date,
                    is_flagged_anomaly=is_anom,
                    anomaly_reason=reason,
                )
            )
        db.commit()
        print(f"[+] Seeded {len(sample_transactions)} transactions for demo user.")

    # Check budgets
    now = datetime.now(timezone.utc)
    target_month = now.month
    target_year = now.year
    budget_count = (
        db.query(Budget)
        .filter(
            Budget.user_id == demo_user.id,
            Budget.month == target_month,
            Budget.year == target_year,
        )
        .count()
    )
    if budget_count == 0:
        default_budgets = [
            ("Food", 15000.0),
            ("Rent", 18000.0),
            ("Shopping", 8000.0),
            ("Transportation", 5000.0),
            ("Entertainment", 4000.0),
            ("Bills", 6000.0),
            ("Healthcare", 3000.0),
            ("Education", 5000.0),
        ]
        for cat, limit in default_budgets:
            db.add(
                Budget(
                    user_id=demo_user.id,
                    category=cat,
                    monthly_limit=limit,
                    month=target_month,
                    year=target_year,
                )
            )
        db.commit()
        print(f"[+] Seeded {len(default_budgets)} default budgets for demo user.")
