const userRepository = require('../repositories/userRepository');
const courseRepository = require('../repositories/courseRepository');

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

async function getAllCoursesAdmin(req, res) {
  const courses = await courseRepository.findAll();
  res.json(courses);
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
  getAllCoursesAdmin,
};
