const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const AgendaUser = require('../src/models/agenda.User');
const TaskDefinition = require('../src/models/agenda.TaskDefinition');
const TaskAssignment = require('../src/models/agenda.TaskAssignment');
const TaskLog = require('../src/models/agenda.TaskLog');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nominatce';

async function cleanAgendaData() {
  try {
    console.log('🧹 Limpiando datos de agenda...');
    
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Contar registros antes de limpiar
    const userCount = await AgendaUser.countDocuments();
    const taskCount = await TaskDefinition.countDocuments();
    const assignmentCount = await TaskAssignment.countDocuments();
    const logCount = await TaskLog.countDocuments();
    
    console.log('\n📊 Datos antes de limpiar:');
    console.log(`   👥 Usuarios: ${userCount}`);
    console.log(`   📋 Tareas: ${taskCount}`);
    console.log(`   🔗 Asignaciones: ${assignmentCount}`);
    console.log(`   📝 Logs: ${logCount}`);
    
    // Confirmar limpieza
    console.log('\n⚠️  ¿Estás seguro de que quieres eliminar todos los datos de agenda?');
    console.log('   Esto eliminará TODOS los usuarios, tareas, asignaciones y logs.');
    console.log('   Presiona Ctrl+C para cancelar o espera 5 segundos...');
    
    // Esperar 5 segundos
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Limpiar en orden (respetando foreign keys)
    console.log('\n🗑️  Eliminando logs...');
    const deletedLogs = await TaskLog.deleteMany({});
    console.log(`   ✅ ${deletedLogs.deletedCount} logs eliminados`);
    
    console.log('🗑️  Eliminando asignaciones...');
    const deletedAssignments = await TaskAssignment.deleteMany({});
    console.log(`   ✅ ${deletedAssignments.deletedCount} asignaciones eliminadas`);
    
    console.log('🗑️  Eliminando definiciones de tareas...');
    const deletedTasks = await TaskDefinition.deleteMany({});
    console.log(`   ✅ ${deletedTasks.deletedCount} tareas eliminadas`);
    
    console.log('🗑️  Eliminando usuarios...');
    const deletedUsers = await AgendaUser.deleteMany({});
    console.log(`   ✅ ${deletedUsers.deletedCount} usuarios eliminados`);
    
    // Verificar limpieza
    const finalUserCount = await AgendaUser.countDocuments();
    const finalTaskCount = await TaskDefinition.countDocuments();
    const finalAssignmentCount = await TaskAssignment.countDocuments();
    const finalLogCount = await TaskLog.countDocuments();
    
    console.log('\n📊 Datos después de limpiar:');
    console.log(`   👥 Usuarios: ${finalUserCount}`);
    console.log(`   📋 Tareas: ${finalTaskCount}`);
    console.log(`   🔗 Asignaciones: ${finalAssignmentCount}`);
    console.log(`   📝 Logs: ${finalLogCount}`);
    
    if (finalUserCount === 0 && finalTaskCount === 0 && finalAssignmentCount === 0 && finalLogCount === 0) {
      console.log('\n✅ Limpieza completada exitosamente');
    } else {
      console.log('\n⚠️  Algunos datos no se eliminaron completamente');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanAgendaData();
}

module.exports = { cleanAgendaData };

