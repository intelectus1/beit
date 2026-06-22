require('dotenv').config();
// Railway's postgres-ssl uses a self-signed cert; disable TLS cert validation for internal connections
if (process.env.NODE_ENV === 'production') process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');
const taskRoutes = require('./routes/tasks');
const adminRoutes = require('./routes/admin');
const scheduleRoutes = require('./routes/schedules');

const app = express();
app.set('trust proxy', 1); // Railway/Vercel terminate SSL — trust X-Forwarded-Proto
const PORT = process.env.PORT || 5000;

// Ensure upload directories exist
['covers', 'avatars', 'materials'].forEach((dir) => {
  fs.mkdirSync(path.join(__dirname, '..', 'uploads', dir), { recursive: true });
});

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schedules', scheduleRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
