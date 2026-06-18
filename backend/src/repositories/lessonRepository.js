const prisma = require('../config/database');

async function findById(id) {
  return prisma.lesson.findUnique({
    where: { id },
    include: {
      course: { select: { teacherId: true, id: true } },
      materials: { orderBy: { uploadedAt: 'desc' } },
    },
  });
}

async function findByCourse(courseId) {
  return prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  });
}

async function create(data) {
  return prisma.lesson.create({ data });
}

async function update(id, data) {
  return prisma.lesson.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.lesson.delete({ where: { id } });
}

async function reorderMany(items) {
  return prisma.$transaction(
    items.map(({ id, order }) =>
      prisma.lesson.update({ where: { id }, data: { order } })
    )
  );
}

module.exports = { findById, findByCourse, create, update, remove, reorderMany };
