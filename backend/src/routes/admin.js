const express = require('express');
const router = express.Router();
const {
  getPendingTeachers,
  approveTeacher,
  rejectTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  toggleTeacherStatus,
  getAllStudents,
  getAllCoursesAdmin,
  deleteCourse,
} = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('SUPER_ADMIN'));

router.get('/teachers/pending', getPendingTeachers);
router.get('/teachers', getAllTeachers);
router.get('/teachers/:id', getTeacherById);
router.put('/teachers/:id/approve', approveTeacher);
router.put('/teachers/:id/reject', rejectTeacher);
router.put('/teachers/:id/toggle-status', toggleTeacherStatus);
router.put('/teachers/:id', updateTeacher);

router.get('/students', getAllStudents);
router.get('/courses', getAllCoursesAdmin);
router.delete('/courses/:id', deleteCourse);

module.exports = router;
