const express = require('express');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
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
  uploadCourseCover,
} = require('../controllers/courseController');
const { createLesson, reorderLessons } = require('../controllers/lessonController');
const { getCourseTasks, createTask } = require('../controllers/taskController');
const { getCourseSchedules, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { getCurriculum, createCurriculumItem, updateCurriculumItem, deleteCurriculumItem, reorderCurriculum } = require('../controllers/curriculumController');
const { authenticate, optionalAuthenticate, requireRole } = require('../middleware/auth');

const COVER_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const coverStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads', 'covers'),
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});
const coverUpload = multer({
  storage: coverStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (COVER_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG, PNG, WebP o GIF'), false);
    }
  },
});

router.get('/', optionalAuthenticate, getAllCourses);
router.get('/my', authenticate, getMyCourses);
router.get('/:id', optionalAuthenticate, getCourseById);

router.post('/', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createCourse);
router.put('/:id', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateCourse);
router.delete('/:id', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteCourse);

router.put('/:id/cover', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), (req, res, next) => {
  coverUpload.single('cover')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, uploadCourseCover);

router.post('/:id/enroll', authenticate, requireRole('STUDENT'), enrollCourse);
router.get('/:id/my-enrollment', authenticate, requireRole('STUDENT'), getMyEnrollment);
router.get('/:id/my-grades', authenticate, requireRole('STUDENT'), getMyGrades);

router.get('/:id/enrollment-requests', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), getEnrollmentRequests);
router.put('/:id/enrollments/:enrollmentId', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateEnrollmentStatus);
router.get('/:id/students', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), getCourseStudents);

router.post('/:courseId/lessons', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createLesson);
router.put('/:courseId/lessons/reorder', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), reorderLessons);

router.get('/:courseId/tasks', authenticate, getCourseTasks);
router.post('/:courseId/tasks', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createTask);

// Schedules
router.get('/:courseId/schedules', authenticate, getCourseSchedules);
router.post('/:courseId/schedules', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createSchedule);
router.put('/:courseId/schedules/:scheduleId', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateSchedule);
router.delete('/:courseId/schedules/:scheduleId', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteSchedule);

// Curriculum
router.get('/:courseId/curriculum', authenticate, getCurriculum);
router.post('/:courseId/curriculum', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createCurriculumItem);
router.put('/:courseId/curriculum/reorder', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), reorderCurriculum);
router.put('/:courseId/curriculum/:itemId', authenticate, updateCurriculumItem);
router.delete('/:courseId/curriculum/:itemId', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteCurriculumItem);

module.exports = router;
