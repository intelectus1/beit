const path = require('path');
const fs = require('fs');
const lessonRepository = require('../repositories/lessonRepository');
const materialRepository = require('../repositories/materialRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');

async function getMaterials(req, res) {
  const { lessonId } = req.params;
  const { role, id: userId } = req.user;

  const lesson = await lessonRepository.findById(Number(lessonId));
  if (!lesson) return res.status(404).json({ error: 'Lección no encontrada' });

  if (role === 'STUDENT') {
    const enrollment = await enrollmentRepository.findByUserAndCourse(userId, lesson.course.id);
    if (!enrollment || enrollment.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'No tienes acceso a esta lección' });
    }
  } else if (role === 'TEACHER' && lesson.course.teacherId !== userId) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const materials = await materialRepository.findByLesson(Number(lessonId));
  res.json(materials);
}

async function uploadMaterial(req, res) {
  const { lessonId } = req.params;

  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

  const lesson = await lessonRepository.findById(Number(lessonId));
  if (!lesson) {
    fs.unlink(req.file.path, () => {});
    return res.status(404).json({ error: 'Lección no encontrada' });
  }
  if (lesson.course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    fs.unlink(req.file.path, () => {});
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const material = await materialRepository.create({
    lessonId: Number(lessonId),
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
  });
  res.status(201).json(material);
}

async function downloadMaterial(req, res) {
  const { lessonId, materialId } = req.params;
  const { role, id: userId } = req.user;

  const lesson = await lessonRepository.findById(Number(lessonId));
  if (!lesson) return res.status(404).json({ error: 'Lección no encontrada' });

  if (role === 'STUDENT') {
    const enrollment = await enrollmentRepository.findByUserAndCourse(userId, lesson.course.id);
    if (!enrollment || enrollment.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'No tienes acceso' });
    }
  } else if (role === 'TEACHER' && lesson.course.teacherId !== userId) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const material = await materialRepository.findById(Number(materialId));
  if (!material || material.lessonId !== Number(lessonId)) {
    return res.status(404).json({ error: 'Material no encontrado' });
  }

  const filePath = path.join(__dirname, '..', '..', 'uploads', 'materials', material.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(material.originalName)}"`);
  res.setHeader('Content-Type', material.mimeType);
  res.sendFile(filePath);
}

async function deleteMaterial(req, res) {
  const { lessonId, materialId } = req.params;

  const lesson = await lessonRepository.findById(Number(lessonId));
  if (!lesson) return res.status(404).json({ error: 'Lección no encontrada' });
  if (lesson.course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const material = await materialRepository.findById(Number(materialId));
  if (!material || material.lessonId !== Number(lessonId)) {
    return res.status(404).json({ error: 'Material no encontrado' });
  }

  const filePath = path.join(__dirname, '..', '..', 'uploads', 'materials', material.filename);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {});
  }

  await materialRepository.remove(Number(materialId));
  res.json({ message: 'Material eliminado' });
}

async function streamMaterial(req, res) {
  const { lessonId, materialId } = req.params;
  const { role, id: userId } = req.user;

  const lesson = await lessonRepository.findById(Number(lessonId));
  if (!lesson) return res.status(404).json({ error: 'Lección no encontrada' });

  if (role === 'STUDENT') {
    const enrollment = await enrollmentRepository.findByUserAndCourse(userId, lesson.course.id);
    if (!enrollment || enrollment.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'No tienes acceso' });
    }
  } else if (role === 'TEACHER' && lesson.course.teacherId !== userId) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const material = await materialRepository.findById(Number(materialId));
  if (!material || material.lessonId !== Number(lessonId)) {
    return res.status(404).json({ error: 'Material no encontrado' });
  }

  const filePath = path.join(__dirname, '..', '..', 'uploads', 'materials', material.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
  }

  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Content-Type', material.mimeType);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.sendFile(filePath);
}

module.exports = { getMaterials, uploadMaterial, downloadMaterial, streamMaterial, deleteMaterial };
