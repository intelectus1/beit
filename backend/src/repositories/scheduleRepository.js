const prisma = require('../config/database');

async function findByCourse(courseId) {
  return prisma.classSchedule.findMany({
    where: { courseId },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
}

async function findById(id) {
  return prisma.classSchedule.findUnique({ where: { id } });
}

async function create(data) {
  return prisma.classSchedule.create({ data });
}

async function update(id, data) {
  return prisma.classSchedule.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.classSchedule.delete({ where: { id } });
}

async function findByEnrolledCourses(userId) {
  return prisma.classSchedule.findMany({
    where: {
      course: {
        enrollments: {
          some: { userId, status: 'ACCEPTED' },
        },
      },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          teacher: { select: { name: true } },
        },
      },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
}

module.exports = { findByCourse, findById, create, update, remove, findByEnrolledCourses };
