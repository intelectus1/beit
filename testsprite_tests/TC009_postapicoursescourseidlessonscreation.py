import requests
import json

def test_postapicoursescourseidlessonscreation():
    base_url = "http://localhost:5000"
    timeout = 30

    super_admin_email = "admin@beit.academy"
    super_admin_password = "AdminBeit2026!"

    headers = {
        "Content-Type": "application/json"
    }

    # Helper function to login and get token
    def login(email, password):
        r = requests.post(
            f"{base_url}/api/auth/login",
            headers={"Content-Type": "application/json"},
            data=json.dumps({"email": email, "password": password}),
            timeout=timeout
        )
        if r.status_code != 200:
            raise Exception(f"Login failed for {email} with status {r.status_code} and body {r.text}")
        return r.json().get("token")

    # Helper function to create a course with owner token, required title only
    def create_course(token, title="Test Course for Lesson Creation"):
        r = requests.post(
            f"{base_url}/api/courses",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            data=json.dumps({"title": title}),
            timeout=timeout
        )
        if r.status_code != 201:
            raise Exception(f"Course creation failed with status {r.status_code} and body {r.text}")
        return r.json()

    # Helper function to delete a course by id
    def delete_course(token, course_id):
        r = requests.delete(
            f"{base_url}/api/courses/{course_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=timeout
        )
        return r

    # Login as Super Admin
    token = login(super_admin_email, super_admin_password)

    # Create a course to own lessons
    course = create_course(token)

    course_id = course.get("id")
    assert course_id is not None, "Created course does not have an id"

    lesson_url = f"{base_url}/api/courses/{course_id}/lessons"
    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    try:
        # 1) Test successful lesson creation with required fields title and content
        lesson_payload = {
            "title": "Test Lesson Title",
            "content": "This is the lesson content."
        }
        resp = requests.post(lesson_url, headers=auth_headers, data=json.dumps(lesson_payload), timeout=timeout)
        assert resp.status_code == 201, f"Expected 201 on lesson creation, got {resp.status_code} with body {resp.text}"
        lesson = resp.json()
        assert "id" in lesson, "Created lesson response missing id"
        assert lesson.get("title") == lesson_payload["title"]
        assert lesson.get("content") == lesson_payload["content"]

        lesson_id = lesson.get("id")

        # 2) Test missing title field -> 400
        missing_title_payload = {
            "content": "Content present but missing title"
        }
        resp = requests.post(lesson_url, headers=auth_headers, data=json.dumps(missing_title_payload), timeout=timeout)
        assert resp.status_code == 400, f"Expected 400 when missing 'title', got {resp.status_code} with body {resp.text}"

        # 3) Test missing content field -> 400
        missing_content_payload = {
            "title": "Title present but missing content"
        }
        resp = requests.post(lesson_url, headers=auth_headers, data=json.dumps(missing_content_payload), timeout=timeout)
        assert resp.status_code == 400, f"Expected 400 when missing 'content', got {resp.status_code} with body {resp.text}"

        # 4) Test missing both title and content -> 400
        empty_payload = {}
        resp = requests.post(lesson_url, headers=auth_headers, data=json.dumps(empty_payload), timeout=timeout)
        assert resp.status_code == 400, f"Expected 400 when missing both fields, got {resp.status_code} with body {resp.text}"

    finally:
        # Cleanup: delete created course (cascade deletes lessons)
        del_resp = delete_course(token, course_id)
        assert del_resp.status_code == 200, f"Failed to delete course with status {del_resp.status_code} and body {del_resp.text}"

test_postapicoursescourseidlessonscreation()