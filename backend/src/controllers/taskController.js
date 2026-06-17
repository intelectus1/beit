const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const taskRepository = require('../repositories/taskRepository');
const submissionRepository = require('../repositories/submissionRepository');

async function getCourseTasks(req, res) {
  const { courseId } = req.params;
  const courseId_num = Number(courseId);
  const { role, id: userId } = req.user;

  if (role === 'STUDENT') {
    const enrollment = await enrollmentRepository.findByUserAndCourse(userId, courseId_num);
    if (!enrollment || enrollment.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'No tienes acceso a este curso' });
    }
  } else if (role === 'TEACHER') {
    const course = await courseRepository.findRawById(courseId_num);
    if (!course || course.teacherId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }
  }

  const tasks = await taskRepository.findByCourse(courseId_num);
  res.json(tasks);
}

async function createTask(req, res) {
  const { courseId } = req.params;
  const { title, description, dueDate, maxScore } = req.body;

  if (!title || !description) return res.status(400).json({ error: 'Título y descripción son requeridos' });

  const course = await courseRepository.findRawById(Number(courseId));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const task = await taskRepository.create({
    title,
    description,
    dueDate: dueDate ? new Date(dueDate) : null,
    maxScore: maxScore || 100,
    courseId: Number(courseId),
  });
  res.status(201).json(task);
}

async function updateTask(req, res) {
  const { id } = req.params;
  const { title, description, dueDate, maxScore } = req.body;

  const task = await taskRepository.findById(Number(id));
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  if (task.course.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const updated = await taskRepository.update(Number(id), {
    title, description, dueDate: dueDate ? new Date(dueDate) : undefined, maxScore,
  });
  res.json(updated);
}

async function deleteTask(req, res) {
  const { id } = req.params;
  const task = await taskRepository.findById(Number(id));
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  if (task.course.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  await taskRepository.remove(Number(id));
  res.json({ message: 'Tarea eliminada' });
}

async function getTaskById(req, res) {
  const { id } = req.params;
  const task = await taskRepository.findById(Number(id));
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

  const { role, id: userId } = req.user;

  if (role === 'STUDENT') {
    const enrollment = await enrollmentRepository.findByUserAndCourse(userId, task.courseId);
    if (!enrollment || enrollment.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'No tienes acceso a este curso' });
    }
  } else if (role === 'TEACHER' && task.course.teacherId !== userId) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const { course: _course, ...taskData } = task;
  res.json(taskData);
}

async function submitTask(req, res) {
  const { id } = req.params;
  const { content, fileUrl } = req.body;
  const studentId = req.user.id;

  if (!content) return res.status(400).json({ error: 'El contenido de la entrega es requerido' });

  const task = await taskRepository.findRawById(Number(id));
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

  const enrollment = await enrollmentRepository.findByUserAndCourse(studentId, task.courseId);
  if (!enrollment || enrollment.status !== 'ACCEPTED') {
    return res.status(403).json({ error: 'No tienes acceso a este curso' });
  }

  const existing = await submissionRepository.findByTaskAndStudent(Number(id), studentId);
  if (existing) return res.status(409).json({ error: 'Ya enviaste esta tarea' });

  const submission = await submissionRepository.create({ content, fileUrl, taskId: Number(id), studentId });
  res.status(201).json(submission);
}

async function gradeSubmission(req, res) {
  const { submissionId } = req.params;
  const { score, feedback } = req.body;

  if (score === undefined) return res.status(400).json({ error: 'La calificación es requerida' });

  const submission = await submissionRepository.findById(Number(submissionId));
  if (!submission) return res.status(404).json({ error: 'Entrega no encontrada' });
  if (submission.task.course.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  if (score < 0 || score > submission.task.maxScore) {
    return res.status(400).json({ error: `La calificación debe estar entre 0 y ${submission.task.maxScore}` });
  }

  const updated = await submissionRepository.update(Number(submissionId), {
    score, feedback, status: 'GRADED', gradedAt: new Date(),
  });
  res.json(updated);
}

async function getTaskSubmissions(req, res) {
  const { id } = req.params;
  const task = await taskRepository.findById(Number(id));
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  if (task.course.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const submissions = await submissionRepository.findByTask(Number(id));
  res.json(submissions);
}

async function getMySubmission(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  const task = await taskRepository.findRawById(Number(id));
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

  const enrollment = await enrollmentRepository.findByUserAndCourse(userId, task.courseId);
  if (!enrollment || enrollment.status !== 'ACCEPTED') {
    return res.status(403).json({ error: 'No tienes acceso a este curso' });
  }

  const submission = await submissionRepository.findByTaskAndStudent(Number(id), userId);
  if (!submission) return res.status(404).json({ error: 'No tienes entrega para esta tarea' });
  res.json(submission);
}

module.exports = {
  getCourseTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  submitTask,
  gradeSubmission,
  getTaskSubmissions,
  getMySubmission,
};
