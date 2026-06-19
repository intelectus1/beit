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
  deleteStudent,
  getDeletedStudents,
  restoreStudent,
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
router.get('/students/deleted', getDeletedStudents);
router.delete('/students/:id', deleteStudent);
router.put('/students/:id/restore', restoreStudent);

router.get('/courses', getAllCoursesAdmin);
router.delete('/courses/:id', deleteCourse);

module.exports = router;
