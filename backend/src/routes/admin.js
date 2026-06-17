const express = require('express');
const router = express.Router();
const { getPendingTeachers, approveTeacher, rejectTeacher } = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('SUPER_ADMIN'));

router.get('/teachers/pending', getPendingTeachers);
router.put('/teachers/:id/approve', approveTeacher);
router.put('/teachers/:id/reject', rejectTeacher);

module.exports = router;
