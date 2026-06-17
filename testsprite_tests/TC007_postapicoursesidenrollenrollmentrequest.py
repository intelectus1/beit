import requests
import time

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_postapicoursesidenrollenrollmentrequest():
    # Credentials from seed
    STUDENT_EMAIL = "alumno@beit.academy"
    STUDENT_PASSWORD = "beit2025"

    headers = {"Content-Type": "application/json"}

    # Step 1: Login as Student to get token
    login_payload = {"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD}
    login_resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload, headers=headers, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Student login failed: {login_resp.text}"
    token = login_resp.json().get("token")
    assert token, "No token returned after login"
    auth_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # Step 2: Get list of published courses to find a published course student is not accepted in, or the seeded course
    # Note: The seed says the student is ACCEPTED in the seed course, so we need to find another published course for enrollment
    courses_resp = requests.get(f"{BASE_URL}/api/courses", timeout=TIMEOUT)
    assert courses_resp.status_code == 200, f"Failed to get published courses: {courses_resp.text}"
    courses = courses_resp.json()
    assert isinstance(courses, list), "Courses response is not a list"

    target_course = None
    # We'll pick first published course student is not accepted (or try to find one)
    # To know if enrolled, call GET /api/courses/:id/my-enrollment
    for course in courses:
        course_id = course.get("id")
        if not course_id:
            continue
        enrollment_resp = requests.get(f"{BASE_URL}/api/courses/{course_id}/my-enrollment", headers=auth_headers, timeout=TIMEOUT)
        if enrollment_resp.status_code != 200:
            continue
        enrollment_data = enrollment_resp.json()
        # enrollment_data is enrollment object or null
        # If null or enrollment status not ACCEPTED or PENDING, pick this course for enrollment test
        if not enrollment_data or enrollment_data.get("status") not in ("ACCEPTED", "PENDING"):
            target_course = course
            break

    # If all courses show ACCEPTED/PENDING or none found, create a new published course to test enrollment
    created_course_id = None
    created_course = None
    teacher_auth_headers = None
    if target_course is None:
        # Need teacher login to create a course and publish it, then test enrollment requests
        TEACHER_EMAIL = "profesor@beit.academy"
        TEACHER_PASSWORD = "beit2025"

        teacher_login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": TEACHER_EMAIL, "password": TEACHER_PASSWORD}, headers=headers, timeout=TIMEOUT)
        assert teacher_login_resp.status_code == 200, f"Teacher login failed: {teacher_login_resp.text}"
        teacher_token = teacher_login_resp.json().get("token")
        assert teacher_token, "No token for teacher login"
        teacher_auth_headers = {"Authorization": f"Bearer {teacher_token}", "Content-Type": "application/json"}

        # Create a new course with required title
        new_course_payload = {"title": f"Test Course for Enrollment {int(time.time())}"}
        create_course_resp = requests.post(f"{BASE_URL}/api/courses", json=new_course_payload, headers=teacher_auth_headers, timeout=TIMEOUT)
        assert create_course_resp.status_code == 201, f"Failed to create course: {create_course_resp.text}"
        created_course = create_course_resp.json()
        created_course_id = created_course.get("id")
        assert created_course_id, "Created course ID missing"
        target_course = created_course

        # Publish the course via PUT /api/courses/:id with isPublished: true
        publish_payload = {"isPublished": True}
        publish_resp = requests.put(f"{BASE_URL}/api/courses/{created_course_id}", json=publish_payload, headers=teacher_auth_headers, timeout=TIMEOUT)
        assert publish_resp.status_code == 200, f"Failed to publish course: {publish_resp.text}"

    course_id = target_course.get("id")
    assert course_id, "Target course ID not found"

    # Step 3: Ensure student is not currently enrolled or pending in this course to test first enrollment request
    # If enrolled or pending, try to delete that enrollment (no API provided), so for test assumption we pick a course with no enrollment or created new course

    # Step 4: POST /api/courses/:id/enroll - first request, expect 201 with PENDING status
    enroll_resp = requests.post(f"{BASE_URL}/api/courses/{course_id}/enroll", headers=auth_headers, timeout=TIMEOUT)
    assert enroll_resp.status_code == 201, f"First enrollment request failed: {enroll_resp.text}"
    enrollment = enroll_resp.json()
    assert enrollment.get("status") == "PENDING", f"Enrollment status is not PENDING: {enrollment}"

    # Step 5: POST /api/courses/:id/enroll again - duplicate enrollment should return 409
    duplicate_enroll_resp = requests.post(f"{BASE_URL}/api/courses/{course_id}/enroll", headers=auth_headers, timeout=TIMEOUT)
    assert duplicate_enroll_resp.status_code == 409, f"Duplicate enrollment did not return 409: {duplicate_enroll_resp.text}"

    # Cleanup: if we created a new course, delete it
    if created_course_id and teacher_auth_headers:
        # Need teacher token again to delete
        try:
            del_resp = requests.delete(f"{BASE_URL}/api/courses/{created_course_id}", headers=teacher_auth_headers, timeout=TIMEOUT)
            assert del_resp.status_code == 200, f"Failed to delete test course: {del_resp.text}"
        except Exception:
            pass  # ignore cleanup errors

test_postapicoursesidenrollenrollmentrequest()