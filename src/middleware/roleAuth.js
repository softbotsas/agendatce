// Middleware para verificación de roles
const UserService = require('../services/agenda/agenda.userService');

// Middleware para verificar si es admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const isAdmin = await UserService.isAdmin(req.user._id);
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar si es supervisor o admin
const requireSupervisorOrAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const isSupervisorOrAdmin = await UserService.isSupervisorOrAdmin(req.user._id);
    
    if (!isSupervisorOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de supervisor o administrador.'
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireSupervisorOrAdmin middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar permisos específicos
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado'
        });
      }

      // Obtener información del usuario
      const userResult = await UserService.getUserById(req.user._id);
      
      if (!userResult.success) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const user = userResult.data;
      
      // Verificar permisos según el rol
      let hasPermission = false;
      
      switch (permission) {
        case 'create_task':
        case 'edit_task':
        case 'delete_task':
          // Solo admin puede crear/editar/eliminar tareas
          hasPermission = user.perfil_usuario === 1;
          break;
          
        case 'view_all_tasks':
          // Admin y supervisor pueden ver todas las tareas
          hasPermission = user.perfil_usuario <= 2;
          break;
          
        case 'complete_task':
          // Todos pueden completar tareas
          hasPermission = true;
          break;
          
        default:
          hasPermission = false;
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Se requieren permisos para: ${permission}`
        });
      }

      next();
    } catch (error) {
      console.error('Error in requirePermission middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

module.exports = {
  requireAdmin,
  requireSupervisorOrAdmin,
  requirePermission
};



