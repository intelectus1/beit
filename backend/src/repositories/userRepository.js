const prisma = require('../config/database');

const PUBLIC_SELECT = { id: true, name: true, email: true, role: true, status: true, createdAt: true };

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

async function findPendingTeachers() {
  return prisma.user.findMany({
    where: { role: 'TEACHER', status: 'PENDING_APPROVAL' },
    select: PUBLIC_SELECT,
    orderBy: { createdAt: 'asc' },
  });
}

module.exports = { findByEmail, findById, findRawById, create, updateStatus, findPendingTeachers };
