const TaskServiceSimple = require('../../services/agenda/agenda.taskServiceSimple');

// Controlador SIMPLE para completar tareas
const completeTask = async (req, res) => {
  try {
    const assignment_id = req.body.assignment_id;
    const comment = req.body.comment;
    const userId = req.session.userId;
    const evidenceFile = req.file ? req.file.filename : null;

    console.log('🔍 completeTask controller:', { assignment_id, userId, comment, evidenceFile });

    if (!assignment_id) {
      return res.status(400).json({ success: false, message: 'assignment_id es requerido' });
    }

    const result = await TaskServiceSimple.completeTaskSimple(assignment_id, userId, comment, evidenceFile, req);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error en completeTask controller:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Controlador SIMPLE para registrar acciones
const registerAction = async (req, res) => {
  try {
    const assignment_id = req.body.assignment_id;
    const value = req.body.value;
    const comment = req.body.comment;
    const userId = req.session.userId;
    const evidenceFile = req.file ? req.file.filename : null;

    console.log('🔍 registerAction controller:', { assignment_id, userId, value, comment, evidenceFile });

    if (!assignment_id) {
      return res.status(400).json({ success: false, message: 'assignment_id es requerido' });
    }

    if (!value) {
      return res.status(400).json({ success: false, message: 'value es requerido' });
    }

    const result = await TaskServiceSimple.registerActionSimple(assignment_id, userId, value, comment, evidenceFile, req);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error en registerAction controller:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Controlador SIMPLE para marcar como no aplicable
const markNotApplicable = async (req, res) => {
  try {
    console.log('🔍 markNotApplicable controller - req.body:', req.body);
    console.log('🔍 markNotApplicable controller - req.headers:', req.headers['content-type']);

    const { assignment_id, reason, overdue_days } = req.body;
    const userId = req.session.userId;

    console.log('🔍 markNotApplicable controller:', { assignment_id, userId, reason, overdue_days });

    if (!assignment_id) {
      return res.status(400).json({ success: false, message: 'assignment_id es requerido' });
    }

    const result = await TaskServiceSimple.markNotApplicableSimple(assignment_id, userId, reason);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error en markNotApplicable controller:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Controlador SIMPLE para completar todas las tareas atrasadas
const completeAllOverdue = async (req, res) => {
  try {
    console.log('🔍 completeAllOverdue controller - req.body:', req.body);

    const { assignment_id, comment, overdue_days } = req.body;
    const userId = req.session.userId;

    console.log('🔍 completeAllOverdue controller:', { assignment_id, userId, comment, overdue_days });

    if (!assignment_id) {
      return res.status(400).json({ success: false, message: 'assignment_id es requerido' });
    }

    const result = await TaskServiceSimple.completeAllOverdueSimple(assignment_id, userId, comment);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error en completeAllOverdue controller:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Controlador SIMPLE para saltar todas las tareas atrasadas (marcar como no aplicable)
const skipAllOverdue = async (req, res) => {
  try {
    console.log('🔍 skipAllOverdue controller - req.body:', req.body);

    const { assignment_id, reason } = req.body;
    const userId = req.session.userId;

    console.log('🔍 skipAllOverdue controller:', { assignment_id, userId, reason });

    if (!assignment_id) {
      return res.status(400).json({ success: false, message: 'assignment_id es requerido' });
    }

    if (!reason) {
      return res.status(400).json({ success: false, message: 'reason es requerido' });
    }

    const result = await TaskServiceSimple.skipAllOverdueSimple(assignment_id, userId, reason);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error en skipAllOverdue controller:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = {
  completeTask,
  registerAction,
  markNotApplicable,
  completeAllOverdue,
  skipAllOverdue
};
