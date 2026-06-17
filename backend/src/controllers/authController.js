const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const validRoles = ['STUDENT', 'TEACHER'];
  const userRole = validRoles.includes(role) ? role : 'STUDENT';

  // Teachers must be approved by a super admin before they can access the platform
  const userStatus = userRole === 'TEACHER' ? 'PENDING_APPROVAL' : 'ACTIVE';

  const user = await userRepository.create({ name, email, password: hashed, role: userRole, status: userStatus });

  if (userStatus === 'PENDING_APPROVAL') {
    return res.status(201).json({
      pending: true,
      message: 'Tu cuenta de profesor ha sido creada y está pendiente de aprobación. Un administrador revisará tu solicitud y recibirás acceso una vez aprobada.',
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({ user, token });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  if (user.status === 'PENDING_APPROVAL') {
    return res.status(403).json({
      error: 'Tu cuenta está pendiente de aprobación por un administrador. Vuelve a intentarlo más tarde.',
      pending: true,
    });
  }

  if (user.status === 'REJECTED') {
    return res.status(403).json({
      error: 'Tu solicitud de cuenta de profesor ha sido rechazada. Contacta al administrador para más información.',
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
}

async function me(req, res) {
  const user = await userRepository.findById(req.user.id);
  res.json(user);
}

module.exports = { register, login, me };
