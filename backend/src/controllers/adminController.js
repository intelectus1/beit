const path = require('path');
const fs = require('fs');
const userRepository = require('../repositories/userRepository');
const courseRepository = require('../repositories/courseRepository');
const materialRepository = require('../repositories/materialRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');

async function getPendingTeachers(req, res) {
  const teachers = await userRepository.findPendingTeachers();
  res.json(teachers);
}

async function approveTeacher(req, res) {
  const { id } = req.params;
  const user = await userRepository.findRawById(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.role !== 'TEACHER') return res.status(400).json({ error: 'El usuario no es un profesor' });

  const updated = await userRepository.updateStatus(Number(id), 'ACTIVE');
  res.json(updated);
}

async function rejectTeacher(req, res) {
  const { id } = req.params;
  const user = await userRepository.findRawById(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.role !== 'TEACHER') return res.status(400).json({ error: 'El usuario no es un profesor' });

  const updated = await userRepository.updateStatus(Number(id), 'REJECTED');
  res.json(updated);
}

async function getAllTeachers(req, res) {
  const { search } = req.query;
  const teachers = await userRepository.findAllTeachers(search || '');
  res.json(teachers);
}

async function getTeacherById(req, res) {
  const { id } = req.params;
  const teachers = await userRepository.findAllTeachers('');
  const teacher = teachers.find((t) => t.id === Number(id));
  if (!teacher) return res.status(404).json({ error: 'Profesor no encontrado' });
  res.json(teacher);
}

async function updateTeacher(req, res) {
  const { id } = req.params;
  const { name, email } = req.body;

  const user = await userRepository.findRawById(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.role !== 'TEACHER') return res.status(400).json({ error: 'El usuario no es un profesor' });

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;

  const updated = await userRepository.update(Number(id), updateData);
  res.json(updated);
}

async function toggleTeacherStatus(req, res) {
  const { id } = req.params;
  const user = await userRepository.findRawById(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.role !== 'TEACHER') return res.status(400).json({ error: 'El usuario no es un profesor' });

  const newStatus = user.status === 'ACTIVE' ? 'REJECTED' : 'ACTIVE';
  const updated = await userRepository.updateStatus(Number(id), newStatus);
  res.json(updated);
}

async function getAllStudents(req, res) {
  const { search } = req.query;
  const students = await userRepository.findAllStudents(search || '');
  res.json(students);
}

async function deleteStudent(req, res) {
  try {
    const { id } = req.params;
    const user = await userRepository.findRawById(Number(id));
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.role !== 'STUDENT') return res.status(400).json({ error: 'El usuario no es un alumno' });
    await userRepository.softDelete(Number(id));
    res.json({ message: 'Alumno eliminado (puede restaurarse desde la papelera)' });
  } catch (e) {
    res.status(500).json({ error: 'Función no disponible hasta agregar columna deletedAt en la base de datos' });
  }
}

async function getDeletedStudents(req, res) {
  try {
    const { search } = req.query;
    const students = await userRepository.findDeletedStudents(search || '');
    res.json(students);
  } catch (e) {
    res.status(500).json({ error: 'Función no disponible hasta agregar columna deletedAt en la base de datos' });
  }
}

async function restoreStudent(req, res) {
  try {
    const { id } = req.params;
    const user = await userRepository.findRawById(Number(id));
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.role !== 'STUDENT') return res.status(400).json({ error: 'El usuario no es un alumno' });
    const restored = await userRepository.restore(Number(id));
    res.json(restored);
  } catch (e) {
    res.status(500).json({ error: 'Función no disponible hasta agregar columna deletedAt en la base de datos' });
  }
}

async function getAllCoursesAdmin(req, res) {
  const courses = await courseRepository.findAll();
  res.json(courses);
}

async function deleteCourse(req, res) {
  const { id } = req.params;

  const course = await courseRepository.findById(Number(id));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

  // Delete physical material files before cascade
  const lessonIds = (course.lessons || []).map((l) => l.id);
  if (lessonIds.length) {
    const materials = await materialRepository.findByLessonIds(lessonIds);
    for (const mat of materials) {
      const filePath = path.join(__dirname, '..', '..', 'uploads', 'materials', mat.filename);
      if (fs.existsSync(filePath)) fs.unlink(filePath, () => {});
    }
  }

  // Delete cover image if present
  if (course.coverImage) {
    try {
      const coverFilename = course.coverImage.split('/').pop();
      const coverPath = path.join(__dirname, '..', '..', 'uploads', 'covers', coverFilename);
      if (fs.existsSync(coverPath)) fs.unlink(coverPath, () => {});
    } catch { /* ignore malformed URL */ }
  }

  await courseRepository.remove(Number(id));
  res.json({ message: 'Curso eliminado permanentemente' });
}

module.exports = {
  getPendingTeachers,
  approveTeacher,
  rejectTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  toggleTeacherStatus,
  getAllStudents,
  deleteStudent,
  getDeletedStudents,
  restoreStudent,
  getAllCoursesAdmin,
  deleteCourse,
};
