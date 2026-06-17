import requests
import uuid

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

SUPER_ADMIN_EMAIL = "admin@beit.academy"
SUPER_ADMIN_PASSWORD = "AdminBeit2026!"
TEACHER_EMAIL = "profesor@beit.academy"
TEACHER_PASSWORD = "beit2025"
STUDENT_EMAIL = "alumno@beit.academy"
STUDENT_PASSWORD = "beit2025"

def login(email, password):
    url = f"{BASE_URL}/api/auth/login"
    resp = requests.post(url, json={"email": email, "password": password}, timeout=TIMEOUT)
    if resp.status_code == 200:
        return resp.json().get("token")
    else:
        return None

def create_course(token, title):
    url = f"{BASE_URL}/api/courses"
    headers = {"Authorization": f"Bearer {token}"}
    body = {"title": title}
    resp = requests.post(url, json=body, headers=headers, timeout=TIMEOUT)
    if resp.status_code == 201:
        return resp.json()
    else:
        raise Exception(f"Create course failed: {resp.status_code} {resp.text}")

def delete_course(course_id, token):
    url = f"{BASE_URL}/api/courses/{course_id}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    # Allow 200 success or 404 if already deleted
    if resp.status_code not in (200, 404):
        raise Exception(f"Delete course failed: {resp.status_code} {resp.text}")

def create_task(course_id, token, title, description):
    url = f"{BASE_URL}/api/courses/{course_id}/tasks"
    headers = {"Authorization": f"Bearer {token}"}
    body = {
        "title": title,
        "description": description
    }
    resp = requests.post(url, json=body, headers=headers, timeout=TIMEOUT)
    if resp.status_code == 201:
        return resp.json()
    else:
        raise Exception(f"Create task failed: {resp.status_code} {resp.text}")

def delete_task(task_id, token):
    url = f"{BASE_URL}/api/tasks/{task_id}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    # Allow 200 or 404
    if resp.status_code not in (200, 404):
        raise Exception(f"Delete task failed: {resp.status_code} {resp.text}")

def enroll_student(course_id, token):
    url = f"{BASE_URL}/api/courses/{course_id}/enroll"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.post(url, headers=headers, timeout=TIMEOUT)
    if resp.status_code == 201:
        return resp.json()
    elif resp.status_code == 409:
        return None  # Already enrolled or pending
    else:
        raise Exception(f"Enroll student failed: {resp.status_code} {resp.text}")

def approve_enrollment(course_id, enrollment_id, token):
    url = f"{BASE_URL}/api/courses/{course_id}/enrollments/{enrollment_id}"
    headers = {"Authorization": f"Bearer {token}"}
    body = {"status": "ACCEPTED"}
    resp = requests.put(url, json=body, headers=headers, timeout=TIMEOUT)
    if resp.status_code == 200:
        return resp.json()
    else:
        raise Exception(f"Approve enrollment failed: {resp.status_code} {resp.text}")

def get_my_enrollment(course_id, token):
    url = f"{BASE_URL}/api/courses/{course_id}/my-enrollment"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers, timeout=TIMEOUT)
    if resp.status_code == 200:
        return resp.json()
    else:
        return None

def post_task_submit(task_id, token, content=None, fileUrl=None):
    url = f"{BASE_URL}/api/tasks/{task_id}/submit"
    headers = {"Authorization": f"Bearer {token}"}
    body = {}
    if content is not None:
        body["content"] = content
    if fileUrl is not None:
        body["fileUrl"] = fileUrl
    resp = requests.post(url, json=body, headers=headers, timeout=TIMEOUT)
    return resp

def test_postapitasksidsubmitbysubmittedstudent():
    # Login tokens for different roles
    super_admin_token = login(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD)
    assert super_admin_token is not None, "Super Admin login failed"
    teacher_token = login(TEACHER_EMAIL, TEACHER_PASSWORD)
    assert teacher_token is not None, "Teacher login failed"
    student_token = login(STUDENT_EMAIL, STUDENT_PASSWORD)
    assert student_token is not None, "Student login failed"
    
    course = None
    task = None
    enrollment = None
    try:
        # Create course with teacher token
        unique_title = f"Test Course {uuid.uuid4()}"
        course = create_course(teacher_token, unique_title)
        course_id = course.get("id")
        assert course_id is not None
        
        # Publish the course so student can enroll and be accepted
        # PUT /api/courses/:id with isPublished
        url_update_course = f"{BASE_URL}/api/courses/{course_id}"
        headers = {"Authorization": f"Bearer {teacher_token}"}
        body_update = {"isPublished": True}
        resp_update = requests.put(url_update_course, json=body_update, headers=headers, timeout=TIMEOUT)
        assert resp_update.status_code == 200, f"Publishing course failed: {resp_update.text}"
        
        # Enroll the student
        enrollment_resp = enroll_student(course_id, student_token)
        if enrollment_resp is None:
            # Possibly already enrolled, check status and try proceed
            enrollment_obj = get_my_enrollment(course_id, student_token)
            assert enrollment_obj is not None and "status" in enrollment_obj, "Enrollment failed and no enrollment info"
            if enrollment_obj["status"] != "ACCEPTED":
                # Approve enrollment if not accepted yet
                # Need enrollmentId for approval
                # Get enrollment requests with teacher token
                url_requests = f"{BASE_URL}/api/courses/{course_id}/enrollment-requests"
                headers_teacher = {"Authorization": f"Bearer {teacher_token}"}
                resp_requests = requests.get(url_requests, headers=headers_teacher, timeout=TIMEOUT)
                assert resp_requests.status_code == 200, f"Failed get enrollment requests: {resp_requests.text}"
                
                pending_requests = resp_requests.json()
                student_enroll_req = None
                for er in pending_requests:
                    if er.get("userId", er.get("user", {}).get("id", None)) == enrollment_obj.get("userId", enrollment_obj.get("user", {}).get("id", None), None):
                        student_enroll_req = er
                        break
                assert student_enroll_req is not None, "No enrollment request found to approve"
                enrollment_id = student_enroll_req.get("id")
                assert enrollment_id is not None, "Enrollment request id missing"
                approve_resp = approve_enrollment(course_id, enrollment_id, teacher_token)
                assert approve_resp.get("status") == "ACCEPTED", "Enrollment approval failed"
        else:
            assert enrollment_resp.get("status") == "PENDING" or enrollment_resp.get("status") == "ACCEPTED"
            if enrollment_resp.get("status") == "PENDING":
                # Approve the enrollment if pending
                # Get enrollment requests with teacher token
                url_requests = f"{BASE_URL}/api/courses/{course_id}/enrollment-requests"
                headers_teacher = {"Authorization": f"Bearer {teacher_token}"}
                resp_requests = requests.get(url_requests, headers=headers_teacher, timeout=TIMEOUT)
                assert resp_requests.status_code == 200, f"Failed get enrollment requests: {resp_requests.text}"
                pending_requests = resp_requests.json()
                enrollment_id = None
                for er in pending_requests:
                    if "user" in er and er["user"].get("email") == STUDENT_EMAIL:
                        enrollment_id = er.get("id")
                        break
                assert enrollment_id is not None, "Enrollment request id missing"
                approve_resp = approve_enrollment(course_id, enrollment_id, teacher_token)
                assert approve_resp.get("status") == "ACCEPTED", "Enrollment approval failed"

        # Create a task for the course
        unique_task_title = f"Task for {unique_title}"
        unique_task_description = "Task Description"
        task = create_task(course_id, teacher_token, unique_task_title, unique_task_description)
        task_id = task.get("id")
        assert task_id is not None
        
        # Accepted student submits required content -> 201
        submit_content = f"Answer for task {task_id} by student."
        resp_submit_1 = post_task_submit(task_id, student_token, content=submit_content)
        assert resp_submit_1.status_code == 201, f"First submission failed: {resp_submit_1.text}"
        submission1 = resp_submit_1.json()
        assert "id" in submission1
        
        # Duplicate submission returns 409
        resp_submit_2 = post_task_submit(task_id, student_token, content="Another answer")
        assert resp_submit_2.status_code == 409, f"Duplicate submission expected 409 but got {resp_submit_2.status_code}"
        
        # Missing content returns 400
        resp_submit_3 = post_task_submit(task_id, student_token, content=None)
        assert resp_submit_3.status_code == 400, f"Missing content expected 400 but got {resp_submit_3.status_code}"
        
        # Unauthorized student (not accepted in course)
        # Create a new student not enrolled or rejected - register new student and use token
        new_student_email = f"unauthstudent_{uuid.uuid4().hex[:8]}@example.com"
        new_student_password = "pass1234"
        # Register new student
        url_reg = f"{BASE_URL}/api/auth/register"
        reg_resp = requests.post(url_reg, json={
            "name": "Unauthorized Student",
            "email": new_student_email,
            "password": new_student_password,
            "role": "STUDENT"
        }, timeout=TIMEOUT)
        assert reg_resp.status_code == 201, f"New student registration failed: {reg_resp.text}"
        new_student_token = reg_resp.json().get("token")
        assert new_student_token is not None, "Token not received for new student"
        
        # Trying to submit to the task without enrollment or acceptance -> 403
        resp_submit_4 = post_task_submit(task_id, new_student_token, content="Attempt by unauthorized student")
        assert resp_submit_4.status_code == 403, f"Unauthorized student expected 403 but got {resp_submit_4.status_code}"

    finally:
        # Cleanup created task
        if task is not None:
            try:
                delete_task(task.get("id"), teacher_token)
            except Exception:
                pass
        # Cleanup created course
        if course is not None:
            try:
                delete_course(course.get("id"), teacher_token)
            except Exception:
                pass

test_postapitasksidsubmitbysubmittedstudent()