// Servicio para manejo de usuarios (simulado por ahora)
// TODO: Integrar con BD empresa cuando esté disponible

// Departamentos simulados para desarrollo
const simulatedDepartments = [
  {
    _id: 'dept_guatemala',
    name: 'Guatemala',
    code: 'GT',
    description: 'Operaciones en Guatemala',
    country: 'Guatemala',
    timezone: 'America/Guatemala',
    active: true
  },
  {
    _id: 'dept_usa',
    name: 'Estados Unidos',
    code: 'USA',
    description: 'Operaciones en Estados Unidos',
    country: 'Estados Unidos',
    timezone: 'America/New_York',
    active: true
  },
  {
    _id: 'dept_colombia',
    name: 'Colombia',
    code: 'CO',
    description: 'Operaciones en Colombia',
    country: 'Colombia',
    timezone: 'America/Bogota',
    active: true
  }
];

// Usuarios simulados para desarrollo
const simulatedUsers = [
  {
    _id: '68d171f463082493cc1c3f56',
    name: 'Laisa Rodriguez',
    correo: 'laisa@tce.com',
    perfil_usuario: 1, // Admin
    cargo: 'Líder de Operaciones',
    departamento: 'dept_usa',
    departamento_name: 'Estados Unidos',
    activo: true
  },
  {
    _id: '68d171f463082493cc1c3f57',
    name: 'Alejandra Martinez',
    correo: 'alejandra@tce.com',
    perfil_usuario: 2, // Supervisor
    cargo: 'Coordinadora de Equipos',
    departamento: 'dept_guatemala',
    departamento_name: 'Guatemala',
    activo: true
  },
  {
    _id: '68d171f463082493cc1c3f58',
    name: 'Carlos Mendoza',
    correo: 'carlos@tce.com',
    perfil_usuario: 3, // Empleado
    cargo: 'Operador de Logística',
    departamento: 'dept_colombia',
    departamento_name: 'Colombia',
    activo: true
  },
  {
    _id: '68d171f463082493cc1c3f59',
    name: 'María González',
    correo: 'maria@tce.com',
    perfil_usuario: 3, // Empleado
    cargo: 'Asistente Administrativo',
    departamento: 'dept_guatemala',
    departamento_name: 'Guatemala',
    activo: true
  },
  {
    _id: '68d171f463082493cc1c3f60',
    name: 'Alejandro Botero',
    correo: 'alejandro@tce.com',
    perfil_usuario: 3, // Empleado
    cargo: 'Especialista en Operaciones',
    departamento: 'dept_colombia',
    departamento_name: 'Colombia',
    activo: true
  },
  {
    _id: '68d171f463082493cc1c3f61',
    name: 'Empleado de Prueba',
    correo: 'prueba@tce.com',
    perfil_usuario: 3, // Empleado
    cargo: 'Especialista de Pruebas',
    departamento: 'dept_usa',
    departamento_name: 'Estados Unidos',
    activo: true
  }
];

// Obtener información de rol por ID
const getUserRole = (perfilUsuario) => {
  const roles = {
    1: {
      name: 'Administrador',
      permissions: ['create_task', 'edit_task', 'delete_task', 'manage_users', 'view_reports', 'manage_departments']
    },
    2: {
      name: 'Supervisor',
      permissions: ['create_task', 'edit_task', 'view_reports', 'manage_users']
    },
    3: {
      name: 'Empleado',
      permissions: ['view_tasks', 'complete_tasks']
    }
  };
  
  return roles[perfilUsuario] || roles[3]; // Por defecto empleado
};

// Obtener usuario por ID
const getUserById = async (userId) => {
  try {
    console.log('🔍 getUserById - ID:', userId);
    
    // Intentar obtener usuario real de la base de datos
    const User = require('../../models/agenda.User');
    const realUser = await User.findById(userId);
    
    if (realUser) {
      console.log('✅ Usuario real encontrado:', realUser.nombre);
      console.log('🔍 Campos del usuario real:', {
        _id: realUser._id,
        nombre: realUser.nombre,
        email: realUser.email,
        perfil_usuario: realUser.perfil_usuario,
        cargo: realUser.cargo,
        departamento: realUser.departamento,
        departamento_name: realUser.departamento_name
      });
      
      // Mapear los campos reales a la estructura esperada
      const mappedUser = {
        _id: realUser._id,
        name: realUser.nombre || 'Usuario Sin Nombre',
        nombre: realUser.nombre || 'Usuario Sin Nombre', // Agregar campo nombre para compatibilidad
        correo: realUser.email || 'sin-email@tce.com',
        perfil_usuario: realUser.perfil_usuario !== undefined ? realUser.perfil_usuario : 3, // Usar valor real o default
        cargo: realUser.cargo !== undefined ? realUser.cargo : 'Sin cargo',
        departamento: realUser.departamento !== undefined ? realUser.departamento : 'dept_default',
        departamento_name: realUser.departamento_name !== undefined ? realUser.departamento_name : 'Sin departamento',
        activo: realUser.activo !== undefined ? realUser.activo : true,
        user_id: realUser.user_id,
        color: realUser.color,
        notificaciones: realUser.notificaciones
      };
      
      // Agregar información de rol
      const roleInfo = getUserRole(mappedUser.perfil_usuario);
      mappedUser.role_name = roleInfo.name;
      mappedUser.role_permissions = roleInfo.permissions;
      
      console.log('👤 Usuario mapeado:', mappedUser.name, '- Rol:', mappedUser.role_name);
      console.log('🔍 Usuario mapeado completo:', {
        _id: mappedUser._id,
        name: mappedUser.name,
        correo: mappedUser.correo,
        perfil_usuario: mappedUser.perfil_usuario,
        cargo: mappedUser.cargo,
        role_name: mappedUser.role_name
      });
      
      return {
        success: true,
        data: mappedUser
      };
    } else {
      console.log('⚠️ Usuario no encontrado en BD, buscando en simulados');
      
      // Fallback a usuarios simulados
      const user = simulatedUsers.find(u => u._id === userId);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      // Agregar información de rol
      const roleInfo = getUserRole(user.perfil_usuario);
      user.role_name = roleInfo.name;
      user.role_permissions = roleInfo.permissions;
      
      // Agregar información del departamento
      if (user.departamento) {
        const department = simulatedDepartments.find(d => d._id === user.departamento);
        if (department) {
          user.department_info = department;
        }
      }
      
      return {
        success: true,
        data: user
      };
    }
  } catch (error) {
    console.error('❌ Error getting user by ID:', error);
    return {
      success: false,
      message: 'Error al obtener usuario'
    };
  }
};

// Verificar si usuario es admin
const isAdmin = async (userId) => {
  try {
    const userResult = await getUserById(userId);
    
    if (!userResult.success) {
      return false;
    }

    // perfil_usuario: 1 = Admin, 2 = Supervisor, 3 = Empleado
    return userResult.data.perfil_usuario === 1;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Verificar si usuario es supervisor o admin
const isSupervisorOrAdmin = async (userId) => {
  try {
    const userResult = await getUserById(userId);
    
    if (!userResult.success) {
      return false;
    }

    // perfil_usuario: 1 = Admin, 2 = Supervisor, 3 = Empleado
    return userResult.data.perfil_usuario <= 2;
  } catch (error) {
    console.error('Error checking supervisor status:', error);
    return false;
  }
};

// Obtener todos los usuarios (para asignaciones)
const getAllUsers = async () => {
  try {
    console.log('🔍 getAllUsers - Intentando obtener usuarios reales de BD...');
    
    // Intentar obtener usuarios reales de la base de datos
    const User = require('../../models/agenda.User');
    const realUsers = await User.find({ activo: true });
    
    if (realUsers && realUsers.length > 0) {
      console.log('✅ Usuarios reales encontrados:', realUsers.length);
      console.log('👥 Primer usuario real (raw):', realUsers[0]);
      
      // Mapear los campos reales a la estructura esperada
      const mappedUsers = realUsers.map(user => ({
        _id: user._id,
        name: user.nombre || 'Usuario Sin Nombre',
        nombre: user.nombre || 'Usuario Sin Nombre', // Agregar campo nombre para compatibilidad
        correo: user.email || 'sin-email@tce.com',
        perfil_usuario: user.perfil_usuario !== undefined ? user.perfil_usuario : 3, // Usar valor real o default
        cargo: user.cargo !== undefined ? user.cargo : 'Sin cargo',
        departamento: user.departamento !== undefined ? user.departamento : 'dept_default',
        departamento_name: user.departamento_name !== undefined ? user.departamento_name : 'Sin departamento',
        activo: user.activo !== undefined ? user.activo : true,
        user_id: user.user_id,
        color: user.color,
        notificaciones: user.notificaciones
      }));
      
      console.log('👥 Primer usuario mapeado:', mappedUsers[0]);
      return {
        success: true,
        data: mappedUsers
      };
    } else {
      console.log('⚠️ No hay usuarios reales, usando simulados');
      return {
        success: true,
        data: simulatedUsers.filter(u => u.activo)
      };
    }
  } catch (error) {
    console.error('❌ Error obteniendo usuarios reales:', error.message);
    console.log('⚠️ Usando usuarios simulados como fallback');
    return {
      success: true,
      data: simulatedUsers.filter(u => u.activo)
    };
  }
};

// Obtener usuarios por rol
const getUsersByRole = async (role) => {
  try {
    // TODO: Reemplazar con consulta real a BD empresa
    const users = simulatedUsers.filter(u => u.activo && u.perfil_usuario === role);
    
    return {
      success: true,
      data: users
    };
  } catch (error) {
    console.error('Error getting users by role:', error);
    return {
      success: false,
      message: 'Error al obtener usuarios por rol'
    };
  }
};

// Obtener todos los departamentos
const getDepartments = () => {
  return simulatedDepartments.filter(dept => dept.active);
};

// Obtener departamento por ID
const getDepartmentById = (departmentId) => {
  return simulatedDepartments.find(dept => dept._id === departmentId);
};

// Obtener nombre del departamento por ID
const getDepartmentName = (departmentId) => {
  const department = simulatedDepartments.find(dept => dept._id === departmentId);
  return department ? department.name : 'Sin departamento';
};

// Obtener usuarios por departamento
const getUsersByDepartment = (departmentId) => {
  return simulatedUsers.filter(user => 
    user.activo && user.departamento === departmentId
  );
};

// Obtener estadísticas por departamento
const getDepartmentStats = (departmentId) => {
  const users = getUsersByDepartment(departmentId);
  const department = getDepartmentById(departmentId);
  
  return {
    department: department,
    total_users: users.length,
    admins: users.filter(u => u.perfil_usuario === 1).length,
    supervisors: users.filter(u => u.perfil_usuario === 2).length,
    employees: users.filter(u => u.perfil_usuario === 3).length
  };
};

// Crear nuevo usuario
const createUser = async (userData) => {
  try {
    console.log('➕ createUser - Datos recibidos:', JSON.stringify(userData, null, 2));
    
    // Validar datos requeridos
    if (!userData.name || !userData.correo || !userData.perfil_usuario || !userData.departamento) {
      console.log('❌ Validación fallida en createUser:');
      console.log('  - name:', userData.name, '(válido:', !!userData.name, ')');
      console.log('  - correo:', userData.correo, '(válido:', !!userData.correo, ')');
      console.log('  - perfil_usuario:', userData.perfil_usuario, '(válido:', !!userData.perfil_usuario, ')');
      console.log('  - departamento:', userData.departamento, '(válido:', !!userData.departamento, ')');
      throw new Error('Faltan datos requeridos para crear usuario');
    }
    
    // Obtener nombre del departamento
    const departmentName = getDepartmentName(userData.departamento);
    console.log('🏢 Departamento encontrado:', departmentName);
    
    // Intentar crear usuario en la base de datos real
    try {
      console.log('💾 Intentando crear usuario en base de datos real...');
      const User = require('../../models/agenda.User');
      
      const newUserData = {
        nombre: userData.name,
        email: userData.correo,
        perfil_usuario: userData.perfil_usuario,
        cargo: userData.cargo || '',
        departamento: userData.departamento,
        departamento_name: departmentName,
        activo: userData.activo !== undefined ? userData.activo : true,
        color: '#007bff',
        notificaciones: {
          email: true,
          whatsapp: false,
          recordatorios_sla: true
        }
      };
      
      console.log('📝 Datos para BD:', JSON.stringify(newUserData, null, 2));
      
      const savedUser = await User.create(newUserData);
      console.log('✅ Usuario creado en BD:', savedUser._id);
      
      // Mapear el usuario de BD a la estructura esperada
      const mappedUser = {
        _id: savedUser._id,
        name: savedUser.nombre,
        nombre: savedUser.nombre, // Agregar campo nombre para compatibilidad
        correo: savedUser.email,
        perfil_usuario: savedUser.perfil_usuario,
        cargo: savedUser.cargo,
        departamento: savedUser.departamento,
        departamento_name: savedUser.departamento_name,
        activo: savedUser.activo,
        created_at: savedUser.createdAt
      };
      
      console.log('👤 Usuario mapeado:', JSON.stringify(mappedUser, null, 2));
      return mappedUser;
      
    } catch (dbError) {
      console.error('❌ Error creando usuario en BD:', dbError.message);
      console.log('⚠️ Fallback a usuarios simulados...');
      
      // Fallback a usuarios simulados si falla la BD
      const newId = new Date().getTime().toString(36) + Math.random().toString(36).substr(2);
      
      const newUser = {
        _id: newId,
        name: userData.name,
        correo: userData.correo,
        perfil_usuario: userData.perfil_usuario,
        cargo: userData.cargo || '',
        departamento: userData.departamento,
        departamento_name: departmentName,
        activo: userData.activo !== undefined ? userData.activo : true,
        created_at: new Date()
      };
      
      console.log('👤 Usuario creado en memoria:', JSON.stringify(newUser, null, 2));
      
      // Agregar a la lista de usuarios simulados
      simulatedUsers.push(newUser);
      
      console.log('✅ Usuario agregado a simulatedUsers. Total usuarios:', simulatedUsers.length);
      return newUser;
    }
  } catch (error) {
    console.error('❌ Error en createUser:', error);
    throw error;
  }
};

// Obtener todos los departamentos
const getAllDepartments = async () => {
  try {
    console.log('🏢 getAllDepartments - Obteniendo todos los departamentos');
    
    // Intentar obtener departamentos reales de la base de datos
    const Department = require('../../models/agenda.Department');
    const realDepartments = await Department.find({ active: true });
    
    if (realDepartments && realDepartments.length > 0) {
      console.log('✅ Departamentos reales encontrados:', realDepartments.length);
      return realDepartments;
    } else {
      console.log('⚠️ No hay departamentos en BD, usando simulados');
      return simulatedDepartments;
    }
  } catch (error) {
    console.error('Error en getAllDepartments:', error);
    console.log('⚠️ Error accediendo a BD, usando departamentos simulados');
    return simulatedDepartments;
  }
};

// Crear nuevo departamento
const createDepartment = async (departmentData) => {
  try {
    console.log('➕ createDepartment - Datos:', departmentData);
    
    // Generar nuevo ID
    const newId = new Date().getTime().toString(36) + Math.random().toString(36).substr(2);
    
    const newDepartment = {
      _id: newId,
      name: departmentData.name,
      code: departmentData.code,
      description: departmentData.description,
      created_by: departmentData.created_by,
      created_at: new Date()
    };
    
    // Intentar crear en la base de datos real primero
    try {
      const Department = require('../../models/agenda.Department');
      
      const realDepartment = new Department({
        name: departmentData.name,
        code: departmentData.code,
        description: departmentData.description,
        country: departmentData.country || 'No especificado',
        active: departmentData.active !== undefined ? departmentData.active : true,
        created_by: departmentData.created_by
      });
      
      const savedDepartment = await realDepartment.save();
      console.log('✅ Departamento creado en BD:', savedDepartment);
      return savedDepartment;
      
    } catch (dbError) {
      console.log('⚠️ Error creando en BD, usando simulación:', dbError.message);
      
      // Fallback a simulación
      simulatedDepartments.push(newDepartment);
      console.log('✅ Departamento creado (simulado):', newDepartment);
      return newDepartment;
    }
  } catch (error) {
    console.error('Error en createDepartment:', error);
    throw error;
  }
};

// Actualizar empleado
const updateUser = async (userId, userData) => {
  try {
    console.log('✏️ updateUser - ID:', userId, 'Datos:', JSON.stringify(userData, null, 2));
    
    // Intentar actualizar en la base de datos real
    try {
      console.log('💾 Intentando actualizar usuario en base de datos real...');
      const User = require('../../models/agenda.User');
      
      // Obtener nombre del departamento
      const departmentName = getDepartmentName(userData.departamento);
      
      const updateData = {
        nombre: userData.name,
        email: userData.correo,
        perfil_usuario: userData.perfil_usuario,
        cargo: userData.cargo || '',
        departamento: userData.departamento,
        departamento_name: departmentName,
        activo: userData.activo !== undefined ? userData.activo : true
      };
      
      console.log('📝 Datos para actualizar en BD:', JSON.stringify(updateData, null, 2));
      
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
      
      if (!updatedUser) {
        throw new Error('Usuario no encontrado en la base de datos');
      }
      
      console.log('✅ Usuario actualizado en BD:', updatedUser._id);
      
      // Mapear el usuario de BD a la estructura esperada
      const mappedUser = {
        _id: updatedUser._id,
        name: updatedUser.nombre,
        nombre: updatedUser.nombre, // Agregar campo nombre para compatibilidad
        correo: updatedUser.email,
        perfil_usuario: updatedUser.perfil_usuario,
        cargo: updatedUser.cargo,
        departamento: updatedUser.departamento,
        departamento_name: updatedUser.departamento_name,
        activo: updatedUser.activo,
        updated_at: updatedUser.updatedAt
      };
      
      console.log('👤 Usuario mapeado:', JSON.stringify(mappedUser, null, 2));
      return mappedUser;
      
    } catch (dbError) {
      console.error('❌ Error actualizando usuario en BD:', dbError.message);
      console.log('⚠️ Fallback a usuarios simulados...');
      
      // Fallback a usuarios simulados si falla la BD
      const userIndex = simulatedUsers.findIndex(u => u._id === userId);
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }
      
      // Actualizar datos del usuario
      const updatedUser = {
        ...simulatedUsers[userIndex],
        name: userData.name || simulatedUsers[userIndex].name,
        correo: userData.correo || simulatedUsers[userIndex].correo,
        perfil_usuario: userData.perfil_usuario || simulatedUsers[userIndex].perfil_usuario,
        cargo: userData.cargo || simulatedUsers[userIndex].cargo,
        departamento: userData.departamento || simulatedUsers[userIndex].departamento,
        departamento_name: userData.departamento ? getDepartmentName(userData.departamento) : simulatedUsers[userIndex].departamento_name,
        activo: userData.activo !== undefined ? userData.activo : simulatedUsers[userIndex].activo,
        updated_at: new Date()
      };
      
      simulatedUsers[userIndex] = updatedUser;
      
      console.log('✅ Usuario actualizado en memoria:', updatedUser);
      return updatedUser;
    }
  } catch (error) {
    console.error('❌ Error en updateUser:', error);
    throw error;
  }
};

// Eliminar empleado (soft delete)
const deleteUser = async (userId) => {
  try {
    console.log('🗑️ deleteUser - ID:', userId);
    
    // Intentar eliminar en la base de datos real
    try {
      console.log('💾 Intentando eliminar usuario en base de datos real...');
      const User = require('../../models/agenda.User');
      
      // Soft delete - marcar como inactivo
      const deletedUser = await User.findByIdAndUpdate(userId, { 
        activo: false,
        deleted_at: new Date()
      }, { new: true });
      
      if (!deletedUser) {
        throw new Error('Usuario no encontrado en la base de datos');
      }
      
      console.log('✅ Usuario eliminado en BD (soft delete):', deletedUser.nombre);
      return { success: true, message: 'Usuario eliminado correctamente' };
      
    } catch (dbError) {
      console.error('❌ Error eliminando usuario en BD:', dbError.message);
      console.log('⚠️ Fallback a usuarios simulados...');
      
      // Fallback a usuarios simulados si falla la BD
      const userIndex = simulatedUsers.findIndex(u => u._id === userId);
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }
      
      // Soft delete - marcar como inactivo
      simulatedUsers[userIndex].activo = false;
      simulatedUsers[userIndex].deleted_at = new Date();
      
      console.log('✅ Usuario eliminado en memoria (soft delete):', simulatedUsers[userIndex].name);
      return { success: true, message: 'Usuario eliminado correctamente' };
    }
  } catch (error) {
    console.error('❌ Error en deleteUser:', error);
    throw error;
  }
};

// Obtener empleado por ID para edición
const getUserByIdForEdit = async (userId) => {
  try {
    console.log('👤 getUserByIdForEdit - ID:', userId);
    
    // Intentar obtener de la base de datos real
    try {
      console.log('💾 Intentando obtener usuario para edición de BD...');
      const User = require('../../models/agenda.User');
      
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado en la base de datos');
      }
      
      console.log('✅ Usuario encontrado en BD para edición:', user.nombre);
      
      // Mapear el usuario de BD a la estructura esperada
      const mappedUser = {
        _id: user._id,
        name: user.nombre,
        nombre: user.nombre, // Agregar campo nombre para compatibilidad
        correo: user.email,
        perfil_usuario: user.perfil_usuario,
        cargo: user.cargo,
        departamento: user.departamento,
        departamento_name: user.departamento_name,
        activo: user.activo
      };
      
      console.log('👤 Usuario mapeado para edición:', JSON.stringify(mappedUser, null, 2));
      return mappedUser;
      
    } catch (dbError) {
      console.error('❌ Error obteniendo usuario de BD para edición:', dbError.message);
      console.log('⚠️ Fallback a usuarios simulados...');
      
      // Fallback a usuarios simulados si falla la BD
      const user = simulatedUsers.find(u => u._id === userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      console.log('✅ Usuario encontrado en memoria para edición:', user.name);
      return user;
    }
  } catch (error) {
    console.error('❌ Error en getUserByIdForEdit:', error);
    throw error;
  }
};

module.exports = {
  getUserById,
  getUserRole,
  isAdmin,
  isSupervisorOrAdmin,
  getAllUsers,
  getUsersByRole,
  getDepartments,
  getDepartmentById,
  getUsersByDepartment,
  getDepartmentStats,
  createUser,
  updateUser,
  deleteUser,
  getUserByIdForEdit,
  getAllDepartments,
  createDepartment
};
