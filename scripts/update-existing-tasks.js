const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nominatce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const TaskDefinition = require('../src/models/agenda.TaskDefinition');

async function updateExistingTasks() {
  try {
    console.log('🔍 Actualizando tareas existentes con nuevos campos...');
    
    // Obtener todas las tareas que no tienen los nuevos campos
    const tasks = await TaskDefinition.find({
      $or: [
        { frequency: { $exists: false } },
        { specific_days: { $exists: false } },
        { assignment_type: { $exists: false } },
        { specific_user: { $exists: false } }
      ]
    });
    
    console.log(`📊 Tareas encontradas para actualizar: ${tasks.length}`);
    
    let updatedCount = 0;
    
    for (const task of tasks) {
      const updateData = {};
      
      // Agregar campos faltantes con valores por defecto
      if (!task.frequency) {
        updateData.frequency = 1;
      }
      
      if (!task.specific_days) {
        updateData.specific_days = [];
      }
      
      if (!task.assignment_type) {
        updateData.assignment_type = 'anyone';
      }
      
      if (!task.specific_user) {
        updateData.specific_user = null;
      }
      
      // Actualizar la tarea
      await TaskDefinition.findByIdAndUpdate(task._id, updateData);
      updatedCount++;
      
      console.log(`✅ Tarea actualizada: ${task.title}`);
    }
    
    console.log(`🎉 Proceso completado. ${updatedCount} tareas actualizadas.`);
    
  } catch (error) {
    console.error('❌ Error en el script updateExistingTasks:', error);
  } finally {
    mongoose.disconnect();
  }
}

updateExistingTasks();







