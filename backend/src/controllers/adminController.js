const userRepository = require('../repositories/userRepository');

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

module.exports = { getPendingTeachers, approveTeacher, rejectTeacher };
