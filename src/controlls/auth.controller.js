// controllers/auth.controller.js
const User = require('../models/Users');
const Empleado = require('../models/nomina/Empleado');

const authCtrl = {};

// Vista de login
authCtrl.viewLogin = (req, res) => {
  res.render('auth/login', { 
    titulo: 'Iniciar Sesión',
    error: req.flash('error'),
    success: req.flash('success')
  });
};

// Vista de registro
authCtrl.viewRegister = (req, res) => {
  res.render('auth/register', { 
    titulo: 'Registrarse',
    error: req.flash('error')
  });
};

// Procesar login
authCtrl.login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    
    // Validación básica
    if (!correo || !password) {
      req.flash('error', 'Correo y contraseña son requeridos');
      return res.redirect('/auth/login');
    }

    // Buscar usuario
    const user = await User.findOne({ 
      correo: correo.toLowerCase().trim(),
      activo: true 
    });

    if (!user) {
      req.flash('error', 'Credenciales inválidas');
      return res.redirect('/auth/login');
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error', 'Credenciales inválidas');
      return res.redirect('/auth/login');
    }

    // Crear sesión
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.correo;
    req.session.userProfile = user.perfil_usuario;

    // Buscar empleado asociado si existe
    const empleado = await Empleado.findOne({ usuario: user._id })
      .populate('sector')
      .populate('cargo');

    if (empleado) {
      req.session.empleadoId = empleado._id;
      req.session.sectorId = empleado.sector._id;
    }

    req.flash('success', `Bienvenido, ${user.name}`);
    res.redirect('/');

  } catch (error) {
    console.error('Error en login:', error);
    req.flash('error', 'Error interno del servidor');
    res.redirect('/auth/login');
  }
};

// Procesar registro
authCtrl.register = async (req, res) => {
  try {
    const { 
      name, correo, password, confirmPassword, 
      celular, telefono, direccion, pais, estado, ciudad,
      perfil_usuario, tipo_impre 
    } = req.body;

    // Validaciones
    if (password !== confirmPassword) {
      req.flash('error', 'Las contraseñas no coinciden');
      return res.redirect('/auth/register');
    }

    if (password.length < 6) {
      req.flash('error', 'La contraseña debe tener al menos 6 caracteres');
      return res.redirect('/auth/register');
    }

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ correo: correo.toLowerCase().trim() });
    if (existingUser) {
      req.flash('error', 'El correo ya está registrado');
      return res.redirect('/auth/register');
    }

    // Crear nuevo usuario
    const newUser = new User({
      name: name.trim(),
      correo: correo.toLowerCase().trim(),
      password, // Se encriptará automáticamente por el middleware
      celular: celular.trim(),
      telefono: telefono?.trim(),
      direccion: direccion?.trim(),
      pais: pais.trim(),
      estado: estado.trim(),
      ciudad: ciudad.trim(),
      perfil_usuario: parseInt(perfil_usuario),
      tipo_impre: parseInt(tipo_impre)
    });

    await newUser.save();

    req.flash('success', 'Usuario registrado exitosamente. Ya puedes iniciar sesión.');
    res.redirect('/auth/login');

  } catch (error) {
    console.error('Error en registro:', error);
    req.flash('error', 'Error interno del servidor');
    res.redirect('/auth/register');
  }
};

// Cerrar sesión
authCtrl.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/auth/login');
  });
};

// Middleware para verificar autenticación
authCtrl.isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  req.flash('error', 'Debes iniciar sesión para acceder a esta página');
  res.redirect('/auth/login');
};

// Middleware para verificar perfil de usuario
authCtrl.hasProfile = (profiles) => {
  return (req, res, next) => {
    if (req.session.userId && profiles.includes(req.session.userProfile)) {
      return next();
    }
    req.flash('error', 'No tienes permisos para acceder a esta página');
    res.redirect('/');
  };
};

module.exports = authCtrl;
