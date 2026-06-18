const express = require('express');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { register, login, me, updateProfile, uploadAvatar } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads', 'avatars'),
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (AVATAR_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG, PNG, WebP o GIF'), false);
    }
  },
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, (req, res, next) => {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, uploadAvatar);

module.exports = router;
