import requests
import uuid

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

SUPER_ADMIN_CREDENTIALS = {
    "email": "admin@beit.academy",
    "password": "AdminBeit2026!"
}
TEACHER_CREDENTIALS = {
    "email": "profesor@beit.academy",
    "password": "beit2025"
}
ADMIN_CREDENTIALS = {
    "email": "admin@beit.academy",  # No separate admin given, using super admin creds for admin role test
    "password": "AdminBeit2026!"
}


def get_token(email, password):
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": email, "password": password},
            timeout=TIMEOUT
        )
        response.raise_for_status()
        data = response.json()
        token = data.get("token")
        if not token:
            raise Exception("Token not found in login response")
        return token
    except requests.HTTPError as e:
        raise Exception(f"Login failed for {email} with status {e.response.status_code}: {e.response.text}")
    except Exception as e:
        raise


def create_course(token, title=None):
    payload = {}
    if title is not None:
        payload["title"] = title
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/api/courses",
        json=payload,
        headers=headers,
        timeout=TIMEOUT
    )
    return response


def delete_course(course_id, token):
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.delete(
            f"{BASE_URL}/api/courses/{course_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        # It's ok if delete returns 404 or 403 in case test data got removed or permission problems
    except Exception:
        pass


def test_post_api_courses_creation_by_authorized_users():
    # Get tokens for roles: SUPER_ADMIN, ADMIN, TEACHER
    tokens = {}
    # SUPER_ADMIN login
    tokens["SUPER_ADMIN"] = get_token(SUPER_ADMIN_CREDENTIALS["email"], SUPER_ADMIN_CREDENTIALS["password"])
    # ADMIN uses same as super admin here due to seed info (no separate admin user given)
    tokens["ADMIN"] = tokens["SUPER_ADMIN"]
    # TEACHER login
    tokens["TEACHER"] = get_token(TEACHER_CREDENTIALS["email"], TEACHER_CREDENTIALS["password"])

    created_course_ids = []

    try:
        for role in ("TEACHER", "ADMIN", "SUPER_ADMIN"):
            token = tokens[role]

            # Test successful course creation with required title
            unique_title = f"Test Course {role} {uuid.uuid4()}"
            response = create_course(token, title=unique_title)
            assert response.status_code == 201, f"{role}: Expected 201 but got {response.status_code}"
            course = response.json()
            assert isinstance(course, dict), f"{role}: Response course should be dict"
            assert course.get("title") == unique_title, f"{role}: Course title mismatch"
            assert "id" in course, f"{role}: Created course must have id"
            course_id = course["id"]
            created_course_ids.append((course_id, token))

            # Test missing title returns 400
            response_missing_title = create_course(token, title=None)
            assert response_missing_title.status_code == 400, f"{role}: Expected 400 for missing title but got {response_missing_title.status_code}"
            error_resp = response_missing_title.json()
            # The body should indicate title required, may be a message or error field
            assert any(k in error_resp for k in ("error", "message")), f"{role}: Missing title error message expected"

    finally:
        # Cleanup: delete created courses
        for course_id, token in created_course_ids:
            try:
                delete_course(course_id, token)
            except Exception:
                pass


test_post_api_courses_creation_by_authorized_users()