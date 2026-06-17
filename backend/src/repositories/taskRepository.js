const prisma = require('../config/database');

async function findByCourse(courseId) {
  return prisma.task.findMany({
    where: { courseId },
    include: { _count: { select: { submissions: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function findRawByCourse(courseId) {
  return prisma.task.findMany({
    where: { courseId },
    orderBy: { createdAt: 'asc' },
  });
}

async function findById(id) {
  return prisma.task.findUnique({
    where: { id },
    include: { course: { select: { teacherId: true } } },
  });
}

async function findRawById(id) {
  return prisma.task.findUnique({ where: { id } });
}

async function create(data) {
  return prisma.task.create({ data });
}

async function update(id, data) {
  return prisma.task.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.task.delete({ where: { id } });
}

module.exports = { findByCourse, findRawByCourse, findById, findRawById, create, update, remove };
