const prisma = require('../config/database');

async function findByLesson(lessonId) {
  return prisma.lessonMaterial.findMany({
    where: { lessonId },
    orderBy: { uploadedAt: 'desc' },
  });
}

async function findById(id) {
  return prisma.lessonMaterial.findUnique({ where: { id } });
}

async function create(data) {
  return prisma.lessonMaterial.create({ data });
}

async function remove(id) {
  return prisma.lessonMaterial.delete({ where: { id } });
}

module.exports = { findByLesson, findById, create, remove };
