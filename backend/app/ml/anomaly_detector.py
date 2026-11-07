import math
from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest


class AnomalyDetector:
    """
    ML Anomaly Detection Engine for Personal Finance.
    Combines Scikit-learn Isolation Forest with category-level statistical Z-scoring
    to identify unusual spending patterns without labeling them as fraud.
    """

    def __init__(self, contamination: float = 0.08, random_state: int = 42):
        self.contamination = contamination
        self.random_state = random_state

    def detect_anomalies(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyzes a list of transaction dictionaries (expense only) and identifies
        statistical outliers and Isolation Forest anomalies.

        Expected transaction dict keys:
          id, description, amount, category, transaction_date, review_status, ...
        """
        if not transactions:
            return []

        df = pd.DataFrame(transactions)
        # Filter for expense transactions only
        if "transaction_type" in df.columns:
            df = df[df["transaction_type"] == "expense"].copy()

        if len(df) == 0:
            return []

        # 1. Compute Category-level statistics (mean, std, median)
        cat_stats: Dict[str, Dict[str, float]] = {}
        for cat, group in df.groupby("category"):
            amounts = group["amount"].astype(float)
            cat_stats[str(cat)] = {
                "mean": float(amounts.mean()),
                "std": float(amounts.std(ddof=0)) if len(amounts) > 1 else float(amounts.mean() * 0.3),
                "median": float(amounts.median()),
                "count": len(amounts),
                "max": float(amounts.max()),
            }

        flagged_anomalies: List[Dict[str, Any]] = []

        # 2. Fit Isolation Forest if at least 5 transactions exist
        if len(df) >= 5:
            # Build feature matrix:
            # Feature 0: amount
            # Feature 1: log(amount + 1)
            # Feature 2: ratio to category mean
            # Feature 3: category z-score
            features = []
            for _, row in df.iterrows():
                amt = float(row["amount"])
                cat = str(row["category"])
                stats = cat_stats.get(cat, {"mean": amt, "std": 1.0})
                mean = stats["mean"]
                std = stats["std"] if stats["std"] > 0 else (mean * 0.2 or 1.0)
                ratio = amt / (mean if mean > 0 else 1.0)
                z_score = abs(amt - mean) / std
                features.append([amt, math.log1p(amt), ratio, z_score])

            X = np.array(features)

            # Fit Isolation Forest
            iso_forest = IsolationForest(
                contamination=self.contamination,
                random_state=self.random_state,
                n_estimators=100,
            )
            iso_forest.fit(X)
            # Decision function: lower values mean more abnormal
            raw_scores = iso_forest.decision_function(X)
            predictions = iso_forest.predict(X)  # -1 for anomaly, 1 for normal

            # Map raw score to 0.0 - 1.0 anomaly severity score
            # raw_scores typically range from -0.3 to +0.3
            min_s, max_s = raw_scores.min(), raw_scores.max()
            span = (max_s - min_s) if max_s != min_s else 1.0

            for idx, (_, row) in enumerate(df.iterrows()):
                amt = float(row["amount"])
                cat = str(row["category"])
                stats = cat_stats.get(cat, {"mean": amt, "std": 1.0})
                mean = stats["mean"]
                ratio = amt / (mean if mean > 0 else 1.0)

                # Normalized score: inverted so 1.0 is highest anomaly
                normalized_score = round(float(1.0 - ((raw_scores[idx] - min_s) / span)), 2)
                is_iso_outlier = predictions[idx] == -1

                # Condition for flagging:
                # 1. Isolation forest flagged it AND amount is substantially above category mean (> 1.8x)
                # OR 2. Extreme statistical outlier (> 2.8x category mean with amount > 1000)
                is_anomaly = (is_iso_outlier and ratio >= 1.6 and amt >= 500) or (ratio >= 2.5 and amt >= 1000)

                if is_anomaly:
                    reason = (
                        f"Transaction amount ₹{amt:,.0f} is {ratio:.1f}x higher than your "
                        f"average {cat} spending of ₹{mean:,.0f}."
                    )
                    flagged_anomalies.append({
                        "transaction_id": int(row["id"]),
                        "description": str(row["description"]),
                        "amount": amt,
                        "category": cat,
                        "transaction_date": str(row["transaction_date"]),
                        "anomaly_reason": reason,
                        "anomaly_score": max(0.65, min(0.98, normalized_score)),
                        "review_status": row.get("review_status", "unreviewed") or "unreviewed",
                    })
        else:
            # Fallback pure statistical approach when data points are under 5
            for _, row in df.iterrows():
                amt = float(row["amount"])
                cat = str(row["category"])
                stats = cat_stats.get(cat, {"mean": amt, "std": 1.0})
                mean = stats["mean"]
                ratio = amt / (mean if mean > 0 else 1.0)
                if ratio >= 2.5 and amt >= 1000:
                    reason = (
                        f"Amount ₹{amt:,.0f} significantly exceeds your recorded {cat} "
                        f"average of ₹{mean:,.0f}."
                    )
                    flagged_anomalies.append({
                        "transaction_id": int(row["id"]),
                        "description": str(row["description"]),
                        "amount": amt,
                        "category": cat,
                        "transaction_date": str(row["transaction_date"]),
                        "anomaly_reason": reason,
                        "anomaly_score": 0.85,
                        "review_status": row.get("review_status", "unreviewed") or "unreviewed",
                    })

        return flagged_anomalies


# Singleton instance
anomaly_detector = AnomalyDetector()
