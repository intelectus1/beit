import requests
import uuid

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

SUPER_ADMIN_EMAIL = "admin@beit.academy"
SUPER_ADMIN_PASSWORD = "AdminBeit2026!"

def test_postapiauthregisterteacheraccountpendingapproval():
    # Generate unique email for teacher registration
    unique_email = f"testteacher_{uuid.uuid4().hex[:8]}@beit.academy"
    register_url = f"{BASE_URL}/api/auth/register"
    login_url = f"{BASE_URL}/api/auth/login"

    # Register the teacher user - expect 201 with pending:true and message, no token
    register_payload = {
        "name": "Test Teacher",
        "email": unique_email,
        "password": "TeacherPass123!",
        "role": "TEACHER"
    }

    try:
        reg_resp = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Register request failed: {e}"
    assert reg_resp.status_code == 201, f"Expected 201 on register but got {reg_resp.status_code}"
    reg_json = None
    try:
        reg_json = reg_resp.json()
    except Exception as e:
        assert False, f"Register response is not valid JSON: {e}"
    assert isinstance(reg_json, dict), "Register response JSON not a dict"
    assert reg_json.get("pending") is True, "Register response missing or false 'pending'"
    assert "message" in reg_json and isinstance(reg_json["message"], str) and reg_json["message"], "Register response missing or invalid 'message'"
    # There should be no token key in the response
    assert "token" not in reg_json, "Register response should not include token for pending TEACHER"

    # Attempt login with same teacher credentials - expect 403 with pending:true and error message
    login_payload = {
        "email": unique_email,
        "password": "TeacherPass123!"
    }
    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    assert login_resp.status_code == 403, f"Expected 403 on login for pending teacher but got {login_resp.status_code}"
    login_json = None
    try:
        login_json = login_resp.json()
    except Exception as e:
        assert False, f"Login response is not valid JSON: {e}"
    assert isinstance(login_json, dict), "Login response JSON not a dict"
    assert login_json.get("pending") is True, "Login response missing or false 'pending'"
    assert "error" in login_json and isinstance(login_json["error"], str) and login_json["error"], "Login response missing or invalid 'error' message"

test_postapiauthregisterteacheraccountpendingapproval()