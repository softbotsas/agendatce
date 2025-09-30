const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importar modelos
const AgendaUser = require('../src/models/agenda.User');
const TaskDefinition = require('../src/models/agenda.TaskDefinition');
const TaskAssignment = require('../src/models/agenda.TaskAssignment');
const TaskLog = require('../src/models/agenda.TaskLog');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nominatce';

// Datos de usuarios falsos para el sistema de agenda
const fakeUsers = [
  {
    nombre: 'Alejandro Martínez',
    email: 'alejandro.martinez@tce.com',
    color: '#007bff',
    notificaciones: {
      email: true,
      whatsapp: false,
      recordatorios_sla: true
    }
  },
  {
    nombre: 'María González',
    email: 'maria.gonzalez@tce.com',
    color: '#28a745',
    notificaciones: {
      email: true,
      whatsapp: true,
      recordatorios_sla: true
    }
  },
  {
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@tce.com',
    color: '#dc3545',
    notificaciones: {
      email: true,
      whatsapp: false,
      recordatorios_sla: true
    }
  },
  {
    nombre: 'Ana López',
    email: 'ana.lopez@tce.com',
    color: '#ffc107',
    notificaciones: {
      email: true,
      whatsapp: true,
      recordatorios_sla: false
    }
  },
  {
    nombre: 'Roberto Silva',
    email: 'roberto.silva@tce.com',
    color: '#6f42c1',
    notificaciones: {
      email: true,
      whatsapp: false,
      recordatorios_sla: true
    }
  },
  {
    nombre: 'Laura Fernández',
    email: 'laura.fernandez@tce.com',
    color: '#fd7e14',
    notificaciones: {
      email: true,
      whatsapp: true,
      recordatorios_sla: true
    }
  }
];

// Función para parsear el CSV de tareas
function parseTasksCSV() {
  const csvPath = path.join(__dirname, '..', 'Seed_de_tareas_para_importar.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n');
  
  const tasks = [];
  const headers = lines[0].split(',');
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',');
      const task = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Limpiar comillas y espacios
        value = value.replace(/^["']|["']$/g, '').trim();
        
        switch (header.trim()) {
          case 'title':
            task.title = value;
            break;
          case 'periodicity':
            // Validar periodicidad válida
            const validPeriodicities = ['daily', 'weekly', 'monthly', 'monThu', 'biweekly'];
            task.periodicity = validPeriodicities.includes(value) ? value : 'daily';
            break;
          case 'mode':
            // Validar modo válido
            const validModes = ['binary', 'counter'];
            task.mode = validModes.includes(value) ? value : 'binary';
            break;
          case 'target_per_period':
            if (value && value.trim() !== '') {
              const parsed = parseFloat(value);
              task.target_per_period = isNaN(parsed) ? 1 : parsed;
            } else {
              task.target_per_period = 1;
            }
            break;
          case 'sla_time':
            task.sla_time = value || null;
            break;
          case 'requires_evidence':
            task.requires_evidence = value.toLowerCase() === 'true';
            break;
          case 'tags':
            // Parsear tags del formato ['tag1', 'tag2']
            if (value) {
              const tagsMatch = value.match(/\[(.*?)\]/);
              if (tagsMatch) {
                task.tags = tagsMatch[1]
                  .split(',')
                  .map(tag => tag.replace(/['"]/g, '').trim())
                  .filter(tag => tag);
              } else {
                task.tags = [value];
              }
            } else {
              task.tags = [];
            }
            break;
        }
      });
      
      // Agregar campos requeridos
      task.description = task.title; // Usar el título como descripción por ahora
      task.active = true;
      task.created_by = null; // Se asignará después
      
      tasks.push(task);
    }
  }
  
  return tasks;
}

// Función para crear logs de ejemplo
function createSampleLogs(assignments, users) {
  const logs = [];
  const today = new Date();
  
  // Crear logs para los últimos 7 días
  for (let i = 0; i < 7; i++) {
    const logDate = new Date(today);
    logDate.setDate(today.getDate() - i);
    
    // Para cada asignación, crear algunos logs aleatorios
    assignments.forEach(assignment => {
      const user = users.find(u => u._id.toString() === assignment.user.toString());
      if (!user) return;
      
      // 70% de probabilidad de completar la tarea
      if (Math.random() < 0.7) {
        const log = new TaskLog({
          task_assignment: assignment._id,
          user: assignment.user,
          log_date: logDate,
          action_type: 'completed',
          value: 1,
          comment: `Tarea completada por ${user.nombre}`,
          is_late: Math.random() < 0.2, // 20% de probabilidad de estar atrasado
          sla_breach_minutes: Math.random() < 0.2 ? Math.floor(Math.random() * 60) : 0
        });
        
        logs.push(log);
      }
    });
  }
  
  return logs;
}

// Función principal
async function seedAgendaData() {
  try {
    console.log('🚀 Iniciando seed de datos de agenda...');
    
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await TaskLog.deleteMany({});
    await TaskAssignment.deleteMany({});
    await TaskDefinition.deleteMany({});
    await AgendaUser.deleteMany({});
    console.log('✅ Datos limpiados');
    
    // Crear usuarios
    console.log('👥 Creando usuarios...');
    const createdUsers = await AgendaUser.insertMany(fakeUsers);
    console.log(`✅ ${createdUsers.length} usuarios creados`);
    
    // Parsear y crear tareas
    console.log('📋 Importando tareas desde CSV...');
    const tasksData = parseTasksCSV();
    console.log(`📊 ${tasksData.length} tareas encontradas en CSV`);
    
    // Mostrar algunas tareas para debug
    console.log('🔍 Primeras 3 tareas parseadas:');
    tasksData.slice(0, 3).forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.title} (${task.periodicity}, ${task.mode}, target: ${task.target_per_period})`);
    });
    
    // Asignar el primer usuario como creador de todas las tareas
    const creatorId = createdUsers[0]._id;
    const tasksWithCreator = tasksData.map(task => ({
      ...task,
      created_by: creatorId
    }));
    
    const createdTasks = await TaskDefinition.insertMany(tasksWithCreator);
    console.log(`✅ ${createdTasks.length} tareas creadas`);
    
    // Crear asignaciones aleatorias
    console.log('🔗 Creando asignaciones de tareas...');
    const assignments = [];
    
    // Asignar todas las tareas a algunos usuarios
    const mainUsers = createdUsers.slice(0, 3); // Primeros 3 usuarios
    const allUsers = createdUsers;
    
    for (const task of createdTasks) {
      // Asignar a usuarios principales (100% de probabilidad)
      for (const user of mainUsers) {
        const assignment = new TaskAssignment({
          task_definition: task._id,
          user: user._id,
          start_date: new Date(),
          activo: true,
          assignment_type: 'general'
        });
        assignments.push(assignment);
      }
      
      // Asignar aleatoriamente a otros usuarios (30% de probabilidad)
      for (const user of allUsers.slice(3)) {
        if (Math.random() < 0.3) {
          const assignment = new TaskAssignment({
            task_definition: task._id,
            user: user._id,
            start_date: new Date(),
            activo: true,
            assignment_type: 'general'
          });
          assignments.push(assignment);
        }
      }
    }
    
    const createdAssignments = await TaskAssignment.insertMany(assignments);
    console.log(`✅ ${createdAssignments.length} asignaciones creadas`);
    
    // Crear logs de ejemplo
    console.log('📝 Creando logs de ejemplo...');
    const sampleLogs = createSampleLogs(createdAssignments, createdUsers);
    const createdLogs = await TaskLog.insertMany(sampleLogs);
    console.log(`✅ ${createdLogs.length} logs creados`);
    
    // Resumen final
    console.log('\n🎉 Seed completado exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   👥 Usuarios: ${createdUsers.length}`);
    console.log(`   📋 Tareas: ${createdTasks.length}`);
    console.log(`   🔗 Asignaciones: ${createdAssignments.length}`);
    console.log(`   📝 Logs: ${createdLogs.length}`);
    
    // Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de tareas creadas:');
    createdTasks.slice(0, 5).forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.title} (${task.periodicity})`);
    });
    
    console.log('\n👥 Usuarios creados:');
    createdUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.nombre} (${user.email})`);
    });
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedAgendaData();
}

module.exports = { seedAgendaData };

