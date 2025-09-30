// Controlador de autenticación para desarrollo
// TODO: Reemplazar con autenticación real del sistema principal

const UserService = require('../../services/agenda/agenda.userService');

// Simular login (solo para desarrollo)
const simulateLogin = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario requerido'
      });
    }

    // Verificar que el usuario existe
    const userResult = await UserService.getUserById(userId);
    
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Establecer sesión
    req.session.userId = userId;
    
    res.json({
      success: true,
      message: 'Sesión iniciada correctamente',
      user: userResult.data
    });
  } catch (error) {
    console.error('Error in simulateLogin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cerrar sesión
const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error al cerrar sesión'
        });
      }
      
      res.json({
        success: true,
        message: 'Sesión cerrada correctamente'
      });
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener usuario actual
const getCurrentUser = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'No hay sesión activa'
      });
    }

    const userResult = await UserService.getUserById(req.session.userId);
    
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    console.log('🔍 getCurrentUser - userResult completo:', JSON.stringify(userResult, null, 2));
    console.log('🔍 getCurrentUser - userResult.data:', JSON.stringify(userResult.data, null, 2));
    
    res.json({
      success: true,
      data: userResult.data
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener usuarios disponibles para login (solo para desarrollo)
const getAvailableUsers = async (req, res) => {
  try {
    console.log('🔍 getAvailableUsers - Iniciando...');
    
    const usersResult = await UserService.getAllUsers();
    console.log('🔍 getAvailableUsers - usersResult:', {
      success: usersResult.success,
      dataLength: usersResult.data ? usersResult.data.length : 'undefined',
      firstUser: usersResult.data ? usersResult.data[0] : 'undefined'
    });
    
    if (!usersResult.success) {
      console.log('❌ getAvailableUsers - usersResult.success es false');
      return res.status(500).json(usersResult);
    }

    if (!usersResult.data || !Array.isArray(usersResult.data)) {
      console.log('❌ getAvailableUsers - usersResult.data no es un array válido');
      return res.status(500).json({
        success: false,
        message: 'Datos de usuarios no válidos'
      });
    }

    // Filtrar información sensible
    console.log('🔍 getAvailableUsers - Mapeando usuarios...');
    const safeUsers = usersResult.data.map((user, index) => {
      console.log(`🔍 Usuario ${index + 1}:`, {
        _id: user._id,
        name: user.name,
        nombre: user.nombre,
        correo: user.correo,
        perfil_usuario: user.perfil_usuario
      });
      
      return {
        _id: user._id,
        name: user.name || user.nombre || 'Usuario Sin Nombre', // Usar name primero, luego nombre como fallback
        correo: user.correo || 'sin-email@tce.com',
        perfil_usuario: user.perfil_usuario || 3,
        cargo: user.cargo || 'Sin cargo',
        role_name: user.perfil_usuario === 1 ? 'Admin' : 
                   user.perfil_usuario === 2 ? 'Supervisor' : 'Empleado'
      };
    });

    console.log('✅ getAvailableUsers - Usuarios mapeados exitosamente:', safeUsers.length);
    
    res.json({
      success: true,
      data: safeUsers
    });
  } catch (error) {
    console.error('❌ Error in getAvailableUsers:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  simulateLogin,
  logout,
  getCurrentUser,
  getAvailableUsers
};

