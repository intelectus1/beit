const express = require('express');
const router = express.Router();
const { getMySchedules } = require('../controllers/scheduleController');
const { authenticate } = require('../middleware/auth');

router.get('/my', authenticate, getMySchedules);

module.exports = router;
