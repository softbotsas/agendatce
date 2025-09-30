const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: function (req, file, cb) {
        // Permitir solo imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

// Importar controladores
const authController = require('../controllers/auth.controller');
const agendaAuthController = require('../controllers/agenda/agenda.authController');
const configController = require('../controllers/agenda/agenda.configController');
const configurationController = require('../controllers/agenda/agenda.configurationController');
const dashboardController = require('../controllers/agenda/agenda.dashboardController');
const taskController = require('../controllers/agenda/agenda.taskController');
const taskControllerSimple = require('../controllers/agenda/agenda.taskControllerSimple');
const taskManagementController = require('../controllers/agenda/agenda.taskManagementController');

// Importar middlewares de roles
const { requireAdmin, requireSupervisorOrAdmin, requirePermission } = require('../middleware/roleAuth');

// Middleware de autenticación real
const authenticateToken = (req, res, next) => {
    console.log('🔐 authenticateToken - req.session:', req.session);
    console.log('🔐 authenticateToken - req.session.userId:', req.session?.userId);
    
    // Verificar que el usuario esté logueado
    if (!req.session || !req.session.userId) {
        console.log('❌ authenticateToken - No hay sesión activa');
        // Si es una petición AJAX, devolver JSON
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(401).json({ 
                success: false, 
                message: 'No autorizado. Debe iniciar sesión.' 
            });
        }
        // Si es una petición normal, redirigir al login
        return res.redirect('/agenda/login');
    }
    
    // Usar el userId de la sesión real
    req.user = { 
        _id: req.session.userId,
        id: req.session.userId,
        // TODO: Obtener nombre desde BD empresa cuando esté disponible
        nombre: 'Usuario Logueado' 
    };
    
    console.log('✅ authenticateToken - Usuario autenticado:', req.user);
    next();
};

// Rutas de autenticación (sin middleware de auth)
router.get('/agenda/login', (req, res) => {
    res.render('agenda/login', { titulo: 'Login - Sistema de Agenda TCE' });
});
router.post('/agenda/auth/login', agendaAuthController.simulateLogin);
router.post('/agenda/auth/logout', agendaAuthController.logout);
router.get('/agenda/auth/current-user', authenticateToken, agendaAuthController.getCurrentUser);
router.get('/agenda/api/user/current', authenticateToken, agendaAuthController.getCurrentUser);
router.get('/agenda/auth/available-users', agendaAuthController.getAvailableUsers);

// Ruta principal de agenda
router.get('/agenda/', authenticateToken, (req, res) => {
    res.render('agenda/main', { 
        titulo: 'Sistema de Agenda TCE',
        version: Date.now() // Para evitar cache
    });
});

// Rutas para cargar secciones dinámicamente
router.get('/agenda/sections/:section', authenticateToken, async (req, res) => {
    const section = req.params.section;
    const validSections = ['dashboard', 'today', 'all-tasks', 'history', 'configuration'];
    
    if (!validSections.includes(section)) {
        return res.status(404).send('Sección no encontrada');
    }
    
    // Verificar permisos para secciones de admin
    if (['history', 'configuration'].includes(section)) {
        // Obtener información completa del usuario
        const UserService = require('../services/agenda/agenda.userService');
        const userResult = await UserService.getUserById(req.session.userId);
        
        if (!userResult.success) {
            return res.status(403).send('Usuario no encontrado');
        }
        
        const userProfile = userResult.data.perfil_usuario;
        
        // Configuración: Solo admin (perfil_usuario === 1)
        if (section === 'configuration' && userProfile !== 1) {
            return res.status(403).send('Acceso denegado - Solo administradores');
        }
        
        // Historial: Admin y Supervisor (perfil_usuario === 1 o 2)
        if (section === 'history' && userProfile !== 1 && userProfile !== 2) {
            return res.status(403).send('Acceso denegado - Solo administradores y supervisores');
        }
    }
    
    res.render(`agenda/sections/${section}`, {
        user: req.user
    });
});

// API Routes para tareas - Conectar con base de datos real
router.get('/agenda/api/tasks/today', authenticateToken, taskController.getTodayTasks);

router.post('/agenda/api/tasks/log', authenticateToken, upload.single('evidence_file'), taskController.logTask);

// Rutas SIMPLES para tareas (sin errores)
router.post('/agenda/api/tasks/complete', authenticateToken, upload.single('evidence_file'), taskControllerSimple.completeTask);
router.post('/agenda/api/tasks/register-action', authenticateToken, upload.single('evidence_file'), taskControllerSimple.registerAction);
router.post('/agenda/api/tasks/not-applicable', authenticateToken, taskControllerSimple.markNotApplicable);
router.post('/agenda/api/tasks/complete-all-overdue', authenticateToken, taskControllerSimple.completeAllOverdue);
router.post('/agenda/api/tasks/skip-all-overdue', authenticateToken, taskControllerSimple.skipAllOverdue);

// Rutas simples para tareas atrasadas
router.post('/agenda/api/tasks/overdue/not-applicable', authenticateToken, (req, res) => {
  const overdueService = require('../services/agenda/agenda.overdueService');
  const { taskId, reason } = req.body;
  const userId = req.session.userId;
  
  overdueService.markOverdueTaskAsNotApplicable(taskId, userId, reason)
    .then(result => {
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    })
    .catch(error => {
      console.error('Error en ruta not-applicable:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    });
});

router.post('/agenda/api/tasks/overdue/retroactive', authenticateToken, (req, res) => {
  const overdueService = require('../services/agenda/agenda.overdueService');
  const { taskId, retroactiveDate, comment } = req.body;
  const userId = req.session.userId;
  
  overdueService.completeOverdueTaskRetroactive(taskId, userId, retroactiveDate, comment)
    .then(result => {
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    })
    .catch(error => {
      console.error('Error en ruta retroactive:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    });
});

router.get('/agenda/api/dashboard', authenticateToken, dashboardController.getDashboard);

router.get('/agenda/api/dashboard/all-users', authenticateToken, dashboardController.getAllUsersDashboard);

// Rutas de configuración de usuarios (solo admin)
router.get('/agenda/api/config/users', authenticateToken, requireAdmin, configController.getAgendaUsers);
router.post('/agenda/api/config/users', authenticateToken, requireAdmin, configController.createAgendaUser);
router.put('/agenda/api/config/users/:id', authenticateToken, requireAdmin, configController.updateAgendaUser);
router.delete('/agenda/api/config/users/:id', authenticateToken, requireAdmin, configController.deleteAgendaUser);
router.get('/agenda/api/config/system-users', authenticateToken, requireAdmin, configController.getSystemUsers);

// Rutas de configuración de tareas (solo admin)
router.get('/agenda/api/config/tasks', authenticateToken, configurationController.getTasks);
router.post('/agenda/api/config/tasks', authenticateToken, requirePermission('create_task'), configurationController.createTask);
router.put('/agenda/api/config/tasks/:id', authenticateToken, requirePermission('edit_task'), configurationController.updateTask);
router.delete('/agenda/api/config/tasks/:id', authenticateToken, requirePermission('delete_task'), configurationController.deleteTask);

// Rutas de asignaciones (solo admin)
router.get('/agenda/api/config/assignments', authenticateToken, requireAdmin, configController.getTaskAssignments);
router.post('/agenda/api/config/assignments', authenticateToken, requireAdmin, configController.createTaskAssignment);
router.delete('/agenda/api/config/assignments/:id', authenticateToken, requireAdmin, configController.deleteTaskAssignment);

// Rutas de etiquetas (solo admin)
router.get('/agenda/api/config/tags', authenticateToken, configurationController.getTags);
router.post('/agenda/api/config/tags', authenticateToken, requireAdmin, configurationController.createTag);
router.put('/agenda/api/config/tags/:id', authenticateToken, requireAdmin, configController.updateTag);
router.delete('/agenda/api/config/tags/:id', authenticateToken, requireAdmin, configController.deleteTag);
router.get('/agenda/api/config/tag-categories', authenticateToken, configController.getTagCategories);

// Rutas del dashboard
router.get('/agenda/api/dashboard/stats', authenticateToken, taskController.getDashboardStats);
router.get('/agenda/api/dashboard/weekly', authenticateToken, taskController.getWeeklyProgress);
router.get('/agenda/api/tasks/priority', authenticateToken, taskController.getPriorityTasks);
router.get('/agenda/api/activity/recent', authenticateToken, taskController.getRecentActivity);
router.get('/agenda/api/tasks/all', authenticateToken, requireAdmin, taskController.getAllTasks);
router.get('/agenda/api/tasks/my-tasks', authenticateToken, taskController.getMyTasks);

// Rutas de configuración - Lectura permitida para supervisores (historial), escritura solo admin
router.get('/agenda/api/configuration/employees', authenticateToken, requireSupervisorOrAdmin, configurationController.getEmployees);
router.post('/agenda/api/configuration/employees', authenticateToken, requireAdmin, configurationController.createEmployee);
router.get('/agenda/api/configuration/employees/:id', authenticateToken, requireSupervisorOrAdmin, configurationController.getEmployeeById);
router.put('/agenda/api/configuration/employees/:id', authenticateToken, requireAdmin, configurationController.updateEmployee);
router.delete('/agenda/api/configuration/employees/:id', authenticateToken, requireAdmin, configurationController.deleteEmployee);
router.get('/agenda/api/configuration/tasks', authenticateToken, requireSupervisorOrAdmin, configurationController.getTasks);
router.get('/agenda/api/configuration/tasks/:id', authenticateToken, requireSupervisorOrAdmin, configurationController.getTaskById);
router.post('/agenda/api/configuration/tasks', authenticateToken, requireAdmin, configurationController.createTask);
router.put('/agenda/api/configuration/tasks/:id', authenticateToken, requireAdmin, configurationController.updateTask);
router.delete('/agenda/api/configuration/tasks/:id', authenticateToken, requireAdmin, configurationController.deleteTask);
router.get('/agenda/api/configuration/departments', authenticateToken, requireSupervisorOrAdmin, configurationController.getDepartments);
router.get('/agenda/api/configuration/departments/:id', authenticateToken, requireSupervisorOrAdmin, configurationController.getDepartmentById);
router.post('/agenda/api/configuration/departments', authenticateToken, requireAdmin, configurationController.createDepartment);
router.get('/agenda/api/configuration/tags', authenticateToken, requireAdmin, configurationController.getTags);
router.post('/agenda/api/configuration/tags', authenticateToken, requireAdmin, configurationController.createTag);
router.get('/agenda/api/users/all', authenticateToken, requireAdmin, taskController.getAllUsers);
router.get('/agenda/api/tags/all', authenticateToken, requireAdmin, taskController.getAllTags);

// Rutas de departamentos
router.get('/agenda/api/departments/all', authenticateToken, requireAdmin, taskController.getAllDepartments);
router.get('/agenda/api/departments/stats', authenticateToken, requireAdmin, taskController.getDepartmentStats);
router.post('/agenda/api/departments', authenticateToken, requireAdmin, taskController.createDepartment);
router.put('/agenda/api/departments/:id', authenticateToken, requireAdmin, taskController.updateDepartment);
router.delete('/agenda/api/departments/:id', authenticateToken, requireAdmin, taskController.deleteDepartment);

// Rutas de historial (admin y supervisor)
router.get('/agenda/api/history/all', authenticateToken, requireSupervisorOrAdmin, taskController.getAllHistory);

module.exports = router;