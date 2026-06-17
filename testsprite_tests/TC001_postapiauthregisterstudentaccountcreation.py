import requests
import uuid

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_postapiauthregisterstudentaccountcreation():
    # Generate unique email to avoid conflict
    unique_email = f"teststudent_{uuid.uuid4().hex}@example.com"
    register_url = f"{BASE_URL}/api/auth/register"
    authme_url = f"{BASE_URL}/api/auth/me"

    register_payload = {
        "name": "Test Student",
        "email": unique_email,
        "password": "StrongPass123!",
        "role": "STUDENT"
    }
    headers = {
        "Content-Type": "application/json"
    }

    # Register student user
    response = requests.post(register_url, json=register_payload, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}: {response.text}"
    data = response.json()
    assert "user" in data, "'user' not in response"
    assert "token" in data, "'token' not in response"
    user = data["user"]
    token = data["token"]
    assert user.get("email") == unique_email, f"Expected email {unique_email}, got {user.get('email')}"
    assert user.get("role") == "STUDENT", f"Expected role STUDENT, got {user.get('role')}"
    # The user should be immediately active
    assert user.get("status") == "ACTIVE", f"Expected status ACTIVE, got {user.get('status')}"

    # Use token to get current authenticated user profile
    auth_headers = {
        "Authorization": f"Bearer {token}"
    }
    profile_response = requests.get(authme_url, headers=auth_headers, timeout=TIMEOUT)
    assert profile_response.status_code == 200, f"Expected 200 OK from /api/auth/me, got {profile_response.status_code}: {profile_response.text}"
    profile_data = profile_response.json()
    assert profile_data.get("email") == unique_email, f"Profile email mismatch expected {unique_email}, got {profile_data.get('email')}"
    assert profile_data.get("role") == "STUDENT", f"Profile role mismatch expected STUDENT, got {profile_data.get('role')}"
    assert profile_data.get("status") == "ACTIVE", f"Profile status mismatch expected ACTIVE, got {profile_data.get('status')}"

test_postapiauthregisterstudentaccountcreation()