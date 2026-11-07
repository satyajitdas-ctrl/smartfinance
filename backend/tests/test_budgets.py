import pytest
from datetime import date


def test_budget_crud_and_status(client, auth_headers):
    # 1. Seed sample transactions first
    seed_res = client.post("/api/v1/transactions/seed", headers=auth_headers)
    assert seed_res.status_code in (200, 201)

    today = date.today()

    # 2. Create budget for Food
    create_res = client.post(
        "/api/v1/budgets/",
        headers=auth_headers,
        json={
            "category": "Food",
            "monthly_limit": 15000.0,
            "month": today.month,
            "year": today.year,
        },
    )
    assert create_res.status_code == 201
    b_data = create_res.json()
    assert b_data["category"] == "Food"
    assert b_data["monthly_limit"] == 15000.0
    budget_id = b_data["id"]

    # 3. Create budget for Rent
    client.post(
        "/api/v1/budgets/",
        headers=auth_headers,
        json={
            "category": "Rent",
            "monthly_limit": 20000.0,
            "month": today.month,
            "year": today.year,
        },
    )

    # 4. Check budget status
    status_res = client.get(
        f"/api/v1/budgets/status?month={today.month}&year={today.year}",
        headers=auth_headers,
    )
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["total_budget"] == 35000.0
    assert len(status_data["budgets"]) == 2

    food_status = next(b for b in status_data["budgets"] if b["category"] == "Food")
    assert food_status["monthly_limit"] == 15000.0
    assert food_status["spent_amount"] > 0
    assert "remaining_amount" in food_status
    assert "percentage_used" in food_status

    # 5. Update budget limit
    update_res = client.put(
        f"/api/v1/budgets/{budget_id}",
        headers=auth_headers,
        json={"monthly_limit": 18000.0},
    )
    assert update_res.status_code == 200
    assert update_res.json()["monthly_limit"] == 18000.0

    # 6. Delete budget
    del_res = client.delete(f"/api/v1/budgets/{budget_id}", headers=auth_headers)
    assert del_res.status_code == 200


def test_seed_default_budgets(client, auth_headers):
    today = date.today()
    seed_res = client.post(
        f"/api/v1/budgets/seed-defaults?month={today.month}&year={today.year}",
        headers=auth_headers,
    )
    assert seed_res.status_code == 200
    budgets = seed_res.json()
    assert len(budgets) >= 6
    categories = {b["category"] for b in budgets}
    assert "Food" in categories
    assert "Rent" in categories
    assert "Bills" in categories
