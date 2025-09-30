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

// Todas las 41 tareas del CSV
const allTasksFromCSV = [
  { title: "Reportarse en grupos de interacción", periodicity: "daily", mode: "counter", target_per_period: 3, sla_time: "09:00", requires_evidence: false, tags: ["comunicacion"] },
  { title: "Revisar que todos los choferes estén en ruta", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "09:00", requires_evidence: false, tags: ["rutas"] },
  { title: "Corroborar y contactar chofer que no haya iniciado", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "09:30", requires_evidence: false, tags: ["rutas"] },
  { title: "Ponerse al día en grupos y pendientes", periodicity: "daily", mode: "counter", target_per_period: 2, sla_time: "12:00", requires_evidence: false, tags: ["comunicacion"] },
  { title: "Reportar a Aura/Mary quiénes están laborando (drivers)", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "09:30", requires_evidence: false, tags: ["finanzas", "rutas"] },
  { title: "Revisar órdenes no realizadas y causas", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "12:00", requires_evidence: false, tags: ["rutas"] },
  { title: "Verificar PRETRIP de drivers", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "09:00", requires_evidence: false, tags: ["rutas", "seguridad"] },
  { title: "Verificar POSTTRIP de drivers", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "18:00", requires_evidence: false, tags: ["rutas", "seguridad"] },
  { title: "Mecánica básica fuera de CLT (detalle mínimo)", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["mecanica"] },
  { title: "Participar en reunión USA", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["reuniones"] },
  { title: "Participar en reunión de líderes GTM", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["reuniones"] },
  { title: "Apoyo a Call Center (resolver dudas)", periodicity: "daily", mode: "counter", target_per_period: 2, sla_time: "17:00", requires_evidence: false, tags: ["callcenter"] },
  { title: "Emitir comunicados importantes", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["comunicacion"] },
  { title: "Grabar video de app o función nueva", periodicity: "monthly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: true, tags: ["formacion"] },
  { title: "Publicaciones para prospectos de driver", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: true, tags: ["reclutamiento"] },
  { title: "Revisar reportes del día anterior (drivers)", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "10:00", requires_evidence: false, tags: ["rutas"] },
  { title: "Boleta de depósito del día anterior cargada", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "10:00", requires_evidence: true, tags: ["finanzas"] },
  { title: "Talacheros: verificar publicidad Lun/Jue", periodicity: "monThu", mode: "binary", target_per_period: 1, sla_time: "18:00", requires_evidence: true, tags: ["talacheros", "marketing"] },
  { title: "Talacheros: revisar Facebook y evidencias", periodicity: "monThu", mode: "binary", target_per_period: 1, sla_time: "18:00", requires_evidence: true, tags: ["talacheros", "marketing"] },
  { title: "Solicitar pagos a Paola (talacheros)", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["talacheros", "finanzas"] },
  { title: "Organización de eventos (si aplica)", periodicity: "monthly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: true, tags: ["eventos"] },
  { title: "Organizar rutas y coberturas (ausencias, rutas pesadas)", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["rutas"] },
  { title: "Notificar a dispatcher cambios de ruta", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["rutas", "dispatcher"] },
  { title: "Chicas USA: verificar hora de ingreso", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "09:10", requires_evidence: false, tags: ["usa", "rrhh"] },
  { title: "Chicas USA: revisar cámaras", periodicity: "daily", mode: "counter", target_per_period: 2, sla_time: "17:00", requires_evidence: false, tags: ["usa", "control"] },
  { title: "Chicas USA: revisar reportes de fin de día", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "18:00", requires_evidence: false, tags: ["usa", "reportes"] },
  { title: "Corrección de guías con errores y retroalimentación", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["usa", "formacion"] },
  { title: "Sesión AnyDesk de coaching (si es necesario)", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["usa", "formacion"] },
  { title: "Pagos de Colombia: llevar archivo y solicitar (día 15)", periodicity: "monthly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: true, tags: ["finanzas", "colombia"] },
  { title: "Enviar boletas de pagos de Colombia a Yorman y Alejandro", periodicity: "monthly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: true, tags: ["finanzas", "colombia"] },
  { title: "Atender ayudas de Centroamérica", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["centroamerica", "soporte"] },
  { title: "Gestionar cajas no identificadas en bodega", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["bodega"] },
  { title: "Apoyos al driver solicitados en grupos", periodicity: "daily", mode: "counter", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["rutas", "soporte"] },
  { title: "Autorización de permisos/vacaciones (drivers y chicas USA)", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["rrhh"] },
  { title: "Entrevistas de contratación de drivers", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["reclutamiento"] },
  { title: "Onboarding driver: cronograma + material + Harrison", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: true, tags: ["reclutamiento", "formacion"] },
  { title: "Entregar instrucciones de contacto en CLT y horarios", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["reclutamiento"] },
  { title: "Actualizar archivos maestros (licencias, domicilios, storages, accesos, directorio, feriados, mecánicos, gastos)", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "18:00", requires_evidence: false, tags: ["backoffice"] },
  { title: "Supervisión a líderes GTM (coaching)", periodicity: "weekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["liderazgo"] },
  { title: "Entrevista activa con chofer actual (quincenal)", periodicity: "biweekly", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["rrhh", "rutas"] },
  { title: "Monitoreo de carga (alta/baja) y organizar recolección", periodicity: "daily", mode: "binary", target_per_period: 1, sla_time: "", requires_evidence: false, tags: ["rutas", "bodega"] }
];

async function importAllTasks() {
  try {
    await mongoose.connect(uri, options);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await AgendaTaskDefinition.deleteMany({});
    await AgendaTaskAssignment.deleteMany({});
    console.log('🧹 Datos existentes eliminados');

    // Obtener usuarios
    const agendaUsers = await AgendaUser.find({ activo: true });
    const adminUser = agendaUsers[0];
    console.log(`👥 Usuarios encontrados: ${agendaUsers.length}`);

    // Agregar created_by a cada tarea
    const tasksWithCreator = allTasksFromCSV.map(task => ({
      ...task,
      created_by: adminUser._id
    }));

    // Crear definiciones de tareas
    const createdTasks = await AgendaTaskDefinition.insertMany(tasksWithCreator);
    console.log(`✅ ${createdTasks.length} tareas creadas`);

    // Crear asignaciones
    const assignments = [];
    
    for (const task of createdTasks) {
      // Determinar si es tarea específica o general
      const isSpecificTask = task.title.includes('Laisa') || task.title.includes('Alejandra');
      
      if (isSpecificTask) {
        // Tarea específica - asignar solo al usuario correspondiente
        let targetUser = null;
        
        if (task.title.includes('Laisa')) {
          targetUser = agendaUsers.find(u => u.nombre.includes('Laisa'));
        } else if (task.title.includes('Alejandra')) {
          targetUser = agendaUsers.find(u => u.nombre.includes('Alejandra'));
        }
        
        if (targetUser) {
          assignments.push({
            task_definition: task._id,
            user: targetUser._id,
            start_date: new Date(),
            end_date: null,
            activo: true,
            assignment_type: 'specific'
          });
        }
      } else {
        // Tarea general - asignar a todos los usuarios
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
    }

    // Insertar asignaciones
    const createdAssignments = await AgendaTaskAssignment.insertMany(assignments);
    console.log(`✅ ${createdAssignments.length} asignaciones creadas`);

    // Resumen por tipo
    const generalAssignments = createdAssignments.filter(a => a.assignment_type === 'general').length;
    const specificAssignments = createdAssignments.filter(a => a.assignment_type === 'specific').length;
    
    console.log(`📊 Resumen:`);
    console.log(`   - Tareas generales: ${generalAssignments}`);
    console.log(`   - Tareas específicas: ${specificAssignments}`);
    console.log(`   - Total tareas: ${createdTasks.length}`);

    console.log('🎉 Importación completa exitosa!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

importAllTasks();



