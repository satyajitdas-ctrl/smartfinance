from datetime import date


def test_analytics_endpoints(client):
    # Register and seed user
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Analytics User",
            "email": "analytics@example.com",
            "password": "Password123!",
            "currency": "INR",
        },
    )
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Seed data
    client.post("/api/v1/transactions/seed", headers=headers)

    # 1. Category breakdown
    cat_res = client.get("/api/v1/analytics/category-breakdown", headers=headers)
    assert cat_res.status_code == 200
    cat_data = cat_res.json()
    assert "categories" in cat_data
    assert len(cat_data["categories"]) > 0
    assert cat_data["total_expense"] > 0

    # 2. Monthly comparison
    comp_res = client.get("/api/v1/analytics/monthly-comparison", headers=headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert "categories" in comp_data

    # 3. Cashflow trends
    trend_res = client.get("/api/v1/analytics/cashflow-trends", headers=headers)
    assert trend_res.status_code == 200
    trend_data = trend_res.json()
    assert len(trend_data) == 6
