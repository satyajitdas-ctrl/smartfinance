import pytest


def test_ai_assistant_grounded_queries_and_history(client, auth_headers):
    # 1. Seed sample transactions
    seed_res = client.post("/api/v1/transactions/seed", headers=auth_headers)
    assert seed_res.status_code in (200, 201)

    # 2. Ask spending query
    spend_res = client.post(
        "/api/v1/assistant/chat",
        headers=auth_headers,
        json={"message": "How much did I spend this month?"},
    )
    assert spend_res.status_code == 200
    spend_data = spend_res.json()
    assert "₹" in spend_data["response"]
    assert spend_data["intent"] in ("current_spending", "compare_monthly_spending")
    assert "data_context" in spend_data
    assert spend_data["data_context"]["current_expenses"] > 0

    # 3. Ask biggest spending category query
    cat_res = client.post(
        "/api/v1/assistant/chat",
        headers=auth_headers,
        json={"message": "What is my biggest spending category?"},
    )
    assert cat_res.status_code == 200
    cat_data = cat_res.json()
    assert cat_data["intent"] == "top_category"
    assert "biggest spending category" in cat_data["response"].lower()

    # 4. Ask savings query
    sav_res = client.post(
        "/api/v1/assistant/chat",
        headers=auth_headers,
        json={"message": "How much did I save this month?"},
    )
    assert sav_res.status_code == 200
    sav_data = sav_res.json()
    assert sav_data["intent"] == "savings_summary"

    # 5. Check chat history persistence
    hist_res = client.get("/api/v1/assistant/history", headers=auth_headers)
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) == 3

    # 6. Clear chat history
    del_res = client.delete("/api/v1/assistant/history", headers=auth_headers)
    assert del_res.status_code == 200
    empty_hist = client.get("/api/v1/assistant/history", headers=auth_headers).json()
    assert len(empty_hist) == 0
