const prisma = require('../config/database');

async function findByTaskAndStudent(taskId, studentId) {
  return prisma.submission.findUnique({
    where: { taskId_studentId: { taskId, studentId } },
  });
}

async function findById(id) {
  return prisma.submission.findUnique({
    where: { id },
    include: { task: { include: { course: true } } },
  });
}

async function findByTask(taskId) {
  return prisma.submission.findMany({
    where: { taskId },
    include: { student: { select: { id: true, name: true, email: true } } },
    orderBy: { submittedAt: 'desc' },
  });
}

async function findByTasksAndStudents(taskIds, studentIds) {
  return prisma.submission.findMany({
    where: { taskId: { in: taskIds }, studentId: { in: studentIds } },
  });
}

async function findByStudentAndTasks(studentId, taskIds) {
  return prisma.submission.findMany({
    where: { studentId, taskId: { in: taskIds } },
  });
}

async function create(data) {
  return prisma.submission.create({ data });
}

async function update(id, data) {
  return prisma.submission.update({ where: { id }, data });
}

module.exports = {
  findByTaskAndStudent,
  findById,
  findByTask,
  findByTasksAndStudents,
  findByStudentAndTasks,
  create,
  update,
};
