const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const taskRepository = require('../repositories/taskRepository');
const submissionRepository = require('../repositories/submissionRepository');

async function getAllCourses(req, res) {
  const courses = await courseRepository.findAllPublished();
  res.json(courses);
}

async function getMyCourses(req, res) {
  const { id, role } = req.user;

  if (role === 'TEACHER' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
    const courses = await courseRepository.findByTeacherId(id);
    return res.json(courses);
  }

  // For students: only return ACCEPTED enrollments
  const enrollments = await enrollmentRepository.findAcceptedByUser(id);
  res.json(enrollments.map((e) => e.course));
}

async function getCourseById(req, res) {
  const { id } = req.params;
  const course = await courseRepository.findById(Number(id));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  res.json(course);
}

async function createCourse(req, res) {
  const { title, description, coverImage, teamsLink } = req.body;
  if (!title) return res.status(400).json({ error: 'El título es requerido' });

  const course = await courseRepository.create({ title, description, coverImage, teamsLink, teacherId: req.user.id });
  res.status(201).json(course);
}

async function updateCourse(req, res) {
  const { id } = req.params;
  const { title, description, coverImage, teamsLink, isPublished } = req.body;

  const course = await courseRepository.findRawById(Number(id));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso para editar este curso' });
  }

  const updated = await courseRepository.update(Number(id), { title, description, coverImage, teamsLink, isPublished });
  res.json(updated);
}

async function deleteCourse(req, res) {
  const { id } = req.params;
  const course = await courseRepository.findRawById(Number(id));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar este curso' });
  }

  await courseRepository.remove(Number(id));
  res.json({ message: 'Curso eliminado' });
}

async function enrollCourse(req, res) {
  const { id } = req.params;
  const courseId = Number(id);
  const userId = req.user.id;

  const course = await courseRepository.findRawById(courseId);
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (!course.isPublished) return res.status(403).json({ error: 'No puedes solicitar inscripción en un curso no publicado' });

  const existing = await enrollmentRepository.findByUserAndCourse(userId, courseId);
  if (existing) {
    if (existing.status === 'ACCEPTED') return res.status(409).json({ error: 'Ya estás inscrito en este curso' });
    if (existing.status === 'PENDING') return res.status(409).json({ error: 'Ya tienes una solicitud pendiente' });
    // REJECTED → allow re-request
    const updated = await enrollmentRepository.update(existing.id, { status: 'PENDING' });
    return res.json(updated);
  }

  const enrollment = await enrollmentRepository.create({ userId, courseId, status: 'PENDING' });
  res.status(201).json(enrollment);
}

async function getMyEnrollment(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const enrollment = await enrollmentRepository.findByUserAndCourse(userId, Number(id));
  res.json(enrollment || null);
}

async function getEnrollmentRequests(req, res) {
  const { id } = req.params;
  const course = await courseRepository.findRawById(Number(id));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const requests = await enrollmentRepository.findPendingByCourse(Number(id));
  res.json(requests);
}

async function updateEnrollmentStatus(req, res) {
  const { id, enrollmentId } = req.params;
  const { status } = req.body;

  if (!['ACCEPTED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido. Use ACCEPTED o REJECTED.' });
  }

  const course = await courseRepository.findRawById(Number(id));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const enrollment = await enrollmentRepository.updateStatus(Number(enrollmentId), status);
  res.json(enrollment);
}

async function getCourseStudents(req, res) {
  const { id } = req.params;
  const courseId = Number(id);

  const course = await courseRepository.findRawById(courseId);
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const [enrollments, tasks] = await Promise.all([
    enrollmentRepository.findAcceptedByCourse(courseId),
    taskRepository.findRawByCourse(courseId),
  ]);

  const studentIds = enrollments.map((e) => e.userId);
  const taskIds = tasks.map((t) => t.id);

  const submissions =
    taskIds.length && studentIds.length
      ? await submissionRepository.findByTasksAndStudents(taskIds, studentIds)
      : [];

  const studentsData = enrollments.map((e) => ({
    id: e.user.id,
    name: e.user.name,
    email: e.user.email,
    tasks: tasks.map((task) => {
      const sub = submissions.find((s) => s.taskId === task.id && s.studentId === e.user.id);
      return {
        taskId: task.id,
        taskTitle: task.title,
        maxScore: task.maxScore,
        submissionId: sub?.id ?? null,
        status: sub?.status ?? null,
        score: sub?.score ?? null,
        feedback: sub?.feedback ?? null,
      };
    }),
  }));

  res.json(studentsData);
}

async function getMyGrades(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const courseId = Number(id);

  const enrollment = await enrollmentRepository.findByUserAndCourse(userId, courseId);
  if (!enrollment || enrollment.status !== 'ACCEPTED') {
    return res.status(403).json({ error: 'No tienes acceso a este curso' });
  }

  const tasks = await taskRepository.findRawByCourse(courseId);
  const submissions = await submissionRepository.findByStudentAndTasks(userId, tasks.map((t) => t.id));

  res.json(
    tasks.map((task) => {
      const sub = submissions.find((s) => s.taskId === task.id);
      return {
        taskId: task.id,
        taskTitle: task.title,
        maxScore: task.maxScore,
        dueDate: task.dueDate,
        submitted: !!sub,
        status: sub?.status ?? null,
        score: sub?.score ?? null,
        feedback: sub?.feedback ?? null,
      };
    })
  );
}

module.exports = {
  getAllCourses,
  getMyCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getMyEnrollment,
  getEnrollmentRequests,
  updateEnrollmentStatus,
  getCourseStudents,
  getMyGrades,
};
