const TaskDefinition = require('../../models/agenda.TaskDefinition');
const TaskAssignment = require('../../models/agenda.TaskAssignment');
const TaskLog = require('../../models/agenda.TaskLog');
const Tag = require('../../models/agenda.Tag');
const AgendaUser = require('../../models/agenda.User');

// Función para detectar tareas atrasadas
const getOverdueTasks = async (userId) => {
  const TaskLog = require('../../models/agenda.TaskLog');
  const TaskAssignment = require('../../models/agenda.TaskAssignment');
  
  const overdueTasks = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Obtener todas las tareas del usuario
  const userTasks = await TaskDefinition.find({
    $or: [
      { assigned_users: userId },
      { specific_user: userId }
    ],
    active: true
  });
  
  for (const taskDef of userTasks) {
    const taskAssignment = await TaskAssignment.findOne({
      task_definition: taskDef._id,
      user: userId,
      activo: true
    });
    
    if (!taskAssignment) continue;
    
    // Verificar si la tarea debe aparecer en días anteriores
    const overdueDays = [];
    
    // Verificar últimos 7 días
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      if (shouldShowTaskToday(taskDef, checkDate)) {
        // Verificar si hay logs para este día
        const dayStart = new Date(checkDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        
        const dayLogs = await TaskLog.find({
          task_assignment: taskAssignment._id,
          log_date: { $gte: dayStart, $lt: dayEnd }
        });
        
        // Verificar si la tarea está completada para este día
        let isCompleted = false;
        if (taskDef.mode === 'binary') {
          isCompleted = dayLogs.some(log => log.action_type === 'completed');
        } else if (taskDef.mode === 'counter') {
          const current = dayLogs.reduce((sum, log) => {
            if (log.action_type === 'increment') {
              return sum + (log.value || 1);
            }
            return sum;
          }, 0);
          isCompleted = current >= taskDef.target_per_period;
        }
        
        // Verificar si la tarea fue marcada como "No Aplica" (para ambos tipos)
        const isNotApplicable = dayLogs.some(log => 
          log.action_type === 'not_applicable' || 
          (log.action_type === 'completed' && log.comment && log.comment.includes('No aplica'))
        );
        
        // Si fue marcada como "No Aplica", considerarla como completada
        if (isNotApplicable) {
          isCompleted = true;
        }
        
        if (!isCompleted) {
          overdueDays.push({
            date: new Date(checkDate),
            dateStr: checkDate.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })
          });
        }
      }
    }
    
    // Verificar si la tarea fue marcada como "No Aplica" HOY
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    const todayLogs = await TaskLog.find({
      task_assignment: taskAssignment._id,
      log_date: { $gte: todayStart, $lt: todayEnd }
    });
    
    // Verificar si la tarea está completada HOY (incluyendo "No Aplica")
    let isCompletedToday = false;
    if (taskDef.mode === 'binary') {
      isCompletedToday = todayLogs.some(log => log.action_type === 'completed');
    } else if (taskDef.mode === 'counter') {
      const current = todayLogs.reduce((sum, log) => {
        if (log.action_type === 'increment') {
          return sum + (log.value || 1);
        }
        return sum;
      }, 0);
      isCompletedToday = current >= taskDef.target_per_period;
    }
    
    // Verificar si la tarea fue marcada como "No Aplica" HOY
    const isNotApplicableToday = todayLogs.some(log => 
      log.action_type === 'not_applicable' || 
      (log.action_type === 'completed' && log.comment && log.comment.includes('No aplica'))
    );
    
    // Si fue marcada como "No Aplica" HOY, considerarla como completada
    if (isNotApplicableToday) {
      isCompletedToday = true;
    }
    
    // Solo agregar a tareas atrasadas si NO está completada HOY y tiene días atrasados
    if (overdueDays.length > 0 && !isCompletedToday) {
      overdueTasks.push({
        ...taskDef.toObject(),
        _id: `overdue_${taskDef._id}_${userId}`, // ID especial para tareas atrasadas
        overdue_days: overdueDays,
        assignment_id: taskAssignment._id,
        assignment_type: 'overdue' // Marcar como tarea atrasada
      });
    }
  }
  
  return overdueTasks;
};

// Función para determinar si una tarea debe aparecer hoy
const shouldShowTaskToday = (taskDef, targetDate = new Date()) => {
  // Configurar timezone de Charlotte, USA (EST/EDT)
  const charlotteDate = new Date(targetDate.toLocaleString("en-US", {timeZone: "America/New_York"}));
  
  const dayOfWeek = charlotteDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  const dayOfMonth = charlotteDate.getDate();
  const isMonday = dayOfWeek === 1;
  const isThursday = dayOfWeek === 4;
  const is15th = dayOfMonth === 15;
  const is1st = dayOfMonth === 1;
  
  // Verificar si la tarea tiene días específicos configurados
  if (taskDef.specific_days && taskDef.specific_days.length > 0) {
    // Para tareas semanales, usar días de la semana (0-6)
    // Para tareas mensuales, usar días del mes (1-31)
    if (taskDef.periodicity === 'weekly') {
      return taskDef.specific_days.includes(dayOfWeek);
    } else {
      return taskDef.specific_days.includes(dayOfMonth);
    }
  }
  
  // Lógica por periodicidad
  switch (taskDef.periodicity) {
    case 'daily':
      return true;
      
    case 'weekly':
      // Tareas semanales aparecen todos los días si no tienen días específicos
      // Si tienen días específicos, solo aparecen en esos días
      if (taskDef.specific_days && taskDef.specific_days.length > 0) {
        return taskDef.specific_days.includes(dayOfWeek);
      }
      return true; // Por defecto aparecen todos los días
      
    case 'monthly':
      // Tareas mensuales aparecen todos los días si no tienen días específicos
      // Si tienen días específicos, solo aparecen en esos días
      if (taskDef.specific_days && taskDef.specific_days.length > 0) {
        return taskDef.specific_days.includes(dayOfMonth);
      }
      return true; // Por defecto aparecen todos los días
      
    case 'monThu':
      // Solo lunes y jueves
      return isMonday || isThursday;
      
    case 'biweekly':
      // Quincenal - aparece cada 15 días (día 1 y 15)
      return is1st || is15th;
      
    default:
      return true;
  }
};

// Obtener tareas de hoy para un usuario
const getTodayTasks = async (userId) => {
  try {
    console.log(`🔍 getTodayTasks llamado para usuario: ${userId}`);
    console.log(`🔍 Tipo de userId: ${typeof userId}`);
    console.log(`🔍 userId.toString(): ${userId.toString()}`);
    
    // Sistema de asignaciones específicas:
    // - Todas las tareas son específicas y asignadas a 1-2 usuarios
    // - Solo los usuarios asignados pueden ver y completar la tarea
    
    // Obtener todas las tareas activas (sin populate para evitar problemas)
    const allAvailableTasks = await TaskDefinition.find({
      active: true
    });
    
    console.log(`📊 Total de tareas activas encontradas: ${allAvailableTasks.length}`);

    // Filtrar tareas por usuario asignado
    const userTasks = allAvailableTasks.filter(taskDef => {
      console.log(`🔍 Verificando tarea: ${taskDef.title}`);
      console.log(`  - assigned_users: ${taskDef.assigned_users}`);
      console.log(`  - specific_user: ${taskDef.specific_user}`);
      
      // Verificar si el usuario está en la lista de usuarios asignados
      if (taskDef.assigned_users && taskDef.assigned_users.length > 0) {
        const isAssigned = taskDef.assigned_users.some(assignedUserId => {
          return assignedUserId.toString() === userId;
        });
        console.log(`  - ¿Está en assigned_users? ${isAssigned}`);
        if (isAssigned) return true;
      }
      
      // Compatibilidad temporal: verificar specific_user
      if (taskDef.specific_user) {
        const isSpecific = taskDef.specific_user.toString() === userId;
        console.log(`  - ¿Es specific_user? ${isSpecific}`);
        if (isSpecific) return true;
      }
      
      // Si no tiene usuarios asignados, no mostrar la tarea
      console.log(`  - ❌ No tiene usuarios asignados`);
      return false;
    });
    
    console.log(`📋 Tareas filtradas para el usuario: ${userTasks.length}`);

    // Hacer populate solo de tags (assigned_users y specific_user son strings, no referencias)
    const populatedTasks = await TaskDefinition.populate(userTasks, [
      { path: 'tags', select: 'name display_name color category' }
    ]);

    // Filtrar tareas que deben aparecer hoy según su periodicidad
    const todayTasks = populatedTasks.filter(taskDef => {
      const shouldShow = shouldShowTaskToday(taskDef);
      console.log(`📅 Tarea ${taskDef.title} (${taskDef.periodicity}): ¿Mostrar hoy? ${shouldShow}`);
      return shouldShow;
    });
    
    console.log(`📅 Tareas que aparecen hoy: ${todayTasks.length}`);
    
    // Obtener tareas atrasadas
    console.log(`🔍 Obteniendo tareas atrasadas...`);
    const overdueTasks = await getOverdueTasks(userId);
    console.log(`⚠️ Tareas atrasadas encontradas: ${overdueTasks.length}`);

    // Crear asignaciones virtuales para el procesamiento
    const virtualAssignments = todayTasks.map(taskDef => ({
      _id: `virtual_${taskDef._id}_${userId}`,
      task_definition: taskDef,
      user: { _id: userId, nombre: 'Usuario Actual' }
    }));

    // Para cada tarea, obtener el progreso de hoy
    const tasksWithProgress = await Promise.all(
      virtualAssignments.map(async (assignment) => {
        const taskDef = assignment.task_definition;
        
        // Obtener logs de hoy para esta tarea y usuario
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Buscar logs de hoy para esta tarea y usuario
        // Como es un sistema abierto, cualquier usuario puede registrar cualquier tarea
        const taskAssignment = await TaskAssignment.findOne({
          task_definition: taskDef._id,
          user: userId,
          activo: true
        });
        
        let todayLogs = [];
        if (taskAssignment) {
          todayLogs = await TaskLog.find({
            task_assignment: taskAssignment._id,
            log_date: { $gte: today, $lt: tomorrow }
          });
          console.log(`🔍 Logs de hoy para tarea ${taskDef.title}: ${todayLogs.length} logs encontrados`);
          if (todayLogs.length > 0) {
            console.log(`🔍 Logs encontrados:`, todayLogs.map(log => ({ action_type: log.action_type, comment: log.comment })));
          }
        } else {
          console.log(`⚠️ No se encontró TaskAssignment para tarea ${taskDef.title} y usuario ${userId}`);
        }

        // Calcular progreso
        let completed = false;
        let current = 0;

        if (taskDef.mode === 'binary') {
          completed = todayLogs.some(log => log.action_type === 'completed');
          current = completed ? 1 : 0;
        } else if (taskDef.mode === 'counter') {
          current = todayLogs.reduce((sum, log) => {
            if (log.action_type === 'increment') {
              return sum + (log.value || 1);
            }
            return sum;
          }, 0);
          completed = current >= taskDef.target_per_period;
        }
        
        // Verificar si la tarea fue marcada como "No Aplica" (para ambos tipos)
        const isNotApplicable = todayLogs.some(log => 
          log.action_type === 'not_applicable' || 
          (log.action_type === 'completed' && log.comment && log.comment.includes('No aplica'))
        );
        
        // Si fue marcada como "No Aplica", considerarla como completada para filtrarla
        if (isNotApplicable) {
          completed = true;
          console.log(`🚫 Tarea ${taskDef.title} marcada como "No Aplica" - será filtrada`);
        }

        // Si la tarea está completada, no incluirla en la respuesta
        if (completed) {
          return null;
        }

        // Verificar SLA
        let slaStatus = 'success'; // verde
        if (taskDef.sla_time) {
          const now = new Date();
          const slaTime = taskDef.sla_time.split(':');
          const slaDateTime = new Date();
          slaDateTime.setHours(parseInt(slaTime[0]), parseInt(slaTime[1]), 0, 0);
          
          if (now > slaDateTime && !completed) {
            slaStatus = 'danger'; // rojo
          } else if (now > new Date(slaDateTime.getTime() - 30 * 60 * 1000) && !completed) {
            slaStatus = 'warning'; // amarillo
          }
        }

        return {
          _id: taskDef._id.toString(), // ID real de la tarea para el frontend
          id: assignment._id.toString(), // ID virtual para compatibilidad
          assignment_id: assignment._id,
          title: taskDef.title,
          description: taskDef.description,
          mode: taskDef.mode,
          periodicity: taskDef.periodicity,
          target_per_period: taskDef.target_per_period,
          sla_time: taskDef.sla_time,
          requires_evidence: taskDef.requires_evidence,
          tags: taskDef.tags || [],
          completed,
          current,
          sla_status: slaStatus,
          user: assignment.user,
          assignment_type: 'specific',
          assigned_users: taskDef.assigned_users || (taskDef.specific_user ? [taskDef.specific_user] : []),
          assignment_note: taskDef.assigned_users && taskDef.assigned_users.length > 1
            ? `Tarea asignada a ${taskDef.assigned_users.length} usuarios`
            : taskDef.assigned_users && taskDef.assigned_users.length === 1
            ? `Tarea asignada a ${taskDef.assigned_users[0].name || 'usuario específico'}`
            : taskDef.specific_user
            ? `Tarea asignada a ${taskDef.specific_user.nombre || taskDef.specific_user.name || 'usuario específico'}`
            : 'Tarea sin asignar'
        };
      })
    );

    // Filtrar tareas completadas (valores null)
    const availableTasks = tasksWithProgress.filter(task => task !== null);

    // Información adicional sobre la fecha y timezone
    const charlotteDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
    const dayOfWeek = charlotteDate.getDay();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    // Procesar tareas atrasadas para la respuesta
    const processedOverdueTasks = overdueTasks.map(task => {
      const assignment = {
        _id: task.assignment_id,
        task_definition: task,
        user: { _id: userId, nombre: 'Usuario Actual' }
      };
      
      return {
        ...task,
        _id: `overdue_${task._id}_${userId}`,
        title: `${task.title}`,
        description: task.description,
        mode: task.mode,
        periodicity: task.periodicity,
        target_per_period: task.target_per_period,
        sla_time: task.sla_time,
        requires_evidence: task.requires_evidence,
        tags: task.tags || [],
        completed: false,
        current: 0,
        sla_status: 'overdue',
        user: userId,
        assignment_type: 'overdue',
        overdue_info: task.overdue_days,
        assignment_note: `Tarea atrasada desde: ${task.overdue_days.map(d => d.dateStr).join(', ')}`
      };
    });

    // Combinar tareas de hoy con tareas atrasadas
    const allTasksForToday = [...availableTasks, ...processedOverdueTasks];

    return {
      success: true,
      data: allTasksForToday,
      dateInfo: {
        charlotte_date: charlotteDate,
        day_of_week: dayOfWeek,
        day_name: dayNames[dayOfWeek],
        day_of_month: charlotteDate.getDate(),
        timezone: 'America/New_York',
        total_tasks_available: allAvailableTasks.length,
        user_tasks_available: populatedTasks.length,
        tasks_showing_today: availableTasks.length,
        overdue_tasks_count: overdueTasks.length,
        total_tasks_for_today: allTasksForToday.length
      }
    };

  } catch (error) {
    console.error('Error in getTodayTasks:', error);
    return {
      success: false,
      message: 'Error al obtener las tareas de hoy',
      error: error.message
    };
  }
};

// Registrar actividad de una tarea - VERSIÓN SIMPLIFICADA Y ROBUSTA
const logTask = async (assignmentId, userId, actionType, options = {}) => {
  try {
    console.log('🔍 logTask iniciado con:', { assignmentId, userId, actionType, options });
    
    const { 
      value = 1, 
      comment = '', 
      evidence_file = null, 
      retroactive_date = null, 
      not_applicable_reason = null, 
      overdue_days = null 
    } = options;

    // Determinar si es una asignación virtual (tarea general) o real
    let assignment;
    
    if (assignmentId.startsWith('virtual_')) {
      // Es una tarea general, necesitamos crear o encontrar la asignación
      const taskDefinitionId = assignmentId.replace('virtual_', '').replace(`_${userId}`, '');
      
      // Buscar la definición de tarea
      const taskDefinition = await TaskDefinition.findById(taskDefinitionId);
      if (!taskDefinition) {
        return {
          success: false,
          message: 'Tarea no encontrada'
        };
      }

      // Verificar que la tarea es general o específica para este usuario
      if (taskDefinition.assignment_type === 'specific' && taskDefinition.specific_user && taskDefinition.specific_user.toString() !== userId) {
        return {
          success: false,
          message: 'No tienes autorización para realizar esta tarea'
        };
      }

      // Buscar o crear asignación para esta tarea y usuario
      assignment = await TaskAssignment.findOne({
        task_definition: taskDefinitionId,
        user: userId,
        activo: true
      });

      if (!assignment) {
        // Crear nueva asignación
        assignment = new TaskAssignment({
          task_definition: taskDefinitionId,
          user: userId,
          start_date: new Date(),
          activo: true,
          assignment_type: taskDefinition.assignment_type === 'anyone' ? 'general' : 'specific'
        });
        await assignment.save();
      }

      // Poblar la definición de tarea
      await assignment.populate('task_definition');
    } else if (assignmentId.startsWith('overdue_')) {
      // Es una tarea atrasada, extraer el ID de la definición de tarea
      // Formato: overdue_TASKID_USERID o overdue_overdue_TASKID_USERID (si se duplica)
      const parts = assignmentId.split('_');
      let taskDefinitionId;
      
      // Detectar si hay duplicación del prefijo 'overdue_'
      if (parts.length >= 4 && parts[0] === 'overdue' && parts[1] === 'overdue') {
        // Formato: overdue_overdue_TASKID_USERID
        taskDefinitionId = parts[2];
      } else if (parts.length >= 3) {
        // Formato: overdue_TASKID_USERID
        taskDefinitionId = parts[1];
      } else {
        return {
          success: false,
          message: 'ID de tarea atrasada inválido'
        };
      }
      
      // Buscar la definición de tarea
      const taskDefinition = await TaskDefinition.findById(taskDefinitionId);
      if (!taskDefinition) {
        return {
          success: false,
          message: 'Tarea no encontrada'
        };
      }

      // Verificar que la tarea es general o específica para este usuario
      if (taskDefinition.assignment_type === 'specific' && taskDefinition.specific_user && taskDefinition.specific_user.toString() !== userId) {
        return {
          success: false,
          message: 'No tienes autorización para realizar esta tarea'
        };
      }

      // Buscar o crear asignación para esta tarea y usuario
      assignment = await TaskAssignment.findOne({
        task_definition: taskDefinitionId,
        user: userId,
        activo: true
      });

      if (!assignment) {
        // Crear nueva asignación
        assignment = new TaskAssignment({
          task_definition: taskDefinitionId,
          user: userId,
          start_date: new Date(),
          activo: true,
          assignment_type: taskDefinition.assignment_type === 'anyone' ? 'general' : 'specific'
        });
        await assignment.save();
      }

      // Poblar la definición de tarea
      await assignment.populate('task_definition');
    } else {
      // Es una asignación real
      assignment = await TaskAssignment.findOne({
        _id: assignmentId,
        user: userId,
        activo: true
      }).populate('task_definition');

      if (!assignment) {
        return {
          success: false,
          message: 'Asignación no encontrada o no autorizada'
        };
      }
    }

    // Preparar evidencia si hay archivo
    let evidence = [];
    if (evidence_file) {
      evidence = [{
        filename: evidence_file.filename,
        original_name: evidence_file.originalname,
        mime_type: evidence_file.mimetype,
        size: evidence_file.size,
        url: `/uploads/${evidence_file.filename}`,
        uploaded_at: new Date()
      }];
    }

    // Manejar casos especiales de forma segura
    let logDate = new Date();
    let finalComment = comment || '';
    let finalActionType = actionType;
    let finalValue = value;
    
    // Opción C: Completar con fecha retroactiva
    if (retroactive_date && actionType === 'completed') {
      try {
        logDate = new Date(retroactive_date);
        finalComment = comment || `Completado retroactivamente para fecha: ${retroactive_date}`;
      } catch (e) {
        console.log('⚠️ Error con fecha retroactiva:', e.message);
      }
    }
    
    // Opción D: Marcar como no aplicable
    if (actionType === 'not_applicable') {
      finalActionType = 'completed'; // Se marca como completada pero con estado especial
      finalValue = 1;
      finalComment = comment || 'Marcada como no aplicable';
      
      // Agregar información adicional sobre fechas no aplicables de forma segura
      if (overdue_days) {
        try {
          const overdueDays = JSON.parse(overdue_days);
          finalComment += ` (Fechas no aplicables: ${overdueDays.map(day => day.dateStr).join(', ')})`;
        } catch (e) {
          console.log('⚠️ Error parsing overdue_days:', e.message);
          finalComment += ` (Fechas no aplicables: ${overdue_days})`;
        }
      }
    }

    // Crear el log
    const log = new TaskLog({
      task_assignment: assignment._id,
      user: userId,
      action_type: finalActionType,
      value: finalValue,
      comment: finalComment,
      evidence: evidence,
      log_date: logDate
    });

    // Calcular si está atrasado basado en SLA
    if (assignment.task_definition && assignment.task_definition.sla_time) {
      log.calculateSLAStatus(assignment.task_definition);
    }

    await log.save();

    // Si es una tarea completada (binary) y tiene múltiples usuarios asignados,
    // crear logs para todos los usuarios asignados
    if (finalActionType === 'completed' && assignment.task_definition && assignment.task_definition.assigned_users && assignment.task_definition.assigned_users.length > 1) {
      console.log('🔄 Completando tarea para todos los usuarios asignados:', assignment.task_definition.assigned_users);
      
      const allAssignedUsers = assignment.task_definition.assigned_users;
      const logsForAllUsers = [];
      
      for (const assignedUserId of allAssignedUsers) {
        // Saltar si ya es el usuario que completó la tarea
        if (assignedUserId.toString() === userId.toString()) {
          continue;
        }
        
        // Buscar o crear asignación para este usuario
        let userAssignment = await TaskAssignment.findOne({
          task_definition: assignment.task_definition._id,
          user: assignedUserId,
          activo: true
        });
        
        if (!userAssignment) {
          // Crear nueva asignación para este usuario
          userAssignment = new TaskAssignment({
            task_definition: assignment.task_definition._id,
            user: assignedUserId,
            start_date: new Date(),
            activo: true,
            assignment_type: assignment.task_definition.assignment_type === 'anyone' ? 'general' : 'specific'
          });
          await userAssignment.save();
        }
        
        // Crear log para este usuario
        const userLog = new TaskLog({
          task_assignment: userAssignment._id,
          user: assignedUserId,
          action_type: 'completed',
          value: 1,
          comment: comment + ` (Completado automáticamente)`,
          evidence: evidence,
          log_date: new Date()
        });
        
        // Calcular SLA para este log también
        if (assignment.task_definition.sla_time) {
          userLog.calculateSLAStatus(assignment.task_definition);
        }
        
        await userLog.save();
        logsForAllUsers.push(userLog);
        
        console.log(`✅ Tarea completada para usuario: ${assignedUserId}`);
      }
      
      console.log(`🎉 Tarea completada para ${logsForAllUsers.length + 1} usuarios en total`);
    }

    // Poblar datos para la respuesta
    await log.populate('user', 'nombre email');
    await log.populate('task_assignment');

    return {
      success: true,
      message: 'Tarea registrada exitosamente',
      data: log
    };

  } catch (error) {
    console.error('Error in logTask:', error);
    return {
      success: false,
      message: 'Error al registrar la tarea',
      error: error.message
    };
  }
};

// Obtener historial de tareas
const getTaskHistory = async (userId, startDate, endDate) => {
  try {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Buscar logs del usuario en el rango de fechas
    const logs = await TaskLog.find({
      user: userId,
      log_date: { $gte: start, $lte: end }
    })
    .populate('user', 'nombre email')
    .populate({
      path: 'task_assignment',
      populate: {
        path: 'task_definition',
        model: 'TaskDefinition'
      }
    })
    .sort({ log_date: -1 });

    return {
      success: true,
      data: {
        logs,
        period: {
          start_date: start,
          end_date: end
        },
        total_logs: logs.length
      }
    };

  } catch (error) {
    console.error('Error in getTaskHistory:', error);
    return {
      success: false,
      message: 'Error al obtener el historial de tareas',
      error: error.message
    };
  }
};

// Obtener estadísticas del dashboard
const getDashboardStats = async (userId) => {
  try {
    // Obtener tareas de hoy
    const todayTasks = await getTodayTasks(userId);
    const todayTasksData = todayTasks.success ? todayTasks.data : [];
    
    // Calcular estadísticas
    const stats = {
      today_tasks: todayTasksData.length,
      completed_today: todayTasksData.filter(t => t.completed).length,
      in_progress: todayTasksData.filter(t => !t.completed && t.current > 0).length,
      overdue: todayTasksData.filter(t => t.sla_status === 'danger').length,
      sla_compliance: calculateSLACompliance(todayTasksData)
    };
    
    return stats;
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    throw error;
  }
};

// Calcular cumplimiento de SLA
const calculateSLACompliance = (tasks) => {
  if (tasks.length === 0) return 100;
  
  const tasksWithSLA = tasks.filter(t => t.sla_time);
  if (tasksWithSLA.length === 0) return 100;
  
  const compliantTasks = tasksWithSLA.filter(t => t.sla_status === 'success').length;
  return Math.round((compliantTasks / tasksWithSLA.length) * 100);
};

// Obtener progreso semanal
const getWeeklyProgress = async (userId) => {
  try {
    // Obtener logs de la última semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const logs = await TaskLog.find({
      user: userId,
      log_date: { $gte: oneWeekAgo }
    }).sort({ log_date: 1 });
    
    // Agrupar por día
    const dailyData = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      dailyData[dayKey] = 0;
    }
    
    // Contar tareas completadas por día
    logs.forEach(log => {
      if (log.action_type === 'completed' || log.action_type === 'increment') {
        const dayKey = log.log_date.toISOString().split('T')[0];
        if (dailyData[dayKey] !== undefined) {
          dailyData[dayKey]++;
        }
      }
    });
    
    const labels = [];
    const completed = [];
    const target = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('es-ES', { weekday: 'short' }));
      const dayKey = date.toISOString().split('T')[0];
      completed.push(dailyData[dayKey] || 0);
      target.push(5); // Meta diaria por defecto
    }
    
    return { labels, completed, target };
  } catch (error) {
    console.error('Error in getWeeklyProgress:', error);
    throw error;
  }
};

// Obtener tareas prioritarias
const getPriorityTasks = async (userId) => {
  try {
    const todayTasks = await getTodayTasks(userId);
    const todayTasksData = todayTasks.success ? todayTasks.data : [];
    
    // Filtrar tareas con SLA vencido o próximo a vencer
    const priorityTasks = todayTasksData.filter(task => 
      task.sla_status === 'danger' || task.sla_status === 'warning'
    );
    
    return priorityTasks;
  } catch (error) {
    console.error('Error in getPriorityTasks:', error);
    throw error;
  }
};

// Obtener actividad reciente
const getRecentActivity = async (userId) => {
  try {
    console.log('🔍 getRecentActivity - Usuario:', userId);
    
    const recentLogs = await TaskLog.find({
      user: userId
    })
    .populate('user', 'nombre email', 'agenda.User') // Poblar el campo user
    .populate('task_assignment')
    .populate({
      path: 'task_assignment',
      populate: {
        path: 'task_definition',
        select: 'title'
      }
    })
    .sort({ log_date: -1 })
    .limit(10);
    
    console.log(`📊 getRecentActivity - Encontrados ${recentLogs.length} logs`);
    
    const activity = recentLogs.map((log, index) => {
      console.log(`🔍 Log ${index + 1}:`, {
        id: log._id,
        user: log.user,
        user_nombre: log.user?.nombre,
        task_title: log.task_assignment?.task_definition?.title
      });
      
      return {
        task_title: log.task_assignment?.task_definition?.title || 'Tarea eliminada',
        user_name: log.user?.nombre || 'Usuario eliminado', // Agregar campo user_name
        action_type: log.action_type,
        value: log.value,
        comment: log.comment,
        created_at: log.log_date
      };
    });
    
    console.log('📊 getRecentActivity - Actividad mapeada:', activity.slice(0, 3));
    return activity;
  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    throw error;
  }
};

// Obtener todas las tareas del usuario
const getAllUserTasks = async (userId) => {
  try {
    // Obtener todas las tareas asignadas al usuario
    const allAvailableTasks = await TaskDefinition.find({
      active: true
    });

    // Filtrar tareas por usuario asignado
    const userTasks = allAvailableTasks.filter(taskDef => {
      // Verificar si el usuario está en la lista de usuarios asignados
      if (taskDef.assigned_users && taskDef.assigned_users.length > 0) {
        return taskDef.assigned_users.some(assignedUserId => {
          return assignedUserId.toString() === userId;
        });
      }
      
      // Compatibilidad temporal: verificar specific_user
      if (taskDef.specific_user) {
        return taskDef.specific_user.toString() === userId;
      }
      
      return false;
    });

    // Hacer populate de las tareas filtradas
    const populatedTasks = await TaskDefinition.find({
      _id: { $in: userTasks.map(t => t._id) },
      active: true
    }).populate('tags', 'name display_name color category')
      .populate('assigned_users', 'nombre email')
      .populate('specific_user', 'nombre email');

    // Crear asignaciones virtuales y obtener logs
    const tasksWithProgress = await Promise.all(
      populatedTasks.map(async (taskDef) => {
        // Crear asignación virtual
        const assignment = {
          _id: `virtual_${taskDef._id}_${userId}`,
          task_definition: taskDef,
          user: userId,
          start_date: new Date(),
          activo: true
        };

        // Obtener logs de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Verificar que assignment._id sea un ObjectId válido
        let todayLogs = [];
        if (assignment._id && assignment._id.toString().length === 24) {
          todayLogs = await TaskLog.find({
            task_assignment: assignment._id,
            log_date: { $gte: today, $lt: tomorrow }
          });
        }

        // Calcular progreso
        let completed = false;
        let current = 0;

        if (taskDef.mode === 'binary') {
          completed = todayLogs.some(log => log.action_type === 'completed');
          current = completed ? 1 : 0;
        } else if (taskDef.mode === 'counter') {
          current = todayLogs.reduce((sum, log) => {
            if (log.action_type === 'increment') {
              return sum + (log.value || 1);
            }
            return sum;
          }, 0);
          completed = current >= taskDef.target_per_period;
        }

        // Verificar SLA
        let slaStatus = 'success';
        if (taskDef.sla_time) {
          const now = new Date();
          const slaTime = taskDef.sla_time.split(':');
          const slaDateTime = new Date();
          slaDateTime.setHours(parseInt(slaTime[0]), parseInt(slaTime[1]), 0, 0);
          
          if (now > slaDateTime && !completed) {
            slaStatus = 'danger';
          } else if (now > new Date(slaDateTime.getTime() - 30 * 60 * 1000) && !completed) {
            slaStatus = 'warning';
          }
        }

        return {
          _id: taskDef._id.toString(), // ID real de la tarea para el frontend
          id: assignment._id.toString(), // ID virtual para compatibilidad
          assignment_id: assignment._id,
          title: taskDef.title,
          description: taskDef.description,
          mode: taskDef.mode,
          periodicity: taskDef.periodicity,
          target_per_period: taskDef.target_per_period,
          sla_time: taskDef.sla_time,
          requires_evidence: taskDef.requires_evidence,
          tags: taskDef.tags || [],
          completed,
          current,
          sla_status: slaStatus,
          user: assignment.user,
          assignment_type: 'specific',
          assigned_users: taskDef.assigned_users || (taskDef.specific_user ? [taskDef.specific_user] : []),
          assignment_note: taskDef.assigned_users && taskDef.assigned_users.length > 1
            ? `Tarea asignada a ${taskDef.assigned_users.length} usuarios`
            : taskDef.assigned_users && taskDef.assigned_users.length === 1
            ? `Tarea asignada a ${taskDef.assigned_users[0].name || 'usuario específico'}`
            : taskDef.specific_user
            ? `Tarea asignada a ${taskDef.specific_user.nombre || taskDef.specific_user.name || 'usuario específico'}`
            : 'Tarea sin asignar'
        };
      })
    );

    return tasksWithProgress;
  } catch (error) {
    console.error('Error in getAllUserTasks:', error);
    throw error;
  }
};

// Obtener todos los usuarios (solo admin)
const getAllUsers = async () => {
  try {
    // Por ahora usar el servicio simulado
    const UserService = require('./agenda.userService');
    return UserService.getAllUsers();
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
};

// Obtener todos los tags (solo admin)
const getAllTags = async () => {
  try {
    const tags = await Tag.find({ active: true });
    return tags;
  } catch (error) {
    console.error('Error in getAllTags:', error);
    throw error;
  }
};

// Obtener todos los departamentos (solo admin)
const getAllDepartments = async () => {
  try {
    // Por ahora usar el servicio simulado
    const UserService = require('./agenda.userService');
    return UserService.getDepartments();
  } catch (error) {
    console.error('Error in getAllDepartments:', error);
    throw error;
  }
};

// Obtener estadísticas de departamentos (solo admin)
const getDepartmentStats = async () => {
  try {
    const UserService = require('./agenda.userService');
    const departments = UserService.getDepartments();
    
    const stats = departments.map(dept => {
      return UserService.getDepartmentStats(dept._id);
    });
    
    return stats;
  } catch (error) {
    console.error('Error in getDepartmentStats:', error);
    throw error;
  }
};

// Crear departamento (solo admin)
const createDepartment = async (departmentData, createdBy) => {
  try {
    // Por ahora simular la creación
    const newDepartment = {
      _id: `dept_${Date.now()}`,
      ...departmentData,
      created_by: createdBy,
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('Departamento creado:', newDepartment);
    return newDepartment;
  } catch (error) {
    console.error('Error in createDepartment:', error);
    throw error;
  }
};

// Actualizar departamento (solo admin)
const updateDepartment = async (departmentId, updateData) => {
  try {
    // Por ahora simular la actualización
    const updatedDepartment = {
      _id: departmentId,
      ...updateData,
      updated_at: new Date()
    };
    
    console.log('Departamento actualizado:', updatedDepartment);
    return updatedDepartment;
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    throw error;
  }
};

// Eliminar departamento (solo admin)
const deleteDepartment = async (departmentId) => {
  try {
    // Por ahora simular la eliminación
    console.log('Departamento eliminado:', departmentId);
    return true;
  } catch (error) {
    console.error('Error in deleteDepartment:', error);
    throw error;
  }
};

// Obtener todo el historial (solo admin)
const getAllHistory = async () => {
  try {
    console.log('🔍 getAllHistory - Obteniendo logs...');
    const logs = await TaskLog.find({})
      .populate('user', 'nombre email', 'agenda.User')
      .populate({
        path: 'task_assignment',
        populate: [
          {
            path: 'task_definition',
            select: 'title'
          },
          {
            path: 'user',
            select: 'nombre email',
            model: 'agenda.User'
          }
        ]
      })
      .sort({ log_date: -1 })
      .limit(100); // Limitar a 100 registros más recientes
    
    console.log(`📊 getAllHistory - Encontrados ${logs.length} logs`);
    
    const history = logs.map((log, index) => {
      console.log(`🔍 Log ${index + 1}:`, {
        id: log._id,
        user: log.user,
        user_nombre: log.user?.nombre,
        task_assignment: log.task_assignment,
        task_title: log.task_assignment?.task_definition?.title
      });
      
      // Usar el usuario del log o del task_assignment como fallback
      let userName = 'Usuario eliminado';
      let userId = null;
      
      if (log.user && log.user.nombre) {
        // Usar el usuario poblado del log
        userName = log.user.nombre;
        userId = log.user._id;
      } else if (log.task_assignment && log.task_assignment.user && log.task_assignment.user.nombre) {
        // Usar el usuario poblado del task_assignment como fallback
        userName = log.task_assignment.user.nombre;
        userId = log.task_assignment.user._id;
      }
      
      return {
        _id: log._id,
        id: log._id,
        task_title: log.task_assignment?.task_definition?.title || 'Tarea eliminada',
        task_definition: log.task_assignment?.task_definition?._id || null,
        user_name: userName,
        user_id: userId,
        action_type: log.action_type,
        value: log.value,
        comment: log.comment,
        created_at: log.log_date,
        evidence: log.evidence || []
      };
    });
    
    console.log('📊 getAllHistory - Historial mapeado:', history.slice(0, 3));
    return history;
  } catch (error) {
    console.error('Error in getAllHistory:', error);
    throw error;
  }
};

// Obtener todas las tareas para configuración
const getAllTasks = async () => {
  try {
    console.log('📋 getAllTasks - Obteniendo todas las tareas');
    
    const allTasks = await TaskDefinition.find({ active: true })
      .populate('tags', 'name display_name color category')
      .sort({ created_at: -1 });
    
    return allTasks;
  } catch (error) {
    console.error('Error en getAllTasks:', error);
    throw error;
  }
};

// Crear nueva etiqueta
const createTag = async (tagData) => {
  try {
    console.log('➕ createTag - Datos:', tagData);
    
    const Tag = require('../../models/agenda.Tag');
    
    const newTag = new Tag({
      name: tagData.name,
      display_name: tagData.display_name,
      color: tagData.color,
      category: tagData.category,
      description: tagData.description,
      created_by: tagData.created_by
    });
    
    await newTag.save();
    
    console.log('✅ Etiqueta creada:', newTag);
    return newTag;
  } catch (error) {
    console.error('Error en createTag:', error);
    throw error;
  }
};

// Crear nueva tarea
const createTask = async (taskData) => {
  try {
    console.log('➕ createTask - Datos:', JSON.stringify(taskData, null, 2));
    
    const newTask = new TaskDefinition({
      title: taskData.title,
      description: taskData.description,
      mode: taskData.mode,
      periodicity: taskData.periodicity,
      target_per_period: taskData.target_per_period,
      sla_time: taskData.sla_time,
      requires_evidence: taskData.requires_evidence,
      tags: taskData.tags,
      assigned_users: taskData.assigned_users,
      specific_days: taskData.specific_days,
      department: taskData.department,
      created_by: taskData.created_by,
      active: true
    });
    
    await newTask.save();
    
    console.log('✅ Tarea creada:', newTask._id);
    return newTask;
  } catch (error) {
    console.error('Error en createTask:', error);
    throw error;
  }
};

// Actualizar tarea
const updateTask = async (taskId, taskData) => {
  try {
    console.log('✏️ updateTask - ID:', taskId, 'Datos:', JSON.stringify(taskData, null, 2));
    
    const updatedTask = await TaskDefinition.findByIdAndUpdate(taskId, {
      title: taskData.title,
      description: taskData.description,
      mode: taskData.mode,
      periodicity: taskData.periodicity,
      target_per_period: taskData.target_per_period,
      sla_time: taskData.sla_time,
      requires_evidence: taskData.requires_evidence,
      tags: taskData.tags,
      assigned_users: taskData.assigned_users,
      specific_days: taskData.specific_days,
      department: taskData.department,
      updated_at: new Date()
    }, { new: true })
      .populate('tags', 'name display_name color category');
    
    if (!updatedTask) {
      throw new Error('Tarea no encontrada');
    }
    
    console.log('✅ Tarea actualizada:', updatedTask._id);
    return updatedTask;
  } catch (error) {
    console.error('Error en updateTask:', error);
    throw error;
  }
};

// Eliminar tarea (soft delete)
const deleteTask = async (taskId) => {
  try {
    console.log('🗑️ deleteTask - ID:', taskId);
    
    const deletedTask = await TaskDefinition.findByIdAndUpdate(taskId, { 
      active: false,
      deleted_at: new Date()
    }, { new: true });
    
    if (!deletedTask) {
      throw new Error('Tarea no encontrada');
    }
    
    console.log('✅ Tarea eliminada (soft delete):', deletedTask.title);
    return { success: true, message: 'Tarea eliminada correctamente' };
  } catch (error) {
    console.error('Error en deleteTask:', error);
    throw error;
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
  getAllUserTasks,
  getAllUsers,
  getAllTags,
  getAllDepartments,
  getDepartmentStats,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllHistory,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  createTag
};