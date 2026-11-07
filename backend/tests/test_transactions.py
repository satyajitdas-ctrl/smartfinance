from datetime import date


def get_auth_token(client, email="user1@example.com", name="User One"):
    payload = {
        "name": name,
        "email": email,
        "password": "Password123!",
        "currency": "INR",
    }
    res = client.post("/api/v1/auth/register", json=payload)
    return res.json()["access_token"]


def test_transaction_crud_and_summary(client):
    token = get_auth_token(client, "alice@example.com", "Alice")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Income Transaction
    salary_payload = {
        "description": "Tech Corp Monthly Salary",
        "amount": 100000.0,
        "transaction_type": "income",
        "category": "Salary",
        "transaction_date": str(date.today()),
    }
    res_salary = client.post("/api/v1/transactions", json=salary_payload, headers=headers)
    assert res_salary.status_code == 201
    salary_data = res_salary.json()
    assert salary_data["amount"] == 100000.0
    assert salary_data["transaction_type"] == "income"

    # 2. Create Expense Transaction
    food_payload = {
        "description": "Swiggy Lunch Feast",
        "amount": 850.0,
        "transaction_type": "expense",
        "category": "Food",
        "transaction_date": str(date.today()),
    }
    res_food = client.post("/api/v1/transactions", json=food_payload, headers=headers)
    assert res_food.status_code == 201
    food_id = res_food.json()["id"]

    # 3. List Transactions
    list_res = client.get("/api/v1/transactions", headers=headers)
    assert list_res.status_code == 200
    transactions = list_res.json()
    assert len(transactions) == 2

    # 4. Filter by category
    filter_res = client.get("/api/v1/transactions?category=Food", headers=headers)
    assert filter_res.status_code == 200
    filtered = filter_res.json()
    assert len(filtered) == 1
    assert filtered[0]["category"] == "Food"

    # 5. Get Financial Summary
    summary_res = client.get("/api/v1/transactions/summary", headers=headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_income"] == 100000.0
    assert summary["total_expenses"] == 850.0
    assert summary["current_balance"] == 99150.0
    assert summary["transactions_count"] == 2
    assert summary["savings_rate_percentage"] == 99.2

    # 6. Update Transaction
    update_payload = {"amount": 950.0, "description": "Swiggy Lunch + Dessert"}
    update_res = client.put(f"/api/v1/transactions/{food_id}", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["amount"] == 950.0
    assert update_res.json()["description"] == "Swiggy Lunch + Dessert"

    # 7. Delete Transaction
    del_res = client.delete(f"/api/v1/transactions/{food_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Transaction deleted successfully"

    # Verify deletion
    get_del = client.get(f"/api/v1/transactions/{food_id}", headers=headers)
    assert get_del.status_code == 404


def test_user_data_isolation(client):
    # Register User A and User B
    token_a = get_auth_token(client, "usera@example.com", "User A")
    token_b = get_auth_token(client, "userb@example.com", "User B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A creates a transaction
    tx_a = client.post(
        "/api/v1/transactions",
        json={
            "description": "User A Private Transaction",
            "amount": 5000.0,
            "transaction_type": "expense",
            "category": "Shopping",
            "transaction_date": str(date.today()),
        },
        headers=headers_a,
    ).json()

    # User B should NOT see User A's transaction in list
    list_b = client.get("/api/v1/transactions", headers=headers_b).json()
    assert len(list_b) == 0

    # User B cannot access User A's transaction by ID
    get_b = client.get(f"/api/v1/transactions/{tx_a['id']}", headers=headers_b)
    assert get_b.status_code == 404

    # User B cannot delete User A's transaction
    del_b = client.delete(f"/api/v1/transactions/{tx_a['id']}", headers=headers_b)
    assert del_b.status_code == 404


def test_transaction_seed(client):
    token = get_auth_token(client, "seeduser@example.com", "Seed User")
    headers = {"Authorization": f"Bearer {token}"}

    seed_res = client.post("/api/v1/transactions/seed", headers=headers)
    assert seed_res.status_code == 200
    data = seed_res.json()
    assert len(data) >= 10
    assert any(tx["category"] == "Salary" for tx in data)
    assert any(tx["category"] == "Rent" for tx in data)
