import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_postapiauthloginvalidationandauthorization():
    url_login = f"{BASE_URL}/api/auth/login"
    url_register = f"{BASE_URL}/api/auth/register"

    # 1. Missing fields: no email
    payload_missing_email = {"password": "somepassword"}
    resp = requests.post(url_login, json=payload_missing_email, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected 400 for missing email, got {resp.status_code}"
    data = resp.json()
    assert 'error' in data or 'message' in data, "Expected error or message field in response for missing email"

    # 1b. Missing fields: no password
    payload_missing_password = {"email": "admin@beit.academy"}
    resp = requests.post(url_login, json=payload_missing_password, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected 400 for missing password, got {resp.status_code}"
    data = resp.json()
    assert 'error' in data or 'message' in data, "Expected error or message field in response for missing password"

    # 2. Invalid credentials:
    payload_invalid_creds = {"email": "admin@beit.academy", "password": "wrongpassword"}
    resp = requests.post(url_login, json=payload_invalid_creds, timeout=TIMEOUT)
    assert resp.status_code == 401, f"Expected 401 for invalid credentials, got {resp.status_code}"
    data = resp.json()
    assert 'error' in data or 'message' in data, "Expected error or message field in response for invalid credentials"

    # 3. Blocked login for pending or rejected accounts:
    # To test this, register a new TEACHER account which will be pending approval,
    # then attempt to login with those credentials and expect 403.

    teacher_email = "test_teacher_pending@beit.academy"
    teacher_password = "TeacherPass123!"

    # Register teacher account
    payload_register_teacher = {
        "name": "Test Pending Teacher",
        "email": teacher_email,
        "password": teacher_password,
        "role": "TEACHER"
    }
    resp_register = requests.post(url_register, json=payload_register_teacher, timeout=TIMEOUT)
    assert resp_register.status_code == 201, f"Expected 201 on teacher registration, got {resp_register.status_code}"
    data_register = resp_register.json()
    # Registration for teacher returns pending:true and no token
    assert "pending" in data_register and data_register["pending"] is True, "Expected pending:true in teacher registration response"
    assert "token" not in data_register, "Did not expect token in teacher registration response"

    try:
        # Attempt login for pending teacher should return 403
        payload_login_pending_teacher = {
            "email": teacher_email,
            "password": teacher_password
        }
        resp_login_pending = requests.post(url_login, json=payload_login_pending_teacher, timeout=TIMEOUT)
        assert resp_login_pending.status_code == 403, f"Expected 403 for pending teacher login attempt, got {resp_login_pending.status_code}"
        data_login_pending = resp_login_pending.json()
        assert 'error' in data_login_pending or 'message' in data_login_pending, "Expected error or message field in response for pending teacher login"
        assert 'pending' in data_login_pending and data_login_pending['pending'] is True, "Expected pending:true in login blocked response for teacher"
    finally:
        # Cleanup: If an endpoint to delete user existed it would be called here.
        # The PRD doesn't provide user delete endpoint. So cannot clean up.
        pass


test_postapiauthloginvalidationandauthorization()