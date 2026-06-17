import requests

base_url = "http://localhost:5000"
timeout = 30

def putapiadminteachersidapprovebysuperadmin():
    # Credentials
    superadmin_credentials = {"email": "admin@beit.academy", "password": "AdminBeit2026!"}
    teacher_credentials = {
        "name": "Pending Teacher",
        "email": "pending_teacher_008@beit.academy",
        "password": "Teacher2026!",
        "role": "TEACHER"
    }
    non_superadmin_credentials = {"email": "profesor@beit.academy", "password": "beit2025"}

    # Helper function to login and return token from credentials. Return None if fail.
    def login(email, password):
        try:
            r = requests.post(
                f"{base_url}/api/auth/login",
                json={"email": email, "password": password},
                timeout=timeout,
            )
            if r.status_code == 200:
                return r.json().get("token")
            else:
                return None
        except Exception:
            return None

    # Helper function to register a teacher (pending approval).
    def register_teacher(name, email, password):
        resp = requests.post(
            f"{base_url}/api/auth/register",
            json={"name": name, "email": email, "password": password, "role": "TEACHER"},
            timeout=timeout,
        )
        return resp

    # Register new teacher (should be pending)
    register_response = register_teacher(teacher_credentials["name"], teacher_credentials["email"], teacher_credentials["password"])
    assert register_response.status_code == 201, f"Teacher registration failed: {register_response.text}"
    body = register_response.json()
    assert body.get("pending") is True, "Teacher registration should be pending approval."

    # Login as superadmin
    superadmin_token = login(superadmin_credentials["email"], superadmin_credentials["password"])
    assert superadmin_token, "Failed to login as Super Admin"

    # Login as non-superadmin (teacher active user)
    non_super_token = login(non_superadmin_credentials["email"], non_superadmin_credentials["password"])
    assert non_super_token, "Failed to login as non-Super Admin user"

    # Get pending teachers list with superadmin token to find the registered teacher's ID
    headers_superadmin = {"Authorization": f"Bearer {superadmin_token}"}
    pending_resp = requests.get(f"{base_url}/api/admin/teachers/pending", headers=headers_superadmin, timeout=timeout)
    assert pending_resp.status_code == 200, f"Failed to get pending teachers: {pending_resp.text}"
    pending_teachers = pending_resp.json()
    # Find the teacher by email
    teacher_pending = next((t for t in pending_teachers if t.get("email") == teacher_credentials["email"]), None)
    assert teacher_pending, "Pending teacher not found in pending list"
    teacher_id = teacher_pending["id"]

    try:
        # Super Admin approves the pending teacher
        approve_url = f"{base_url}/api/admin/teachers/{teacher_id}/approve"
        approve_resp = requests.put(approve_url, headers=headers_superadmin, timeout=timeout)
        assert approve_resp.status_code == 200, f"Approval failed: {approve_resp.text}"
        approved_teacher = approve_resp.json()
        assert approved_teacher.get("status") == "ACTIVE", "Teacher status is not ACTIVE after approval"
        assert approved_teacher.get("id") == teacher_id, "Returned teacher ID mismatch after approval"

        # Non Super Admin tries to approve same teacher and receives 403
        headers_non_super = {"Authorization": f"Bearer {non_super_token}"}
        non_super_approve_resp = requests.put(approve_url, headers=headers_non_super, timeout=timeout)
        assert non_super_approve_resp.status_code == 403, f"Non-Super Admin should get 403, got {non_super_approve_resp.status_code}"

    finally:
        # Cleanup: Attempt to reject the registered teacher to revert status or delete if possible
        # We'll try to reject the teacher to revoke active status.
        reject_url = f"{base_url}/api/admin/teachers/{teacher_id}/reject"
        try:
            requests.put(reject_url, headers=headers_superadmin, timeout=timeout)
        except Exception:
            pass

putapiadminteachersidapprovebysuperadmin()
