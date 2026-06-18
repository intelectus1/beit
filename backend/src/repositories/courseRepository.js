const prisma = require('../config/database');

async function findAllPublished(teacherId = null) {
  const where = { isPublished: true };
  if (teacherId) where.teacherId = teacherId;
  return prisma.course.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function findAll() {
  return prisma.course.findMany({
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function findByTeacherId(teacherId) {
  return prisma.course.findMany({
    where: { teacherId },
    include: {
      _count: { select: { lessons: true, enrollments: true } },
      curriculum: true,
      schedules: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function findById(id) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      lessons: { orderBy: { order: 'asc' } },
      tasks: { orderBy: { createdAt: 'desc' } },
      _count: { select: { enrollments: true } },
      schedules: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
      curriculum: { orderBy: { order: 'asc' } },
    },
  });
}

async function findRawById(id) {
  return prisma.course.findUnique({ where: { id } });
}

async function create(data) {
  return prisma.course.create({ data });
}

async function update(id, data) {
  return prisma.course.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.course.delete({ where: { id } });
}

module.exports = { findAllPublished, findAll, findByTeacherId, findById, findRawById, create, update, remove };
