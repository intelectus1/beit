import requests

def test_getapiauthmeauthenticationrequired():
    base_url = "http://localhost:5000"
    timeout = 30

    # Credentials for an existing student user
    email = "alumno@beit.academy"
    password = "beit2025"

    token = None

    try:
        # Step 1: Login to get valid JWT token
        login_resp = requests.post(
            f"{base_url}/api/auth/login",
            json={"email": email, "password": password},
            timeout=timeout
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        assert "token" in login_data, "Login response missing token"
        token = login_data["token"]

        headers_valid = {"Authorization": f"Bearer {token}"}

        # Step 2: Call GET /api/auth/me with valid token, expect 200 and user profile
        me_resp = requests.get(f"{base_url}/api/auth/me", headers=headers_valid, timeout=timeout)
        assert me_resp.status_code == 200, f"Expected 200 with valid token, got {me_resp.status_code}"
        me_data = me_resp.json()
        # Validate essential fields in user profile
        for field in ["id", "name", "email", "role", "status", "createdAt"]:
            assert field in me_data, f"Missing '{field}' in user profile"

        # Step 3: Call GET /api/auth/me without Authorization header, expect 401
        me_resp_no_token = requests.get(f"{base_url}/api/auth/me", timeout=timeout)
        assert me_resp_no_token.status_code == 401, f"Expected 401 without token, got {me_resp_no_token.status_code}"

        # Step 4: Call GET /api/auth/me with invalid token, expect 401
        headers_invalid = {"Authorization": "Bearer invalidtoken123"}
        me_resp_invalid_token = requests.get(f"{base_url}/api/auth/me", headers=headers_invalid, timeout=timeout)
        assert me_resp_invalid_token.status_code == 401, f"Expected 401 with invalid token, got {me_resp_invalid_token.status_code}"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_getapiauthmeauthenticationrequired()