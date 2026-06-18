const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const curriculumRepository = require('../repositories/curriculumRepository');

async function getCurriculum(req, res) {
  const { courseId } = req.params;
  const { role, id: userId } = req.user;

  const course = await courseRepository.findRawById(Number(courseId));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

  if (role === 'STUDENT') {
    const enrollment = await enrollmentRepository.findByUserAndCourse(userId, Number(courseId));
    if (!enrollment || enrollment.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'No tienes acceso a este curso' });
    }
  } else if (role === 'TEACHER' && course.teacherId !== userId) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const items = await curriculumRepository.findByCourse(Number(courseId));
  res.json(items);
}

async function createCurriculumItem(req, res) {
  const { courseId } = req.params;
  const { title, order } = req.body;

  if (!title) return res.status(400).json({ error: 'El título es requerido' });

  const course = await courseRepository.findRawById(Number(courseId));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const existing = await curriculumRepository.findByCourse(Number(courseId));
  const nextOrder = order !== undefined ? order : existing.length;

  const item = await curriculumRepository.create({
    courseId: Number(courseId),
    title,
    completed: false,
    order: nextOrder,
  });
  res.status(201).json(item);
}

async function updateCurriculumItem(req, res) {
  const { courseId, itemId } = req.params;
  const { title, completed, order } = req.body;

  const course = await courseRepository.findRawById(Number(courseId));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

  const { role, id: userId } = req.user;
  const isOwner = course.teacherId === userId || ['ADMIN', 'SUPER_ADMIN'].includes(role);

  if (!isOwner) {
    if (role === 'STUDENT') {
      const enrollment = await enrollmentRepository.findByUserAndCourse(userId, Number(courseId));
      if (!enrollment || enrollment.status !== 'ACCEPTED') {
        return res.status(403).json({ error: 'No tienes permiso' });
      }
      // Students can only toggle completed
      if (title !== undefined || order !== undefined) {
        return res.status(403).json({ error: 'Solo puedes marcar elementos como completados' });
      }
    } else {
      return res.status(403).json({ error: 'No tienes permiso' });
    }
  }

  const item = await curriculumRepository.findById(Number(itemId));
  if (!item || item.courseId !== Number(courseId)) {
    return res.status(404).json({ error: 'Elemento no encontrado' });
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (completed !== undefined) updateData.completed = completed;
  if (order !== undefined) updateData.order = order;

  const updated = await curriculumRepository.update(Number(itemId), updateData);
  res.json(updated);
}

async function deleteCurriculumItem(req, res) {
  const { courseId, itemId } = req.params;

  const course = await courseRepository.findRawById(Number(courseId));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const item = await curriculumRepository.findById(Number(itemId));
  if (!item || item.courseId !== Number(courseId)) {
    return res.status(404).json({ error: 'Elemento no encontrado' });
  }

  await curriculumRepository.remove(Number(itemId));
  res.json({ message: 'Elemento eliminado' });
}

async function reorderCurriculum(req, res) {
  const { courseId } = req.params;
  const { items } = req.body;

  if (!Array.isArray(items)) return res.status(400).json({ error: 'Items debe ser un array' });

  const course = await courseRepository.findRawById(Number(courseId));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  await curriculumRepository.updateMany(items.map((id, index) => ({ id, order: index })));
  const updated = await curriculumRepository.findByCourse(Number(courseId));
  res.json(updated);
}

module.exports = { getCurriculum, createCurriculumItem, updateCurriculumItem, deleteCurriculumItem, reorderCurriculum };
