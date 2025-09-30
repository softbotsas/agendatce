const mongoose = require('mongoose');
const AgendaTaskDefinition = require('../src/models/agenda.TaskDefinition');
const AgendaTaskAssignment = require('../src/models/agenda.TaskAssignment');
const AgendaUser = require('../src/models/agenda.User');

// Conectar a MongoDB
const password = "r7ogqjJ7XyULgrZY";
const usuario = "bernstein";
const bd = "tucajaex";
const uri = `mongodb+srv://${usuario}:${password}@cluster0.ui39vqd.mongodb.net/${bd}?retryWrites=true&w=majority&appName=Cluster0`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Tareas del CSV (primeras 10 para probar)
const tasksFromCSV = [
  { title: "Reportarse en grupos de interacción", periodicity: "daily", mode: "counter", target_per_period: 3, sla_time: "09:00", requires_evidence: false, tags: ["comunicacion"] },
  { title: "Revisar que todos los choferes estén en ruta", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "09:00", requires_evidence: false, tags: ["rutas"] },
  { title: "Corroborar y contactar chofer que no haya iniciado", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "09:30", requires_evidence: false, tags: ["rutas"] },
  { title: "Ponerse al día en grupos y pendientes", periodicity: "daily", mode: "counter", target_per_period: 2, sla_time: "12:00", requires_evidence: false, tags: ["comunicacion"] },
  { title: "Reportar a Aura/Mary quiénes están laborando (drivers)", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "09:30", requires_evidence: false, tags: ["finanzas", "rutas"] },
  { title: "Revisar órdenes no realizadas y causas", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "12:00", requires_evidence: false, tags: ["rutas"] },
  { title: "Verificar PRETRIP de drivers", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "09:00", requires_evidence: false, tags: ["rutas", "seguridad"] },
  { title: "Verificar POSTTRIP de drivers", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "18:00", requires_evidence: false, tags: ["rutas", "seguridad"] },
  { title: "Mecánica básica fuera de CLT (detalle mínimo)", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["mecanica"] },
  { title: "Participar en reunión USA", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["reuniones"] }
];

async function importTasks() {
  try {
    await mongoose.connect(uri, options);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await AgendaTaskDefinition.deleteMany({});
    await AgendaTaskAssignment.deleteMany({});
    console.log('🧹 Datos existentes eliminados');

    // Obtener un usuario para usar como created_by
    const agendaUsers = await AgendaUser.find({ activo: true });
    const adminUser = agendaUsers[0]; // Usar el primer usuario como creador
    
    // Agregar created_by a cada tarea
    const tasksWithCreator = tasksFromCSV.map(task => ({
      ...task,
      created_by: adminUser._id
    }));

    // Crear definiciones de tareas
    const createdTasks = await AgendaTaskDefinition.insertMany(tasksWithCreator);
    console.log(`✅ ${createdTasks.length} tareas creadas`);

    console.log(`👥 Usuarios encontrados: ${agendaUsers.length}`);

    // Crear asignaciones generales (todas las tareas para todos los usuarios)
    const assignments = [];
    for (const task of createdTasks) {
      for (const user of agendaUsers) {
        assignments.push({
          task_definition: task._id,
          user: user._id,
          start_date: new Date(),
          end_date: null,
          activo: true,
          assignment_type: 'general'
        });
      }
    }

    const createdAssignments = await AgendaTaskAssignment.insertMany(assignments);
    console.log(`✅ ${createdAssignments.length} asignaciones creadas`);

    console.log('🎉 Importación completada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

importTasks();
