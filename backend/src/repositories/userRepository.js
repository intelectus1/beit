const prisma = require('../config/database');

const PUBLIC_SELECT = { id: true, name: true, email: true, role: true, status: true, avatarUrl: true, createdAt: true };

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findById(id) {
  return prisma.user.findUnique({ where: { id }, select: PUBLIC_SELECT });
}

async function findRawById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function create(data) {
  return prisma.user.create({ data, select: PUBLIC_SELECT });
}

async function updateStatus(id, status) {
  return prisma.user.update({ where: { id }, data: { status }, select: PUBLIC_SELECT });
}

async function update(id, data) {
  return prisma.user.update({ where: { id }, data, select: PUBLIC_SELECT });
}

async function findPendingTeachers() {
  return prisma.user.findMany({
    where: { role: 'TEACHER', status: 'PENDING_APPROVAL' },
    select: PUBLIC_SELECT,
    orderBy: { createdAt: 'asc' },
  });
}

async function findAllTeachers(search) {
  const where = { role: 'TEACHER' };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  return prisma.user.findMany({
    where,
    select: {
      ...PUBLIC_SELECT,
      coursesCreated: {
        select: {
          id: true,
          title: true,
          isPublished: true,
          _count: { select: { enrollments: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function findAllStudents(search) {
  const where = { role: 'STUDENT' };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  return prisma.user.findMany({
    where,
    select: {
      ...PUBLIC_SELECT,
      enrollments: {
        select: {
          id: true, status: true, enrolledAt: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { findByEmail, findById, findRawById, create, updateStatus, update, findPendingTeachers, findAllTeachers, findAllStudents };
