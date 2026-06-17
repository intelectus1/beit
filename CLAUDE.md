# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack virtual classroom application with two independent sub-projects:
- `backend/` — Node.js + Express REST API (CommonJS, port 5000)
- `frontend/` — React + Vite SPA (ESM, port 5173)

## Commands

### Backend (`cd backend` first)
```bash
npm run dev          # Start with nodemon (watch mode)
npm run start        # Start production
npm run db:migrate   # Run Prisma migrations (prompts for migration name)
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:studio    # Open Prisma Studio GUI
```

### Frontend (`cd frontend` first)
```bash
npm run dev     # Start Vite dev server
npm run build   # Production build
npm run lint    # ESLint
npm run preview # Preview production build
```

### First-time setup
```bash
# 1. Configure backend/.env with a real DATABASE_URL
# 2. Run migration
cd backend && npx prisma migrate dev --name init
# 3. Start both servers
cd backend && npm run dev   # terminal 1
cd frontend && npm run dev  # terminal 2
```

## Architecture

### Backend structure
```
backend/src/
├── index.js              # Express app entry, CORS, route mounting
├── config/
│   └── database.js       # PrismaClient singleton (uses @prisma/adapter-pg)
├── repositories/         # DAO layer — pure Prisma queries, no business logic
│   ├── userRepository.js
│   ├── courseRepository.js
│   ├── enrollmentRepository.js
│   ├── lessonRepository.js
│   ├── taskRepository.js
│   └── submissionRepository.js
├── controllers/          # Business logic: uses repositories, handles auth checks
│   ├── authController.js
│   ├── courseController.js
│   ├── lessonController.js
│   ├── taskController.js
│   └── adminController.js
├── routes/               # Express routers wiring controllers + middleware
│   ├── auth.js, courses.js, lessons.js, tasks.js, admin.js
├── middleware/auth.js    # JWT verify (authenticate) + role guard (requireRole)
└── seed.js               # Database seed script
```

**MVC + DAO pattern:** Controllers contain business logic and delegate all database access to repositories. Repositories are thin wrappers around Prisma with no business logic — one file per entity. Controllers never import Prisma directly.

**Prisma v7 specifics:** The datasource URL is in `prisma.config.ts` (not in `schema.prisma`). The `PrismaClient` is instantiated with `@prisma/adapter-pg` — do not remove the adapter or revert to the classic `new PrismaClient()` pattern. After any schema change, always run `npm run db:generate`.

**Auth flow:** JWT tokens are issued on login/register, stored in `localStorage` on the client, and sent as `Authorization: Bearer <token>`. The `authenticate` middleware decodes the token and sets `req.user = { id, email, role }`.

**Role enforcement:** `requireRole('TEACHER', 'ADMIN')` is composed after `authenticate`. Ownership checks (e.g., `course.teacherId !== req.user.id`) are done inside controllers, not middleware.

### Frontend structure
```
frontend/src/
├── App.jsx               # BrowserRouter, route definitions, PrivateRoute guard
├── context/AuthContext.jsx  # Global user state + login/logout helpers
├── lib/api.js            # Axios instance with token interceptor + 401 redirect
├── components/Navbar.jsx
└── pages/                # One file per route/screen
```

**API calls:** All requests go through `src/lib/api.js` (an Axios instance). The Vite dev server proxies `/api/*` to `http://localhost:5000`, so never hardcode the backend URL in frontend code.

**Auth state:** `AuthContext` initialises by calling `GET /api/auth/me` on mount if a token exists in `localStorage`. `PrivateRoute` redirects to `/login` when `user` is null after loading completes.

### Data model relationships
- `User` → `Course` (teacherId, one-to-many via "TeacherCourses")
- `User` ↔ `Course` (many-to-many via `Enrollment`)
- `Course` → `Lesson[]`, `Task[]` (cascade delete)
- `Task` → `Submission[]` (unique per student+task pair)
- `Submission` status: `SUBMITTED` → `GRADED`

### API route map
| Prefix | File | Notes |
|--------|------|-------|
| `/api/auth` | `routes/auth.js` | Public: POST /register, /login. Auth: GET /me |
| `/api/courses` | `routes/courses.js` | GET / is public; mutations require TEACHER/ADMIN |
| `/api/lessons` | `routes/lessons.js` | GET /:id requires auth; mutations require TEACHER/ADMIN |
| `/api/tasks` | `routes/tasks.js` | GET /:id requires auth; submit requires STUDENT; grade requires TEACHER/ADMIN |

Courses route also nests lesson and task creation: `POST /api/courses/:courseId/lessons` and `POST /api/courses/:courseId/tasks`.
