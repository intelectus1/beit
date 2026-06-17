require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./config/database');

async function seed() {
  console.log('Seeding database...');

  // Super admin
  const adminHash = await bcrypt.hash('AdminBeit2026!', 10);
  let superAdmin = await prisma.user.findUnique({ where: { email: 'admin@beit.academy' } });
  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: { name: 'Super Admin', email: 'admin@beit.academy', password: adminHash, role: 'SUPER_ADMIN', status: 'ACTIVE' },
    });
    console.log('Created super admin:', superAdmin.email);
  } else {
    console.log('Super admin already exists:', superAdmin.email);
  }

  const nuevoAdminHash = await bcrypt.hash('Beitperu2026$', 10); // <-- Cambia la contraseña aquí
  let segundoAdmin = await prisma.user.findUnique({ where: { email: 'mportuguez@beitperu.com' } }); // <-- Cambia el correo aquí
  if (!segundoAdmin) {
    segundoAdmin = await prisma.user.create({
      data: { 
        name: 'BEIT', // <-- Cambia el nombre aquí
        email: 'mportuguez@beitperu.com', 
        password: nuevoAdminHash, 
        role: 'SUPER_ADMIN', 
        status: 'ACTIVE' 
      },
    });
    console.log('Created second super admin:', segundoAdmin.email);
  } else {
    console.log('Second super admin already exists:', segundoAdmin.email);
  }

  const teacherHash = await bcrypt.hash('beit2025', 10);
  const studentHash = await bcrypt.hash('beit2025', 10);

  let teacher = await prisma.user.findUnique({ where: { email: 'profesor@beit.academy' } });
  if (!teacher) {
    teacher = await prisma.user.create({
      data: { name: 'Carlos García', email: 'profesor@beit.academy', password: teacherHash, role: 'TEACHER', status: 'ACTIVE' },
    });
    console.log('Created teacher:', teacher.email);
  } else {
    console.log('Teacher already exists:', teacher.email);
  }

  let student = await prisma.user.findUnique({ where: { email: 'alumno@beit.academy' } });
  if (!student) {
    student = await prisma.user.create({
      data: { name: 'María López', email: 'alumno@beit.academy', password: studentHash, role: 'STUDENT' },
    });
    console.log('Created student:', student.email);
  } else {
    console.log('Student already exists:', student.email);
  }

  let course = await prisma.course.findFirst({ where: { teacherId: teacher.id, title: 'Introducción a Node.js' } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'Introducción a Node.js',
        description: 'Aprende a construir APIs REST con Node.js, Express y PostgreSQL desde cero.',
        isPublished: true,
        teacherId: teacher.id,
      },
    });
    console.log('Created published course:', course.title);
  } else {
    if (!course.isPublished) {
      course = await prisma.course.update({ where: { id: course.id }, data: { isPublished: true } });
      console.log('Published existing course:', course.title);
    } else {
      console.log('Course already exists:', course.title);
    }
  }

  const existingLesson = await prisma.lesson.findFirst({ where: { courseId: course.id } });
  if (!existingLesson) {
    await prisma.lesson.create({
      data: {
        title: 'Configuración del entorno y primer servidor',
        content: 'En esta lección aprenderás a instalar Node.js, inicializar un proyecto con npm y crear tu primer servidor HTTP con Express.\n\nPasos:\n1. Instala Node.js desde nodejs.org\n2. Crea una carpeta para tu proyecto\n3. Ejecuta npm init -y\n4. Instala Express: npm install express\n5. Crea index.js con el servidor básico',
        order: 1,
        courseId: course.id,
      },
    });
    console.log('Created lesson');
  }

  const existingTask = await prisma.task.findFirst({ where: { courseId: course.id } });
  if (!existingTask) {
    await prisma.task.create({
      data: {
        title: 'Crea tu primer endpoint REST',
        description: 'Crea un servidor Express con al menos tres endpoints: GET /users, POST /users y DELETE /users/:id. Documenta cada endpoint explicando qué hace y qué devuelve.',
        maxScore: 100,
        courseId: course.id,
      },
    });
    console.log('Created task');
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
  });
  if (!existingEnrollment) {
    // Seed creates student as ACCEPTED so demo works out of the box
    await prisma.enrollment.create({ data: { userId: student.id, courseId: course.id, status: 'ACCEPTED' } });
    console.log('Enrolled student in course (ACCEPTED)');
  }

  // Seed a graded submission so TC011, TC009, TC015 always have data
  const demoTask = await prisma.task.findFirst({ where: { courseId: course.id } });
  if (demoTask) {
    const existingSubmission = await prisma.submission.findUnique({
      where: { taskId_studentId: { taskId: demoTask.id, studentId: student.id } },
    });
    if (!existingSubmission) {
      await prisma.submission.create({
        data: {
          content: 'He creado los tres endpoints solicitados con Express:\n\n1. GET /users → devuelve array de usuarios en JSON con status 200\n2. POST /users → crea usuario con name y email, retorna el objeto creado con status 201\n3. DELETE /users/:id → elimina usuario por ID y retorna mensaje de confirmación\n\nCada endpoint incluye manejo de errores básico con try/catch.',
          taskId: demoTask.id,
          studentId: student.id,
          status: 'GRADED',
          score: 85,
          feedback: 'Buen trabajo. Los tres endpoints funcionan correctamente. Considera agregar validación de entrada en el POST.',
          gradedAt: new Date(),
        },
      });
      console.log('Created graded submission for demo student');
    } else {
      console.log('Demo submission already exists');
    }
  }

  console.log('Seed complete.');
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
