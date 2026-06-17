const prisma = require('../config/database');

async function findById(id) {
  return prisma.lesson.findUnique({
    where: { id },
    include: { course: { select: { teacherId: true } } },
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

module.exports = { findById, create, update, remove };
