const express = require('express');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { updateLesson, deleteLesson, getLessonById, reorderLessons } = require('../controllers/lessonController');
const { getMaterials, uploadMaterial, downloadMaterial, streamMaterial, deleteMaterial } = require('../controllers/materialController');
const { getLessonTasks, createLessonTask } = require('../controllers/taskController');
const { authenticate, requireRole } = require('../middleware/auth');

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed',
];

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads', 'materials'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  },
});

router.get('/:id', authenticate, getLessonById);
router.put('/reorder/:courseId', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), reorderLessons);
router.put('/:id', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateLesson);
router.delete('/:id', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteLesson);

// Tasks for a lesson
router.get('/:lessonId/tasks', authenticate, getLessonTasks);
router.post('/:lessonId/tasks', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createLessonTask);

// Materials
router.get('/:lessonId/materials', authenticate, getMaterials);
router.post(
  '/:lessonId/materials',
  authenticate,
  requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  uploadMaterial
);
router.get('/:lessonId/materials/:materialId/download', authenticate, downloadMaterial);
router.get('/:lessonId/materials/:materialId/stream', authenticate, streamMaterial);
router.delete('/:lessonId/materials/:materialId', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteMaterial);

module.exports = router;
