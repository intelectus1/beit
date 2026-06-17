# PRD — Aula Virtual BEIT

**Versión:** 2.0  
**Fecha:** 2026-06-17  
**Estado:** En desarrollo activo  
**Anterior:** v1.0 (2026-06-15)

---

## Cambios respecto a v1.0

| Área | Cambio |
|---|---|
| Roles | Añadido `SUPER_ADMIN` con panel dedicado y flujo de aprobación de profesores |
| Auth | Registro de profesor pasa a `PENDING_APPROVAL`; login bloqueado hasta aprobación |
| Backend | Arquitectura refactorizada a MVC + DAO (repositorios por entidad) |
| Cursos | Campo `teamsLink` para enlace de clase en Microsoft Teams |
| Inscripciones | Alumnos rechazados pueden volver a solicitar inscripción |
| Seed | Segundo Super Admin `mportuguez@beitperu.com` añadido |
| Landing | Página de inicio pública con animaciones (FloatingPaths, SplineScene, GooeyText, Testimonios) |
| UI | Navbar oculto en landing y páginas de auth |
| Modelo | `UserStatus` enum: `ACTIVE`, `PENDING_APPROVAL`, `REJECTED` |
| Rutas API | Rutas de admin `/api/admin/teachers/*` completamente implementadas |

---

## 1. Resumen ejecutivo

**Aula Virtual BEIT** es una plataforma de educación en línea privada de BEIT Peru. Permite a profesores crear y gestionar cursos con lecciones, tareas y clases en Microsoft Teams. Los alumnos se inscriben, acceden al contenido y entregan trabajos. El acceso de docentes requiere aprobación previa por un Super Administrador, garantizando control institucional completo sobre quién imparte clases.

---

## 2. Problema que resuelve

Las instituciones educativas carecen de una herramienta unificada que:
- Controle quién puede crear cursos (aprobación de profesores)
- Gestione inscripciones con validación manual por el docente
- Cierre el ciclo completo de evaluación (tarea → entrega → calificación)
- Integre clases en vivo (Teams) desde la misma plataforma

---

## 3. Usuarios y roles

| Rol | Descripción | Cómo se crea |
|---|---|---|
| `STUDENT` | Alumno. Solicita inscripción, accede a contenido aceptado, entrega tareas, consulta notas. | Registro libre → activo inmediato |
| `TEACHER` | Docente. CRUD de sus cursos, lecciones y tareas. Gestiona inscripciones y califica. | Registro → `PENDING_APPROVAL` → requiere aprobación de SUPER_ADMIN |
| `ADMIN` | Mismos permisos que TEACHER sobre cualquier curso. | Creado manualmente en DB |
| `SUPER_ADMIN` | Acceso al panel de administración. Aprueba / rechaza solicitudes de registro de profesores. Redirigido a `/superadmin` al iniciar sesión. | Seed / DB directa |

### Estados de usuario (`UserStatus`)

```
PENDING_APPROVAL  →  ACTIVE    (aprobado por SUPER_ADMIN)
PENDING_APPROVAL  →  REJECTED  (rechazado por SUPER_ADMIN)
```

---

## 4. Flujos principales

### 4.1 Registro y autenticación

```
Alumno:   Registro → ACTIVE → Login → Dashboard
Profesor: Registro → PENDING_APPROVAL → en espera
          SUPER_ADMIN aprueba → ACTIVE → el profesor puede hacer login
          SUPER_ADMIN rechaza → REJECTED → login bloqueado con mensaje
```

- JWT de 7 días almacenado en `localStorage`, enviado como `Authorization: Bearer <token>`.
- `GET /api/auth/me` restaura sesión al montar la app.
- Redirección según rol al iniciar sesión:
  - `SUPER_ADMIN` → `/superadmin`
  - Resto → `/dashboard`

### 4.2 Ciclo de vida de un curso

```
Profesor crea curso (borrador)
  → agrega lecciones y tareas
  → opcionalmente añade Teams link
  → publica el curso → visible en catálogo

Alumnos solicitan inscripción
  Profesor (tab "Solicitudes") acepta o rechaza
    ACCEPTED → alumno accede a lecciones, tareas, calificaciones y Teams link
    REJECTED → alumno puede volver a solicitar
```

### 4.3 Ciclo de evaluación

```
Alumno (aceptado) → abre tarea → entrega contenido + fileUrl opcional
Profesor (tab "Estudiantes y Calificaciones") → ve entrega → ingresa nota
Alumno → ve nota y feedback en "Mis Calificaciones"
```

---

## 5. Funcionalidades implementadas

### 5.1 Landing page pública

| Funcionalidad | Estado |
|---|---|
| Página de inicio animada accesible sin login | ✅ |
| Componente FloatingPaths (fondo animado SVG) | ✅ |
| Componente SplineScene (escena 3D) | ✅ |
| Componente GooeyText (texto animado) | ✅ |
| ContainerScrollAnimation (parallax en scroll) | ✅ |
| TestimonialSlider (carrusel de testimonios) | ✅ |
| Redirección automática si ya hay sesión activa | ✅ |
| Navbar oculto en landing, login y registro | ✅ |

### 5.2 Autenticación

| Funcionalidad | Estado |
|---|---|
| Registro de alumno (activo inmediato) | ✅ |
| Registro de profesor (PENDING_APPROVAL) | ✅ |
| Mensaje informativo al registrar como profesor | ✅ |
| Login bloqueado para PENDING_APPROVAL con mensaje claro | ✅ |
| Login bloqueado para REJECTED con mensaje claro | ✅ |
| JWT con expiración de 7 días | ✅ |
| Restauración de sesión al recargar (`/api/auth/me`) | ✅ |

### 5.3 Panel Super Admin (`/superadmin`)

| Funcionalidad | Estado |
|---|---|
| Vista exclusiva para `SUPER_ADMIN` | ✅ |
| Contador de profesores pendientes de aprobación | ✅ |
| Listado de profesores `PENDING_APPROVAL` con fecha de solicitud | ✅ |
| Aprobar profesor → estado `ACTIVE` | ✅ |
| Rechazar profesor → estado `REJECTED` | ✅ |
| Spinners individuales por acción | ✅ |
| Botón de actualización manual | ✅ |
| Estado vacío cuando no hay solicitudes | ✅ |

### 5.4 Dashboard (`/dashboard`)

| Funcionalidad | Estado |
|---|---|
| Vista personalizada por rol (profesor / alumno) | ✅ |
| Stat: cursos creados / inscritos | ✅ |
| Stat: total alumnos (profesor) / lecciones disponibles (alumno) | ✅ |
| Stat: rol del usuario | ✅ |
| Grid de cursos con badge "Borrador" | ✅ |
| CTA "Nuevo curso" para profesores | ✅ |
| CTA "Explorar cursos" para alumnos | ✅ |
| Estado vacío con CTA contextual | ✅ |

### 5.5 Catálogo de cursos (`/courses`)

| Funcionalidad | Estado |
|---|---|
| Listado público de cursos publicados | ✅ |
| Acceso al detalle sin login | ✅ |

### 5.6 Detalle de curso (`/courses/:id`)

| Funcionalidad | Estado |
|---|---|
| Hero con título, descripción, instructor, alumnos, lecciones | ✅ |
| Badge Publicado / Borrador | ✅ |
| Publicar / Despublicar (dueño del curso) | ✅ |
| Modal de edición: título, descripción, Teams link | ✅ |
| Enlace Teams visible solo para alumnos ACCEPTED | ✅ |
| Listado de lecciones ordenado por `order` | ✅ |
| Listado de tareas con fecha de entrega y puntaje máximo | ✅ |
| Acceso a lección/tarea bloqueado para no inscritos | ✅ |
| Sidebar con resumen + botón de inscripción | ✅ |
| Sección "Mis Calificaciones" para alumnos ACCEPTED | ✅ |

#### Tabs del profesor en detalle de curso

| Tab | Funcionalidad | Estado |
|---|---|---|
| Contenido | Lecciones + tareas con botones de creación | ✅ |
| Solicitudes | Lista PENDING con Aceptar / Rechazar | ✅ |
| Solicitudes | Badge en tiempo real con conteo de pendientes | ✅ |
| Estudiantes y Calificaciones | Acordeón expandible por alumno | ✅ |
| Estudiantes y Calificaciones | Estado de cada tarea por alumno | ✅ |
| Estudiantes y Calificaciones | Input inline de nota + botón Guardar por entrega | ✅ |
| Estudiantes y Calificaciones | Muestra nota/máximo cuando ya está calificada | ✅ |

#### Botón de inscripción (alumno)

| Estado | Comportamiento |
|---|---|
| Sin sesión | Link "Inicia sesión para inscribirte" |
| No inscrito / curso no publicado | Mensaje informativo |
| No inscrito / curso publicado | Botón "Solicitar Inscripción" |
| `PENDING` | Mensaje "Solicitud pendiente de aprobación" |
| `REJECTED` | Mensaje + botón "Volver a solicitar" |
| `ACCEPTED` | Mensaje "Ya estás inscrito" |

### 5.7 Lecciones

| Funcionalidad | Estado |
|---|---|
| Crear lección (título, contenido, orden, videoUrl opcional) | ✅ |
| Ver lección (dueño del curso o alumno ACCEPTED) | ✅ |
| Editar lección | ✅ |
| Eliminar lección | ✅ |
| Control de acceso: alumno necesita inscripción ACCEPTED | ✅ |
| Control de acceso: profesor solo ve sus propias lecciones | ✅ |

### 5.8 Tareas

| Funcionalidad | Estado |
|---|---|
| Crear tarea (título, descripción, fecha límite, puntaje máximo) | ✅ |
| Ver tarea (dueño o alumno ACCEPTED) | ✅ |
| Editar tarea | ✅ |
| Eliminar tarea | ✅ |
| Alumno entrega tarea (texto + fileUrl opcional) | ✅ |
| Una sola entrega por alumno por tarea | ✅ |
| Profesor ve todas las entregas de una tarea | ✅ |
| Profesor califica (score + feedback opcional) | ✅ |
| Validación: nota entre 0 y maxScore | ✅ |
| Estado `GRADED` con timestamp `gradedAt` | ✅ |
| Alumno ve su entrega propia | ✅ |

---

## 6. Arquitectura técnica

### Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite, React Router v6, Tailwind CSS v4, Axios, lucide-react, react-hot-toast |
| Backend | Node.js, Express v5 (CommonJS), Puerto 5000 |
| Base de datos | PostgreSQL + Prisma v7 (`@prisma/adapter-pg`) |
| Auth | JWT 7 días (`jsonwebtoken`), bcryptjs |

### Patrón arquitectónico backend — MVC + DAO

Los controladores contienen lógica de negocio (validaciones, checks de permisos) y delegan **todas** las consultas a la base de datos en repositorios. Los repositorios son envoltorios delgados sobre Prisma sin lógica de negocio.

```
backend/src/
├── config/
│   └── database.js              # Singleton PrismaClient
├── repositories/                # Capa DAO — solo consultas Prisma
│   ├── userRepository.js        # findByEmail, findById, findRawById, create, updateStatus, findPendingTeachers
│   ├── courseRepository.js      # findAllPublished, findByTeacherId, findById, findRawById, create, update, remove
│   ├── enrollmentRepository.js  # findByUserAndCourse, findAcceptedByUser, findPendingByCourse, findAcceptedByCourse, create, update, updateStatus
│   ├── lessonRepository.js      # findById, create, update, remove
│   ├── taskRepository.js        # findByCourse, findRawByCourse, findById, findRawById, create, update, remove
│   └── submissionRepository.js  # findByTaskAndStudent, findById, findByTask, findByTasksAndStudents, findByStudentAndTasks, create, update
├── controllers/                 # Lógica de negocio — usa repositorios
│   ├── authController.js
│   ├── courseController.js
│   ├── lessonController.js
│   ├── taskController.js
│   └── adminController.js
├── routes/                      # Express routers
│   ├── auth.js, courses.js, lessons.js, tasks.js, admin.js
├── middleware/
│   └── auth.js                  # authenticate (JWT) + requireRole
└── seed.js
```

**Regla:** ningún controlador importa `config/database.js` directamente.

### Modelo de datos

```
User
  id, name, email, password(hash), role(ADMIN|TEACHER|STUDENT|SUPER_ADMIN)
  status(ACTIVE|PENDING_APPROVAL|REJECTED), createdAt

Course
  id, title, description?, coverImage?, teamsLink?, isPublished, teacherId→User
  createdAt, updatedAt

Enrollment
  id, userId→User, courseId→Course
  status(PENDING|ACCEPTED|REJECTED), enrolledAt
  unique(userId, courseId)

Lesson
  id, title, content, order, videoUrl?, courseId→Course
  createdAt, updatedAt

Task
  id, title, description, dueDate?, maxScore(100), courseId→Course, createdAt

Submission
  id, content, fileUrl?, score?, feedback?, status(SUBMITTED|GRADED)
  taskId→Task, studentId→User, submittedAt, gradedAt?
  unique(taskId, studentId)
```

Cascade delete: eliminar `Course` elimina `Lesson[]`, `Task[]`, `Enrollment[]` y `Submission[]` asociados.

---

## 7. API — Mapa de rutas

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | — | Registro |
| POST | `/api/auth/login` | No | — | Login → JWT |
| GET | `/api/auth/me` | Sí | Todos | Sesión activa |
| GET | `/api/courses` | No | — | Catálogo público |
| GET | `/api/courses/my` | Sí | Todos | Cursos propios / inscritos |
| GET | `/api/courses/:id` | No | — | Detalle de curso |
| POST | `/api/courses` | Sí | TEACHER, ADMIN, SUPER_ADMIN | Crear curso |
| PUT | `/api/courses/:id` | Sí | TEACHER, ADMIN, SUPER_ADMIN | Editar curso |
| DELETE | `/api/courses/:id` | Sí | TEACHER, ADMIN, SUPER_ADMIN | Eliminar curso |
| POST | `/api/courses/:id/enroll` | Sí | STUDENT | Solicitar inscripción |
| GET | `/api/courses/:id/my-enrollment` | Sí | STUDENT | Estado de inscripción propia |
| GET | `/api/courses/:id/my-grades` | Sí | STUDENT | Calificaciones propias |
| GET | `/api/courses/:id/enrollment-requests` | Sí | TEACHER, ADMIN, SUPER_ADMIN | Solicitudes PENDING |
| PUT | `/api/courses/:id/enrollments/:enrollmentId` | Sí | TEACHER, ADMIN, SUPER_ADMIN | Aceptar / rechazar |
| GET | `/api/courses/:id/students` | Sí | TEACHER, ADMIN, SUPER_ADMIN | Alumnos + calificaciones |
| POST | `/api/courses/:courseId/lessons` | Sí | TEACHER, ADMIN, SUPER_ADMIN | Crear lección |
| GET | `/api/lessons/:id` | Sí | Todos | Ver lección |
| PUT | `/api/lessons/:id` | Sí | TEACHER, ADMIN | Editar lección |
| DELETE | `/api/lessons/:id` | Sí | TEACHER, ADMIN | Eliminar lección |
| GET | `/api/courses/:courseId/tasks` | Sí | Todos | Tareas del curso |
| POST | `/api/courses/:courseId/tasks` | Sí | TEACHER, ADMIN, SUPER_ADMIN | Crear tarea |
| GET | `/api/tasks/:id` | Sí | Todos | Ver tarea |
| PUT | `/api/tasks/:id` | Sí | TEACHER, ADMIN | Editar tarea |
| DELETE | `/api/tasks/:id` | Sí | TEACHER, ADMIN | Eliminar tarea |
| POST | `/api/tasks/:id/submit` | Sí | STUDENT | Entregar tarea |
| GET | `/api/tasks/:id/submissions` | Sí | TEACHER, ADMIN | Ver todas las entregas |
| GET | `/api/tasks/:id/my-submission` | Sí | STUDENT | Ver entrega propia |
| PUT | `/api/tasks/submissions/:submissionId/grade` | Sí | TEACHER, ADMIN | Calificar entrega |
| GET | `/api/admin/teachers/pending` | Sí | SUPER_ADMIN | Profesores pendientes |
| PUT | `/api/admin/teachers/:id/approve` | Sí | SUPER_ADMIN | Aprobar profesor |
| PUT | `/api/admin/teachers/:id/reject` | Sí | SUPER_ADMIN | Rechazar profesor |
| GET | `/api/health` | No | — | Health check |

---

## 8. Configuración y despliegue

### Variables de entorno (`backend/.env`)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=<secreto_seguro>
PORT=5000
```

### Setup inicial

```bash
# Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run db:generate
npm run db:seed   # crea usuarios y curso demo
npm run dev       # puerto 5000

# Frontend
cd frontend
npm install
npm run dev       # puerto 5173
```

---

## 9. Datos semilla

El script `backend/src/seed.js` crea los siguientes registros si no existen:

| Nombre | Email | Contraseña | Rol |
|---|---|---|---|
| Super Admin | admin@beit.academy | AdminBeit2026! | SUPER_ADMIN |
| BEIT | mportuguez@beitperu.com | Beitperu2026$ | SUPER_ADMIN |
| Carlos García | profesor@beit.academy | beit2025 | TEACHER (ACTIVE) |
| María López | alumno@beit.academy | beit2025 | STUDENT |

Además crea el curso demo "Introducción a Node.js" con 1 lección, 1 tarea y la alumna demo inscrita (ACCEPTED).

---

## 10. Diseño visual

- **Tema:** Oscuro completo en toda la app (no hay modo claro)
- **Paleta:** `zinc-950` fondo · `zinc-900` cards · `zinc-800` bordes · `indigo-500` CTAs principales
- **Framework CSS:** Tailwind CSS v4
- **Tipografía:** Inter (sistema)
- **Feedback:** `react-hot-toast` (toast top-right con tema oscuro)
- **Iconografía:** `lucide-react`
- **Navbar:** Oculto en `/`, `/login`, `/register`

---

## 11. Backlog y próximas funcionalidades

| Funcionalidad | Prioridad | Notas |
|---|---|---|
| Reproductor de video en lecciones | Alta | El campo `videoUrl` existe; falta el player (YouTube embed / HLS). |
| Carga de archivos reales | Alta | `fileUrl` y `coverImage` son texto libre; integrar con S3 o almacenamiento local. |
| Notificaciones por email | Media | Al aprobar inscripción, al calificar tarea, al aprobar cuenta de profesor. |
| Búsqueda y filtros en catálogo | Media | Por instructor, categoría, estado de publicación. |
| Categorías / etiquetas de cursos | Media | Añadir campo `category` al modelo `Course`. |
| Panel ADMIN completo | Media | Gestión de todos los usuarios y cursos desde una sola vista. |
| Re-entrega de tareas | Baja | Actualmente solo se permite una entrega por tarea. |
| Feedback visible en la página de tarea | Baja | El feedback existe en el modelo pero solo aparece en "Mis Calificaciones". |
| Estadísticas para el profesor | Baja | Promedio del grupo, tasa de entrega, progreso por alumno. |
| Recuperación de contraseña | Baja | Flujo por email (requiere servicio de email). |
| Paginación en catálogo y listados | Baja | Necesario a partir de ~50 cursos o alumnos. |
| Exportación de calificaciones a CSV | Baja | Para informes académicos. |
| Modo claro | Baja | El diseño actual solo contempla tema oscuro. |
