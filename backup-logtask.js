// FUNCIÓN DE RESPALDO - VERSIÓN SIMPLIFICADA PARA TAREAS ATRASADAS
const logTaskSimple = async (assignmentId, userId, actionType, options = {}) => {
  try {
    console.log('🔍 logTaskSimple iniciado con:', { assignmentId, userId, actionType, options });
    
    const { 
      value = 1, 
      comment = '', 
      evidence_file = null, 
      retroactive_date = null, 
      not_applicable_reason = null, 
      overdue_days = null 
    } = options;

    // Buscar la tarea por ID
    let taskDefinition;
    let assignment;
    
    // Si es tarea atrasada, extraer el ID real
    if (assignmentId.startsWith('overdue_')) {
      const parts = assignmentId.split('_');
      let taskDefinitionId;
      
      if (parts.length >= 4 && parts[0] === 'overdue' && parts[1] === 'overdue') {
        taskDefinitionId = parts[2];
      } else if (parts.length >= 3) {
        taskDefinitionId = parts[1];
      } else {
        return { success: false, message: 'ID de tarea atrasada inválido' };
      }
      
      taskDefinition = await TaskDefinition.findById(taskDefinitionId);
      if (!taskDefinition) {
        return { success: false, message: 'Tarea no encontrada' };
      }
      
      // Buscar o crear asignación
      assignment = await TaskAssignment.findOne({
        task_definition: taskDefinitionId,
        user: userId,
        activo: true
      });

      if (!assignment) {
        assignment = new TaskAssignment({
          task_definition: taskDefinitionId,
          user: userId,
          start_date: new Date(),
          activo: true,
          assignment_type: taskDefinition.assignment_type === 'anyone' ? 'general' : 'specific'
        });
        await assignment.save();
      }
    } else {
      // Lógica normal para tareas no atrasadas
      assignment = await TaskAssignment.findById(assignmentId);
      if (!assignment) {
        return { success: false, message: 'Asignación no encontrada' };
      }
      await assignment.populate('task_definition');
      taskDefinition = assignment.task_definition;
    }

    // Preparar datos del log
    let logDate = new Date();
    let finalComment = comment;
    let finalActionType = actionType;
    let finalValue = value;

    // Manejar casos especiales
    if (actionType === 'not_applicable') {
      finalActionType = 'completed';
      finalValue = 1;
      finalComment = comment || 'Marcada como no aplicable';
      
      if (overdue_days) {
        try {
          const overdueDays = JSON.parse(overdue_days);
          finalComment += ` (Fechas no aplicables: ${overdueDays.map(day => day.dateStr).join(', ')})`;
        } catch (e) {
          console.log('⚠️ Error parsing overdue_days:', e.message);
        }
      }
    }

    if (retroactive_date && actionType === 'completed') {
      logDate = new Date(retroactive_date);
      finalComment = comment || `Completado retroactivamente para fecha: ${retroactive_date}`;
    }

    // Crear el log
    const log = new TaskLog({
      task_assignment: assignment._id,
      user: userId,
      action_type: finalActionType,
      value: finalValue,
      comment: finalComment,
      evidence_files: evidence_file ? [evidence_file.filename] : [],
      log_date: logDate
    });

    await log.save();

    console.log('✅ Log creado exitosamente:', log._id);

    return {
      success: true,
      message: 'Tarea registrada exitosamente',
      logId: log._id
    };

  } catch (error) {
    console.error('❌ Error en logTaskSimple:', error);
    return {
      success: false,
      message: 'Error al registrar tarea: ' + error.message
    };
  }
};

module.exports = { logTaskSimple };



