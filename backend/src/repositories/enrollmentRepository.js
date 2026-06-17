const prisma = require('../config/database');

async function findByUserAndCourse(userId, courseId) {
  return prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
}

async function findAcceptedByUser(userId) {
  return prisma.enrollment.findMany({
    where: { userId, status: 'ACCEPTED' },
    include: {
      course: {
        include: {
          teacher: { select: { id: true, name: true } },
          _count: { select: { lessons: true } },
        },
      },
    },
  });
}

async function findPendingByCourse(courseId) {
  return prisma.enrollment.findMany({
    where: { courseId, status: 'PENDING' },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { enrolledAt: 'asc' },
  });
}

async function findAcceptedByCourse(courseId) {
  return prisma.enrollment.findMany({
    where: { courseId, status: 'ACCEPTED' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

async function create(data) {
  return prisma.enrollment.create({ data });
}

async function update(id, data) {
  return prisma.enrollment.update({ where: { id }, data });
}

async function updateStatus(id, status) {
  return prisma.enrollment.update({
    where: { id },
    data: { status },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

module.exports = {
  findByUserAndCourse,
  findAcceptedByUser,
  findPendingByCourse,
  findAcceptedByCourse,
  create,
  update,
  updateStatus,
};
