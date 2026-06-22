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
  deleteTeacher,
  getDeletedTeachers,
  restoreTeacher,
  getAllStudents,
  deleteStudent,
  getDeletedStudents,
  restoreStudent,
  getAllCoursesAdmin,
  deleteCourse,
  getDeletedCourses,
  restoreCourse,
} = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('SUPER_ADMIN'));

router.get('/teachers/pending', getPendingTeachers);
router.get('/teachers/deleted', getDeletedTeachers);
router.get('/teachers', getAllTeachers);
router.get('/teachers/:id', getTeacherById);
router.put('/teachers/:id/approve', approveTeacher);
router.put('/teachers/:id/reject', rejectTeacher);
router.put('/teachers/:id/toggle-status', toggleTeacherStatus);
router.put('/teachers/:id/restore', restoreTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

router.get('/students', getAllStudents);
router.get('/students/deleted', getDeletedStudents);
router.delete('/students/:id', deleteStudent);
router.put('/students/:id/restore', restoreStudent);

router.get('/courses', getAllCoursesAdmin);
router.get('/courses/deleted', getDeletedCourses);
router.delete('/courses/:id', deleteCourse);
router.put('/courses/:id/restore', restoreCourse);

module.exports = router;
