const prisma = require('../config/database');

const PUBLIC_SELECT = { id: true, name: true, email: true, role: true, status: true, avatarUrl: true, createdAt: true };

async function findByEmail(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user && !user.deletedAt ? user : null;
}

async function findById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: { ...PUBLIC_SELECT, deletedAt: true } });
  if (!user || user.deletedAt) return null;
  const { deletedAt: _d, ...rest } = user;
  return rest;
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
    where: { role: 'TEACHER', status: 'PENDING_APPROVAL', deletedAt: null },
    select: PUBLIC_SELECT,
    orderBy: { createdAt: 'asc' },
  });
}

async function findAllTeachers(search) {
  const where = { role: 'TEACHER', deletedAt: null };
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
  const where = { role: 'STUDENT', deletedAt: null };
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

async function findDeletedStudents(search) {
  const where = { role: 'STUDENT', deletedAt: { not: null } };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  return prisma.user.findMany({
    where,
    select: { ...PUBLIC_SELECT, deletedAt: true },
    orderBy: { deletedAt: 'desc' },
  });
}

async function softDelete(id) {
  return prisma.user.update({ where: { id }, data: { deletedAt: new Date() }, select: PUBLIC_SELECT });
}

async function restore(id) {
  return prisma.user.update({ where: { id }, data: { deletedAt: null }, select: PUBLIC_SELECT });
}

module.exports = {
  findByEmail, findById, findRawById, create, updateStatus, update,
  findPendingTeachers, findAllTeachers, findAllStudents,
  findDeletedStudents, softDelete, restore,
};
