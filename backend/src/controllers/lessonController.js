const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const lessonRepository = require('../repositories/lessonRepository');

async function createLesson(req, res) {
  const { courseId } = req.params;
  const { title, description, content, videoUrl, order } = req.body;

  if (!title || !content) return res.status(400).json({ error: 'Título y contenido son requeridos' });

  const course = await courseRepository.findRawById(Number(courseId));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const existing = await lessonRepository.findByCourse(Number(courseId));
  const nextOrder = order !== undefined ? Number(order) : existing.length;

  const lesson = await lessonRepository.create({
    title,
    description: description || null,
    content,
    videoUrl: videoUrl || null,
    order: nextOrder,
    courseId: Number(courseId),
  });
  res.status(201).json(lesson);
}

async function updateLesson(req, res) {
  const { id } = req.params;
  const { title, description, content, videoUrl, order } = req.body;

  const lesson = await lessonRepository.findById(Number(id));
  if (!lesson) return res.status(404).json({ error: 'Lección no encontrada' });
  if (lesson.course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (content !== undefined) updateData.content = content;
  if (videoUrl !== undefined) updateData.videoUrl = videoUrl || null;
  if (order !== undefined) updateData.order = Number(order);

  const updated = await lessonRepository.update(Number(id), updateData);
  res.json(updated);
}

async function deleteLesson(req, res) {
  const { id } = req.params;
  const lesson = await lessonRepository.findById(Number(id));
  if (!lesson) return res.status(404).json({ error: 'Lección no encontrada' });
  if (lesson.course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  await lessonRepository.remove(Number(id));
  res.json({ message: 'Lección eliminada' });
}

async function getLessonById(req, res) {
  const { id } = req.params;
  const lesson = await lessonRepository.findById(Number(id));
  if (!lesson) return res.status(404).json({ error: 'Lección no encontrada' });

  const { role, id: userId } = req.user;

  if (role === 'STUDENT') {
    const enrollment = await enrollmentRepository.findByUserAndCourse(userId, lesson.course.id);
    if (!enrollment || enrollment.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'No tienes acceso a este curso' });
    }
  } else if (role === 'TEACHER' && lesson.course.teacherId !== userId) {
    return res.status(403).json({ error: 'No tienes permiso para ver esta lección' });
  }

  const { course: _course, ...lessonData } = lesson;
  const isOwner = lesson.course.teacherId === userId || ['ADMIN', 'SUPER_ADMIN'].includes(role);
  res.json({ ...lessonData, courseId: lesson.course.id, isOwner });
}

async function reorderLessons(req, res) {
  const { courseId } = req.params;
  const { lessonIds } = req.body;

  if (!Array.isArray(lessonIds)) return res.status(400).json({ error: 'lessonIds debe ser un array' });

  const course = await courseRepository.findRawById(Number(courseId));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  await lessonRepository.reorderMany(lessonIds.map((id, index) => ({ id: Number(id), order: index })));
  const lessons = await lessonRepository.findByCourse(Number(courseId));
  res.json(lessons);
}

module.exports = { createLesson, updateLesson, deleteLesson, getLessonById, reorderLessons };
