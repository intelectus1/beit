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

async function deleteTeacher(req, res) {
  const { id } = req.params;
  const user = await userRepository.findRawById(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.role !== 'TEACHER') return res.status(400).json({ error: 'El usuario no es un profesor' });
  await userRepository.softDelete(Number(id));
  res.json({ message: 'Profesor eliminado (puede restaurarse desde la papelera)' });
}

async function getDeletedTeachers(req, res) {
  const { search } = req.query;
  const teachers = await userRepository.findDeletedTeachers(search || '');
  res.json(teachers);
}

async function restoreTeacher(req, res) {
  const { id } = req.params;
  const user = await userRepository.findRawById(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.role !== 'TEACHER') return res.status(400).json({ error: 'El usuario no es un profesor' });
  const restored = await userRepository.restore(Number(id));
  res.json(restored);
}

async function getAllStudents(req, res) {
  const { search } = req.query;
  const students = await userRepository.findAllStudents(search || '');
  res.json(students);
}

async function deleteStudent(req, res) {
  const { id } = req.params;
  const user = await userRepository.findRawById(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.role !== 'STUDENT') return res.status(400).json({ error: 'El usuario no es un alumno' });
  await userRepository.softDelete(Number(id));
  res.json({ message: 'Alumno eliminado (puede restaurarse desde la papelera)' });
}

async function getDeletedStudents(req, res) {
  const { search } = req.query;
  const students = await userRepository.findDeletedStudents(search || '');
  res.json(students);
}

async function restoreStudent(req, res) {
  const { id } = req.params;
  const user = await userRepository.findRawById(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.role !== 'STUDENT') return res.status(400).json({ error: 'El usuario no es un alumno' });
  const restored = await userRepository.restore(Number(id));
  res.json(restored);
}

async function getAllCoursesAdmin(req, res) {
  const courses = await courseRepository.findAll();
  res.json(courses);
}

async function deleteCourse(req, res) {
  const { id } = req.params;

  const course = await courseRepository.findById(Number(id));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

  await courseRepository.softDelete(Number(id));
  res.json({ message: 'Curso eliminado (puede restaurarse desde la papelera)' });
}

async function getDeletedCourses(req, res) {
  const courses = await courseRepository.findDeleted();
  res.json(courses);
}

async function restoreCourse(req, res) {
  const { id } = req.params;
  const course = await courseRepository.findRawById(Number(id));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  const restored = await courseRepository.restore(Number(id));
  res.json(restored);
}

module.exports = {
  getPendingTeachers,
  approveTeacher,
  rejectTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  toggleTeacherStatus,
  deleteTeacher,
  getDeletedTeachers,
  restoreTeacher,
  getAllStudents,
  deleteStudent,
  getDeletedStudents,
  restoreStudent,
  getAllCoursesAdmin,
  deleteCourse,
  getDeletedCourses,
  restoreCourse,
};
