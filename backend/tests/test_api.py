def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Welcome to FinWise AI" in data["message"]


def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["default_currency"] == "INR"


def test_user_registration_and_login(client):
    # 1. Register
    reg_payload = {
        "name": "Satyajit Das",
        "email": "satyajit@example.com",
        "password": "SecurePassword123!",
        "currency": "INR",
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    token_data = reg_res.json()
    assert "access_token" in token_data
    assert token_data["user"]["email"] == "satyajit@example.com"
    token = token_data["access_token"]

    # 2. Duplicate registration should fail
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Login with correct credentials
    login_payload = {
        "email": "satyajit@example.com",
        "password": "SecurePassword123!",
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 4. Login with incorrect password
    bad_login = {
        "email": "satyajit@example.com",
        "password": "WrongPassword!",
    }
    bad_res = client.post("/api/v1/auth/login", json=bad_login)
    assert bad_res.status_code == 401

    # 5. Get current user profile (/me)
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Satyajit Das"
