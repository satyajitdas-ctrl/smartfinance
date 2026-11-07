def test_ml_categorizer_predictions(client):
    test_cases = [
        ("Swiggy food order biryani", "Food"),
        ("Uber ride payment office", "Transportation"),
        ("Amazon shopping electronics", "Shopping"),
        ("Airtel broadband wifi bill", "Bills"),
        ("Netflix monthly 4k subscription", "Entertainment"),
        ("Coursera machine learning course", "Education"),
        ("Apollo pharmacy fever tablets", "Healthcare"),
    ]

    for desc, expected_cat in test_cases:
        res = client.post("/api/v1/ml/predict-category", json={"description": desc})
        assert res.status_code == 200
        data = res.json()
        assert data["predicted_category"] == expected_cat
        assert data["confidence"] > 0.15
        assert "model_version" in data


def test_ml_category_correction(client):
    # Register user
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "ML Tester",
            "email": "mltester@example.com",
            "password": "Password123!",
            "currency": "INR",
        },
    )
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    corr_payload = {
        "description": "Starbucks Coffee",
        "original_category": "Entertainment",
        "corrected_category": "Food",
    }
    res_corr = client.post("/api/v1/ml/correct-category", json=corr_payload, headers=headers)
    assert res_corr.status_code == 200
    assert res_corr.json()["corrected_category"] == "Food"


def test_ml_model_info(client):
    res = client.get("/api/v1/ml/model-info")
    assert res.status_code == 200
    info = res.json()
    assert info["status"] == "active"
    assert "Food" in info["categories_supported"]
    assert "Transportation" in info["categories_supported"]
