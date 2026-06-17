const express = require('express');
const router = express.Router();
const { updateLesson, deleteLesson, getLessonById } = require('../controllers/lessonController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/:id', authenticate, getLessonById);
router.put('/:id', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateLesson);
router.delete('/:id', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteLesson);

module.exports = router;
