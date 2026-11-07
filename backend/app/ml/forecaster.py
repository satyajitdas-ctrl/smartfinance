import calendar
from datetime import datetime, date, timedelta, timezone
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd


class ExpenseForecaster:
    """
    ML/Statistical Spending Forecaster.
    Analyzes historical transaction time-series, month-to-date spending velocity,
    and category-level spending trends to project next month's financial commitments
    and compare against user-defined budget thresholds.
    """

    def forecast(
        self,
        transactions: List[Dict[str, Any]],
        budgets: List[Dict[str, Any]],
        reference_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """
        Generates category-level and total monthly spending forecasts.

        :param transactions: List of transaction dicts (must include amount, category, transaction_type, transaction_date)
        :param budgets: List of budget dicts (category, monthly_limit)
        :param reference_date: Optional target date; defaults to current date.
        """
        ref = reference_date or date.today()
        current_year = ref.year
        current_month = ref.month

        # Calculate next month and year
        if current_month == 12:
            next_month = 1
            next_year = current_year + 1
        else:
            next_month = current_month + 1
            next_year = current_year

        next_month_name = f"{calendar.month_name[next_month]} {next_year}"

        # Days calculation for current month burn-rate
        days_in_current_month = calendar.monthrange(current_year, current_month)[1]
        days_passed = max(1, ref.day)
        progress_ratio = days_in_current_month / days_passed

        # Filter expense transactions
        expense_txs = [
            t for t in transactions
            if t.get("transaction_type") == "expense" and t.get("amount", 0) > 0
        ]

        # Budget map: category -> limit
        budget_map = {b["category"]: float(b["monthly_limit"]) for b in budgets if "category" in b}
        total_budget = sum(budget_map.values())

        if not expense_txs:
            # Baseline when no transactions exist yet
            default_categories = ["Food", "Shopping", "Transportation", "Bills", "Entertainment", "Rent"]
            category_forecasts = []
            for cat in default_categories:
                b_limit = budget_map.get(cat, 5000.0)
                category_forecasts.append({
                    "category": cat,
                    "predicted_amount": round(b_limit * 0.85, 2),
                    "historical_avg": round(b_limit * 0.85, 2),
                    "trend": "stable",
                })
            total_pred = sum(c["predicted_amount"] for c in category_forecasts)
            return {
                "forecast_month": next_month_name,
                "total_predicted_expense": round(total_pred, 2),
                "current_budget": round(total_budget or (total_pred * 1.1), 2),
                "budget_variance": round(total_pred - (total_budget or total_pred), 2),
                "is_budget_exceeded": total_pred > total_budget if total_budget > 0 else False,
                "categories": category_forecasts,
                "disclaimer": (
                    "Forecasts are algorithmic estimates based on historical spending velocity "
                    "and should be used for budgeting guidance, not guaranteed financial outcomes."
                ),
            }

        df = pd.DataFrame(expense_txs)
        # Convert date column to datetime
        df["dt"] = pd.to_datetime(df["transaction_date"])
        df["year_month"] = df["dt"].dt.to_period("M")

        # Group by category and month
        cat_monthly = (
            df.groupby(["category", "year_month"])["amount"]
            .sum()
            .reset_index()
        )

        all_categories = sorted(df["category"].unique())
        category_forecasts = []
        total_predicted = 0.0

        for cat in all_categories:
            cat_df = cat_monthly[cat_monthly["category"] == cat].sort_values("year_month")
            monthly_amounts = cat_df["amount"].tolist()

            # Current month actuals if present
            current_period = pd.Period(f"{current_year}-{current_month:02d}", freq="M")
            cur_spent_rows = cat_df[cat_df["year_month"] == current_period]
            cur_spent = float(cur_spent_rows["amount"].iloc[0]) if not cur_spent_rows.empty else 0.0

            # Extrapolate current month if in progress
            cur_month_extrapolated = cur_spent * progress_ratio if cur_spent > 0 else 0.0

            # Time-series forecasting logic:
            # If >= 3 months historical data, calculate weighted moving average + slope
            if len(monthly_amounts) >= 3:
                weights = np.linspace(0.5, 1.0, len(monthly_amounts))
                weights /= weights.sum()
                weighted_avg = float(np.average(monthly_amounts, weights=weights))

                # Simple linear trend slope
                x = np.arange(len(monthly_amounts))
                y = np.array(monthly_amounts)
                slope, _ = np.polyfit(x, y, 1) if len(monthly_amounts) > 1 else (0.0, 0.0)

                predicted = max(200.0, weighted_avg + (slope * 0.5))

                if slope > (weighted_avg * 0.08):
                    trend = "increasing"
                elif slope < -(weighted_avg * 0.08):
                    trend = "decreasing"
                else:
                    trend = "stable"
                hist_avg = float(np.mean(monthly_amounts))
            elif len(monthly_amounts) == 2:
                prev, cur = monthly_amounts[0], monthly_amounts[1]
                predicted = max(200.0, (prev * 0.4) + (cur * 0.6))
                trend = "increasing" if cur > prev * 1.05 else ("decreasing" if cur < prev * 0.95 else "stable")
                hist_avg = float(np.mean(monthly_amounts))
            else:
                # Single month or minimal data
                base_val = monthly_amounts[0] if monthly_amounts else 1000.0
                predicted = cur_month_extrapolated if cur_month_extrapolated > 0 else base_val
                trend = "stable"
                hist_avg = float(base_val)

            # Round predicted amount to 2 decimal places
            predicted = round(float(predicted), 2)
            hist_avg = round(float(hist_avg), 2)
            total_predicted += predicted

            category_forecasts.append({
                "category": cat,
                "predicted_amount": predicted,
                "historical_avg": hist_avg,
                "trend": trend,
            })

        total_predicted = round(total_predicted, 2)
        variance = round(total_predicted - total_budget, 2) if total_budget > 0 else 0.0
        is_exceeded = total_predicted > total_budget if total_budget > 0 else False

        return {
            "forecast_month": next_month_name,
            "total_predicted_expense": total_predicted,
            "current_budget": round(total_budget, 2),
            "budget_variance": variance,
            "is_budget_exceeded": is_exceeded,
            "categories": category_forecasts,
            "disclaimer": (
                "Forecasts are algorithmic estimates based on historical spending patterns and mathematical probability. "
                "They are intended for guidance and financial planning, not guaranteed financial outcomes."
            ),
        }


# Singleton instance
expense_forecaster = ExpenseForecaster()
