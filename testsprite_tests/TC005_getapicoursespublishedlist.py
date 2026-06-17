import requests

def test_getapicoursespublishedlist():
    base_url = "http://localhost:5000"
    url = f"{base_url}/api/courses"
    try:
        response = requests.get(url, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to GET /api/courses failed: {e}"
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"
    assert isinstance(data, list), "Response body should be a list of courses"

    # Validate each course object
    for course in data:
        assert isinstance(course, dict), "Each course should be a JSON object"
        # Check teacher info object exists and has required fields
        teacher = course.get('teacher')
        assert teacher is not None, "Course missing teacher information"
        assert isinstance(teacher, dict), "Teacher info should be an object"
        assert 'id' in teacher and isinstance(teacher['id'], int), "Teacher id missing or invalid"
        assert 'name' in teacher and isinstance(teacher['name'], str), "Teacher name missing or invalid"
        assert 'email' in teacher and isinstance(teacher['email'], str), "Teacher email missing or invalid"
        # Check counts presence (e.g. enrollment counts or similar counts)
        counts = course.get('_count')
        assert counts is not None, "Course missing _count info"
        assert isinstance(counts, dict), "_count should be an object"
    # Test passes if none of the assertions fail

test_getapicoursespublishedlist()