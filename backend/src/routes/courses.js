const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getMyCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getMyEnrollment,
  getEnrollmentRequests,
  updateEnrollmentStatus,
  getCourseStudents,
  getMyGrades,
} = require('../controllers/courseController');
const { createLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { getCourseTasks, createTask } = require('../controllers/taskController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', getAllCourses);
router.get('/my', authenticate, getMyCourses);
router.get('/:id', getCourseById);

router.post('/', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createCourse);
router.put('/:id', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateCourse);
router.delete('/:id', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteCourse);

router.post('/:id/enroll', authenticate, requireRole('STUDENT'), enrollCourse);
router.get('/:id/my-enrollment', authenticate, requireRole('STUDENT'), getMyEnrollment);
router.get('/:id/my-grades', authenticate, requireRole('STUDENT'), getMyGrades);

router.get('/:id/enrollment-requests', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), getEnrollmentRequests);
router.put('/:id/enrollments/:enrollmentId', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateEnrollmentStatus);
router.get('/:id/students', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), getCourseStudents);

router.post('/:courseId/lessons', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createLesson);

router.get('/:courseId/tasks', authenticate, getCourseTasks);
router.post('/:courseId/tasks', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createTask);

module.exports = router;
