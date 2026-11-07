import pytest
from datetime import date, timedelta


def test_anomaly_detection_and_review(client, auth_headers):
    # 1. Add typical low-cost Food transactions
    today = date.today()
    for i in range(8):
        client.post(
            "/api/v1/transactions/",
            headers=auth_headers,
            json={
                "description": f"Lunch cafeteria {i}",
                "amount": 250.0 + (i * 20),
                "transaction_type": "expense",
                "category": "Food",
                "transaction_date": (today - timedelta(days=i)).isoformat(),
            },
        )

    # 2. Add an extreme outlier transaction in Food
    outlier_res = client.post(
        "/api/v1/transactions/",
        headers=auth_headers,
        json={
            "description": "Massive banquet dining splurge",
            "amount": 15000.0,
            "transaction_type": "expense",
            "category": "Food",
            "transaction_date": today.isoformat(),
        },
    )
    assert outlier_res.status_code == 201
    outlier_id = outlier_res.json()["id"]

    # 3. Trigger Isolation Forest anomaly detection
    detect_res = client.post("/api/v1/ml/anomalies/detect", headers=auth_headers)
    assert detect_res.status_code == 200
    detect_data = detect_res.json()
    assert detect_data["anomalies_detected"] >= 1

    # 4. Fetch anomalies list
    anom_res = client.get("/api/v1/ml/anomalies", headers=auth_headers)
    assert anom_res.status_code == 200
    anomalies = anom_res.json()
    assert len(anomalies) >= 1
    flagged_ids = [a["transaction_id"] for a in anomalies]
    assert outlier_id in flagged_ids

    flagged_outlier = next(a for a in anomalies if a["transaction_id"] == outlier_id)
    assert "Food" in flagged_outlier["category"]
    assert flagged_outlier["anomaly_score"] >= 0.65
    assert flagged_outlier["review_status"] == "unreviewed"

    # 5. Mark anomaly as verified/confirmed_ok
    review_res = client.post(
        f"/api/v1/ml/anomalies/{outlier_id}/review?status_choice=confirmed_ok",
        headers=auth_headers,
    )
    assert review_res.status_code == 200
    assert review_res.json()["review_status"] == "confirmed_ok"


def test_expense_forecasting(client, auth_headers):
    # Seed transactions and budgets
    client.post("/api/v1/transactions/seed", headers=auth_headers)
    client.post("/api/v1/budgets/seed-defaults", headers=auth_headers)

    # Request forecast
    forecast_res = client.get("/api/v1/ml/forecast", headers=auth_headers)
    assert forecast_res.status_code == 200
    data = forecast_res.json()

    assert "forecast_month" in data
    assert data["total_predicted_expense"] > 0
    assert len(data["categories"]) > 0
    assert "disclaimer" in data
    assert "algorithmic estimates" in data["disclaimer"]
