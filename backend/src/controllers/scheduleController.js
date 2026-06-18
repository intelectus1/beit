const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const scheduleRepository = require('../repositories/scheduleRepository');

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MODALITIES = ['Presencial', 'Virtual', 'Híbrido'];

async function getCourseSchedules(req, res) {
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

  const schedules = await scheduleRepository.findByCourse(Number(courseId));
  res.json(schedules);
}

async function createSchedule(req, res) {
  const { courseId } = req.params;
  const { dayOfWeek, startTime, endTime, modality, classLink, location } = req.body;

  if (!dayOfWeek || !startTime || !endTime || !modality) {
    return res.status(400).json({ error: 'Día, hora inicio, hora fin y modalidad son requeridos' });
  }
  if (!DAYS.includes(dayOfWeek)) return res.status(400).json({ error: 'Día inválido' });
  if (!MODALITIES.includes(modality)) return res.status(400).json({ error: 'Modalidad inválida' });

  const course = await courseRepository.findRawById(Number(courseId));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const schedule = await scheduleRepository.create({
    courseId: Number(courseId),
    dayOfWeek,
    startTime,
    endTime,
    modality,
    classLink: classLink || null,
    location: location || null,
  });
  res.status(201).json(schedule);
}

async function updateSchedule(req, res) {
  const { courseId, scheduleId } = req.params;
  const { dayOfWeek, startTime, endTime, modality, classLink, location } = req.body;

  const course = await courseRepository.findRawById(Number(courseId));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const schedule = await scheduleRepository.findById(Number(scheduleId));
  if (!schedule || schedule.courseId !== Number(courseId)) {
    return res.status(404).json({ error: 'Horario no encontrado' });
  }

  const updated = await scheduleRepository.update(Number(scheduleId), {
    dayOfWeek,
    startTime,
    endTime,
    modality,
    classLink: classLink || null,
    location: location || null,
  });
  res.json(updated);
}

async function deleteSchedule(req, res) {
  const { courseId, scheduleId } = req.params;

  const course = await courseRepository.findRawById(Number(courseId));
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  if (course.teacherId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }

  const schedule = await scheduleRepository.findById(Number(scheduleId));
  if (!schedule || schedule.courseId !== Number(courseId)) {
    return res.status(404).json({ error: 'Horario no encontrado' });
  }

  await scheduleRepository.remove(Number(scheduleId));
  res.json({ message: 'Horario eliminado' });
}

async function getMySchedules(req, res) {
  const { id: userId, role } = req.user;

  if (role === 'STUDENT') {
    const schedules = await scheduleRepository.findByEnrolledCourses(userId);
    return res.json(schedules);
  }

  // Teachers/admins: fetch schedules for their own courses including course info
  const courses = await courseRepository.findByTeacherId(userId);
  const allSchedules = [];
  for (const course of courses) {
    const s = await scheduleRepository.findByCourse(course.id);
    allSchedules.push(...s.map((sch) => ({
      ...sch,
      course: { id: course.id, title: course.title },
    })));
  }
  res.json(allSchedules);
}

module.exports = { getCourseSchedules, createSchedule, updateSchedule, deleteSchedule, getMySchedules };
