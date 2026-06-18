const prisma = require('../config/database');

async function findByCourse(courseId) {
  return prisma.curriculumItem.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  });
}

async function findById(id) {
  return prisma.curriculumItem.findUnique({ where: { id } });
}

async function create(data) {
  return prisma.curriculumItem.create({ data });
}

async function update(id, data) {
  return prisma.curriculumItem.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.curriculumItem.delete({ where: { id } });
}

async function updateMany(items) {
  return prisma.$transaction(
    items.map(({ id, order }) =>
      prisma.curriculumItem.update({ where: { id }, data: { order } })
    )
  );
}

module.exports = { findByCourse, findById, create, update, remove, updateMany };
