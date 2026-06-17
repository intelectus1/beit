const express = require('express');
const router = express.Router();
const { updateTask, deleteTask, submitTask, gradeSubmission, getTaskSubmissions, getMySubmission, getTaskById } = require('../controllers/taskController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/:id', authenticate, getTaskById);
router.put('/:id', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), updateTask);
router.delete('/:id', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), deleteTask);

router.post('/:id/submit', authenticate, requireRole('STUDENT'), submitTask);
router.get('/:id/submissions', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), getTaskSubmissions);
router.get('/:id/my-submission', authenticate, requireRole('STUDENT'), getMySubmission);
router.put('/submissions/:submissionId/grade', authenticate, requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN'), gradeSubmission);

module.exports = router;
