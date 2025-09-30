const TaskService = require('../../services/agenda/agenda.taskService');

// Obtener tareas de hoy para un usuario
const getTodayTasks = async (req, res) => {
  try {
    console.log('🎯 getTodayTasks controller - req.user:', req.user);
    console.log('🎯 getTodayTasks controller - req.session:', req.session);
    
    const userId = req.user._id;
    console.log('🎯 getTodayTasks controller - userId:', userId);
    
    const result = await TaskService.getTodayTasks(userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error getting today tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las tareas de hoy'
    });
  }
};

// Marcar tarea como completada o incrementar contador
const logTask = async (req, res) => {
  try {
    const { assignment_id, action_type, value = 1, comment } = req.body;
    const userId = req.user._id;
    
    // Manejar archivo subido
    let evidence_file = null;
    if (req.file) {
      evidence_file = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }
    
    const result = await TaskService.logTask(assignment_id, userId, action_type, {
      value,
      comment,
      evidence_file,
      retroactive_date: req.body.retroactive_date,
      not_applicable_reason: req.body.not_applicable_reason,
      overdue_days: req.body.overdue_days
    });
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error logging task:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar la tarea'
    });
  }
};

// Obtener historial de tareas
const getTaskHistory = async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;
    const userId = user_id || req.user._id;
    
    const result = await TaskService.getTaskHistory(userId, start_date, end_date);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error getting task history:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de tareas'
    });
  }
};

// Obtener estadísticas del dashboard
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await TaskService.getDashboardStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard'
    });
  }
};

// Obtener progreso semanal
const getWeeklyProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const progress = await TaskService.getWeeklyProgress(userId);
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error getting weekly progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener progreso semanal'
    });
  }
};

// Obtener tareas prioritarias
const getPriorityTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await TaskService.getPriorityTasks(userId);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting priority tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tareas prioritarias'
    });
  }
};

// Obtener actividad reciente
const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const KpiService = require('../../services/agenda/agenda.kpiService');
    const activity = await KpiService.getRecentActivity(userId);
    
    console.log('🔍 getRecentActivity controller - activity:', activity?.length || 0, 'registros');
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad reciente'
    });
  }
};

// Obtener todas las tareas del usuario
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await TaskService.getAllUserTasks(userId);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting all tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener todas las tareas'
    });
  }
};

// Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res) => {
  try {
    const usersResult = await TaskService.getAllUsers();
    
    // TaskService.getAllUsers() ya devuelve { success: true, data: users }
    res.json(usersResult);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
};

// Obtener todos los tags (solo admin)
const getAllTags = async (req, res) => {
  try {
    const tags = await TaskService.getAllTags();
    
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error getting all tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tags'
    });
  }
};

// Obtener todos los departamentos (solo admin)
const getAllDepartments = async (req, res) => {
  try {
    const departments = await TaskService.getAllDepartments();
    
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error getting all departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener departamentos'
    });
  }
};

// Obtener estadísticas de departamentos (solo admin)
const getDepartmentStats = async (req, res) => {
  try {
    const stats = await TaskService.getDepartmentStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting department stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de departamentos'
    });
  }
};

// Crear departamento (solo admin)
const createDepartment = async (req, res) => {
  try {
    const departmentData = req.body;
    const createdBy = req.user._id;
    
    const department = await TaskService.createDepartment(departmentData, createdBy);
    
    res.json({
      success: true,
      data: department,
      message: 'Departamento creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear departamento: ' + error.message
    });
  }
};

// Actualizar departamento (solo admin)
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const department = await TaskService.updateDepartment(id, updateData);
    
    res.json({
      success: true,
      data: department,
      message: 'Departamento actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar departamento: ' + error.message
    });
  }
};

// Eliminar departamento (solo admin)
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    await TaskService.deleteDepartment(id);
    
    res.json({
      success: true,
      message: 'Departamento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar departamento: ' + error.message
    });
  }
};

// Obtener tareas del usuario actual
const getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await TaskService.getAllUserTasks(userId);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting my tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mis tareas'
    });
  }
};

// Obtener todo el historial (solo admin)
const getAllHistory = async (req, res) => {
  try {
    const history = await TaskService.getAllHistory();
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting all history:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial'
    });
  }
};

module.exports = {
  getTodayTasks,
  logTask,
  getTaskHistory,
  getDashboardStats,
  getWeeklyProgress,
  getPriorityTasks,
  getRecentActivity,
  getAllTasks,
  getMyTasks,
  getAllUsers,
  getAllTags,
  getAllDepartments,
  getDepartmentStats,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllHistory
};
