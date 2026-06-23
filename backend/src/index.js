require('dotenv').config();
// Railway's postgres-ssl uses a self-signed cert; disable TLS cert validation for internal connections
if (process.env.NODE_ENV === 'production') process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');
const taskRoutes = require('./routes/tasks');
const adminRoutes = require('./routes/admin');
const scheduleRoutes = require('./routes/schedules');

const app = express();
app.set('trust proxy', 1); // Railway/Vercel terminate SSL — trust X-Forwarded-Proto
const PORT = process.env.PORT || 5000;

// ── Security hardening ───────────────────────────────────────────────────────

// 1. Remove server-fingerprinting headers
app.use((req, res, next) => {
  res.removeHeader('Server');
  next();
});

// 2. Enforce HttpOnly + Secure + SameSite=Lax on every Set-Cookie header.
//    This app uses JWT Bearer tokens (no server-side sessions), but this acts
//    as a defensive net in case any dependency ever sets a cookie.
app.use((req, res, next) => {
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = function secureSetHeader(name, value) {
    if (name.toLowerCase() === 'set-cookie') {
      const cookies = Array.isArray(value) ? value : [value];
      const hardened = cookies.map((c) => {
        if (typeof c !== 'string') return c;
        if (!/;\s*httponly/i.test(c)) c += '; HttpOnly';
        if (!/;\s*secure/i.test(c)) c += '; Secure';
        if (!/;\s*samesite/i.test(c)) c += '; SameSite=Lax';
        return c;
      });
      return originalSetHeader(name, hardened.length === 1 ? hardened[0] : hardened);
    }
    return originalSetHeader(name, value);
  };
  next();
});

// 3. Reject requests that attempt to pass auth tokens via URL query params.
//    ZAP flags "Session ID in URL Rewrite" — this explicitly blocks that vector.
//    Legitimate clients must use Authorization: Bearer <token>.
app.use((req, res, next) => {
  const suspectParams = ['token', 'access_token', 'auth_token', 'jwt', 'session', 'sid'];
  const found = suspectParams.find((p) => req.query[p] !== undefined);
  if (found) {
    return res.status(400).json({ error: 'Autenticación por URL no permitida' });
  }
  next();
});

// 4. Helmet: CSP without wildcards + all standard security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        // 'https:' wildcard removed — only explicit self and data URIs
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'self'"],
      },
    },
    // Allow /uploads images to load cross-origin (React frontend different domain)
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // HSTS — Railway terminates SSL; trust proxy makes req.secure true for HTTPS
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'sameorigin' },
    noSniff: true,
    hidePoweredBy: true,
  })
);
// ─────────────────────────────────────────────────────────────────────────────

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
