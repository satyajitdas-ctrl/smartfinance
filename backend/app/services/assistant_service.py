import calendar
from datetime import datetime, date, timezone
from typing import Dict, Any, List, Optional, Tuple
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.user import User
from app.core.config import settings

Tuple_Response = Tuple[str, str]


class AssistantService:
    """
    AI Financial Assistant Service.
    Calculates deterministic ground-truth financial figures from user ledger records
    and synthesizes context-grounded responses without financial hallucination.
    """

    def calculate_user_financial_context(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Calculates exact deterministic metrics from the user's database records."""
        now = datetime.now(timezone.utc)
        current_month = now.month
        current_year = now.year

        # Determine previous month
        if current_month == 1:
            prev_month = 12
            prev_year = current_year - 1
        else:
            prev_month = current_month - 1
            prev_year = current_year

        month_name = calendar.month_name[current_month]
        prev_month_name = calendar.month_name[prev_month]

        # 1. Current Month Expenses & Incomes
        cur_expenses_sum = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                extract("month", Transaction.transaction_date) == current_month,
                extract("year", Transaction.transaction_date) == current_year,
            )
            .scalar()
        ) or 0.0

        cur_income_sum = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "income",
                extract("month", Transaction.transaction_date) == current_month,
                extract("year", Transaction.transaction_date) == current_year,
            )
            .scalar()
        ) or 0.0

        # 2. Previous Month Expenses
        prev_expenses_sum = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                extract("month", Transaction.transaction_date) == prev_month,
                extract("year", Transaction.transaction_date) == prev_year,
            )
            .scalar()
        ) or 0.0

        # 3. Current Month Category Breakdown
        cat_rows = (
            db.query(
                Transaction.category,
                func.sum(Transaction.amount).label("total_amt"),
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                extract("month", Transaction.transaction_date) == current_month,
                extract("year", Transaction.transaction_date) == current_year,
            )
            .group_by(Transaction.category)
            .order_by(func.sum(Transaction.amount).desc())
            .all()
        )

        categories = [
            {"category": r.category, "amount": float(r.total_amt)}
            for r in cat_rows
        ]
        top_cat = categories[0] if categories else None

        # 4. Budgets
        budgets = (
            db.query(Budget)
            .filter(
                Budget.user_id == user_id,
                Budget.month == current_month,
                Budget.year == current_year,
            )
            .all()
        )
        total_budget_limit = sum(b.monthly_limit for b in budgets)

        # 5. Flagged Anomalies
        flagged_count = (
            db.query(func.count(Transaction.id))
            .filter(
                Transaction.user_id == user_id,
                Transaction.is_flagged_anomaly == True,
            )
            .scalar()
        ) or 0

        savings = cur_income_sum - cur_expenses_sum
        savings_rate = round((savings / cur_income_sum * 100), 1) if cur_income_sum > 0 else 0.0
        mom_diff = cur_expenses_sum - prev_expenses_sum
        mom_pct = round((mom_diff / prev_expenses_sum * 100), 1) if prev_expenses_sum > 0 else 0.0

        return {
            "current_month": month_name,
            "current_year": current_year,
            "previous_month": prev_month_name,
            "current_expenses": float(cur_expenses_sum),
            "current_income": float(cur_income_sum),
            "current_savings": float(savings),
            "savings_rate": savings_rate,
            "previous_expenses": float(prev_expenses_sum),
            "mom_diff": float(mom_diff),
            "mom_pct": mom_pct,
            "categories": categories,
            "top_category": top_cat,
            "total_budget": float(total_budget_limit),
            "budget_exceeded": cur_expenses_sum > total_budget_limit if total_budget_limit > 0 else False,
            "flagged_anomalies_count": int(flagged_count),
        }

    def generate_grounded_response(self, user_msg: str, ctx: Dict[str, Any]) -> Tuple_Response:
        """
        Synthesizes a factually grounded answer matching the user query with
        the exact computed financial figures.
        """
        msg = user_msg.lower().strip()
        month = ctx["current_month"]
        exp = ctx["current_expenses"]
        inc = ctx["current_income"]
        sav = ctx["current_savings"]
        sav_rate = ctx["savings_rate"]
        top = ctx["top_category"]
        prev_exp = ctx["previous_expenses"]
        bgt = ctx["total_budget"]

        # Intent: Biggest spending category
        if any(w in msg for w in ["biggest", "highest", "top category", "most", "largest", "maximum"]):
            if top:
                pct = round((top["amount"] / exp * 100), 1) if exp > 0 else 0.0
                return (
                    f"Your biggest spending category in {month} is **{top['category']}** "
                    f"with total expenses of ₹{top['amount']:,.2f} ({pct}% of your total monthly expenditures).",
                    "top_category",
                )
            return (
                f"You do not have any recorded expenses for {month} yet.",
                "top_category",
            )

        # Intent: Total spending this month
        if any(w in msg for w in ["spend", "expense", "spent", "spending"]):
            if "last month" in msg or "previous" in msg or "compare" in msg:
                trend_dir = "higher" if ctx["mom_diff"] > 0 else "lower"
                return (
                    f"In {ctx['previous_month']}, you spent ₹{prev_exp:,.2f}. "
                    f"So far in {month}, you have spent ₹{exp:,.2f}. "
                    f"Your spending is {abs(ctx['mom_pct'])}% {trend_dir} than last month.",
                    "compare_monthly_spending",
                )
            return (
                f"Your total spending for {month} {ctx['current_year']} is ₹{exp:,.2f} "
                f"across {len(ctx['categories'])} expense categories.",
                "current_spending",
            )

        # Intent: Savings
        if any(w in msg for w in ["save", "saving", "savings", "balance", "left over"]):
            if inc > 0:
                return (
                    f"In {month}, you earned ₹{inc:,.2f} and spent ₹{exp:,.2f}, resulting in net savings "
                    f"of ₹{sav:,.2f} (a savings rate of {sav_rate}%).",
                    "savings_summary",
                )
            return (
                f"Your net balance for {month} is ₹{sav:,.2f} (Total Income: ₹{inc:,.2f}, Total Expenses: ₹{exp:,.2f}).",
                "savings_summary",
            )

        # Intent: Budget limits and predictions
        if any(w in msg for w in ["budget", "exceed", "limit", "over budget"]):
            if bgt > 0:
                if exp > bgt:
                    over = exp - bgt
                    return (
                        f"⚠️ Yes, your expenses (₹{exp:,.2f}) have exceeded your total monthly budget "
                        f"threshold of ₹{bgt:,.2f} by ₹{over:,.2f}.",
                        "budget_status",
                    )
                remaining = bgt - exp
                pct = round((exp / bgt * 100), 1)
                return (
                    f"✅ You are currently within budget! You have utilized {pct}% of your ₹{bgt:,.2f} limit, "
                    f"with ₹{remaining:,.2f} remaining for the rest of {month}.",
                    "budget_status",
                )
            return (
                f"You have spent ₹{exp:,.2f} in {month}, but you haven't set any budget limits yet. "
                f"Head over to the Budgets page to configure monthly thresholds!",
                "budget_status",
            )

        # Intent: Suggestions to reduce spending
        if any(w in msg for w in ["reduce", "cut", "save more", "suggestion", "advice", "tip"]):
            advice_lines = []
            if top:
                advice_lines.append(
                    f"1. **Audit {top['category']}**: This is your highest expenditure at ₹{top['amount']:,.2f}. Look for recurring discretionary subscriptions or dining receipts."
                )
            if ctx["mom_diff"] > 0:
                advice_lines.append(
                    f"2. **Address Month-Over-Month Spike**: Your expenditures rose by {ctx['mom_pct']}% compared to {ctx['previous_month']}."
                )
            advice_lines.append(
                "3. **Set Category Budgets**: Allocating strict limits for non-essential categories (e.g., Shopping, Entertainment) prevents impulse transactions."
            )
            return (
                "Here are actionable suggestions grounded in your active financial ledger:\n\n" + "\n".join(advice_lines),
                "spending_suggestions",
            )

        # General summary default
        summary = (
            f"Here is your financial summary for {month} {ctx['current_year']}:\n"
            f"• **Total Income**: ₹{inc:,.2f}\n"
            f"• **Total Expenses**: ₹{exp:,.2f}\n"
            f"• **Net Savings**: ₹{sav:,.2f} ({sav_rate}%)\n"
        )
        if top:
            summary += f"• **Top Category**: {top['category']} (₹{top['amount']:,.2f})\n"
        if bgt > 0:
            summary += f"• **Budget Status**: ₹{exp:,.2f} of ₹{bgt:,.2f} used\n"
        if ctx["flagged_anomalies_count"] > 0:
            summary += f"• **Alert**: {ctx['flagged_anomalies_count']} unusual transaction(s) flagged for review.\n"

        return (summary, "general_summary")

    async def answer_query(self, db: Session, user_id: int, message: str) -> Dict[str, Any]:
        """
        Main query responder. Computes exact context metrics, generates grounded response,
        and optionally proxies through configured LLM provider if an API key is available.
        """
        ctx = self.calculate_user_financial_context(db, user_id)
        grounded_text, intent = self.generate_grounded_response(message, ctx)

        # Optional LLM integration if provider key configured
        openai_key = getattr(settings, "OPENAI_API_KEY", None)
        if openai_key and openai_key.startswith("sk-"):
            try:
                llm_response = await self._call_openai(openai_key, message, ctx, grounded_text)
                if llm_response:
                    grounded_text = llm_response
            except Exception as e:
                # Silently fallback to deterministic zero-hallucination grounded text
                pass

        return {
            "response": grounded_text,
            "intent": intent,
            "data_context": {
                "current_expenses": ctx["current_expenses"],
                "current_income": ctx["current_income"],
                "current_savings": ctx["current_savings"],
                "savings_rate": ctx["savings_rate"],
                "month": ctx["current_month"],
            },
        }

    async def _call_openai(
        self,
        api_key: str,
        user_message: str,
        context: Dict[str, Any],
        grounded_baseline: str,
    ) -> Optional[str]:
        """Calls external OpenAI API with strict financial numbers grounding."""
        system_prompt = (
            "You are FinWise AI, an expert personal finance assistant. "
            "You MUST ONLY use the provided verified financial data below. "
            "NEVER hallucinate or invent transaction amounts, dates, or financial metrics. "
            "Use INR (₹) formatting.\n\n"
            f"Verified Financial Context for {context['current_month']} {context['current_year']}:\n"
            f"- Total Income: ₹{context['current_income']}\n"
            f"- Total Expenses: ₹{context['current_expenses']}\n"
            f"- Net Savings: ₹{context['current_savings']} ({context['savings_rate']}%)\n"
            f"- Previous Month Expenses: ₹{context['previous_expenses']}\n"
            f"- Top Spending Category: {context['top_category']}\n"
            f"- Monthly Budget Limit: ₹{context['total_budget']}\n"
        )

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        body = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "max_tokens": 300,
            "temperature": 0.3,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=body)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        return None


# Helper tuple type annotation
Tuple_Response = tuple[str, str]

assistant_service = AssistantService()
