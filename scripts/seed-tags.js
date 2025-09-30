const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const Tag = require('../src/models/agenda.Tag');
const AgendaUser = require('../src/models/agenda.User');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nominatce';

// Etiquetas predefinidas organizadas por categoría
const predefinedTags = [
  // Operaciones
  { name: 'rutas', display_name: 'Rutas', description: 'Tareas relacionadas con gestión de rutas y conductores', color: '#007bff', category: 'operaciones' },
  { name: 'comunicacion', display_name: 'Comunicación', description: 'Tareas de comunicación interna y externa', color: '#28a745', category: 'operaciones' },
  { name: 'callcenter', display_name: 'Call Center', description: 'Tareas de soporte al call center', color: '#17a2b8', category: 'operaciones' },
  { name: 'dispatcher', display_name: 'Dispatcher', description: 'Tareas de coordinación con dispatcher', color: '#6f42c1', category: 'operaciones' },
  { name: 'bodega', display_name: 'Bodega', description: 'Tareas de gestión de bodega e inventario', color: '#fd7e14', category: 'operaciones' },
  { name: 'seguridad', display_name: 'Seguridad', description: 'Tareas de seguridad y protocolos', color: '#dc3545', category: 'operaciones' },
  { name: 'control', display_name: 'Control', description: 'Tareas de control y supervisión', color: '#ffc107', category: 'operaciones' },
  { name: 'soporte', display_name: 'Soporte', description: 'Tareas de soporte técnico y operativo', color: '#20c997', category: 'operaciones' },
  
  // Administración
  { name: 'administracion', display_name: 'Administración', description: 'Tareas administrativas generales', color: '#6c757d', category: 'administracion' },
  { name: 'backoffice', display_name: 'Back Office', description: 'Tareas de oficina y gestión interna', color: '#495057', category: 'administracion' },
  { name: 'reportes', display_name: 'Reportes', description: 'Tareas de generación y revisión de reportes', color: '#343a40', category: 'administracion' },
  { name: 'supervision', display_name: 'Supervisión', description: 'Tareas de supervisión y monitoreo', color: '#e83e8c', category: 'administracion' },
  { name: 'calidad', display_name: 'Calidad', description: 'Tareas de control de calidad', color: '#6f42c1', category: 'administracion' },
  
  // RRHH
  { name: 'rrhh', display_name: 'Recursos Humanos', description: 'Tareas de gestión de personal', color: '#e83e8c', category: 'rrhh' },
  { name: 'reclutamiento', display_name: 'Reclutamiento', description: 'Tareas de reclutamiento y selección', color: '#fd7e14', category: 'rrhh' },
  { name: 'formacion', display_name: 'Formación', description: 'Tareas de capacitación y formación', color: '#20c997', category: 'rrhh' },
  { name: 'liderazgo', display_name: 'Liderazgo', description: 'Tareas de liderazgo y coaching', color: '#6f42c1', category: 'rrhh' },
  
  // Finanzas
  { name: 'finanzas', display_name: 'Finanzas', description: 'Tareas financieras y contables', color: '#28a745', category: 'finanzas' },
  { name: 'cobranza', display_name: 'Cobranza', description: 'Tareas de cobranza y facturación', color: '#dc3545', category: 'finanzas' },
  { name: 'facturacion', display_name: 'Facturación', description: 'Tareas de facturación y pagos', color: '#17a2b8', category: 'finanzas' },
  { name: 'contabilidad', display_name: 'Contabilidad', description: 'Tareas contables y registros', color: '#6c757d', category: 'finanzas' },
  
  // Logística
  { name: 'logistica', display_name: 'Logística', description: 'Tareas de logística y distribución', color: '#fd7e14', category: 'logistica' },
  { name: 'inventario', display_name: 'Inventario', description: 'Tareas de gestión de inventario', color: '#20c997', category: 'logistica' },
  { name: 'mantenimiento', display_name: 'Mantenimiento', description: 'Tareas de mantenimiento y reparación', color: '#ffc107', category: 'logistica' },
  { name: 'mecanica', display_name: 'Mecánica', description: 'Tareas de mecánica y reparación de vehículos', color: '#6c757d', category: 'logistica' },
  
  // Tecnología
  { name: 'tecnologia', display_name: 'Tecnología', description: 'Tareas relacionadas con tecnología', color: '#17a2b8', category: 'tecnologia' },
  { name: 'sistemas', display_name: 'Sistemas', description: 'Tareas de sistemas y TI', color: '#6f42c1', category: 'tecnologia' },
  
  // Específicos del negocio
  { name: 'talacheros', display_name: 'Talacheros', description: 'Tareas específicas de talacheros', color: '#fd7e14', category: 'operaciones' },
  { name: 'usa', display_name: 'USA', description: 'Tareas específicas de operaciones USA', color: '#007bff', category: 'operaciones' },
  { name: 'centroamerica', display_name: 'Centroamérica', description: 'Tareas específicas de Centroamérica', color: '#28a745', category: 'operaciones' },
  { name: 'colombia', display_name: 'Colombia', description: 'Tareas específicas de Colombia', color: '#ffc107', category: 'operaciones' },
  { name: 'reuniones', display_name: 'Reuniones', description: 'Tareas relacionadas con reuniones', color: '#6c757d', category: 'administracion' },
  { name: 'eventos', display_name: 'Eventos', description: 'Tareas de organización de eventos', color: '#e83e8c', category: 'administracion' },
  { name: 'marketing', display_name: 'Marketing', description: 'Tareas de marketing y publicidad', color: '#fd7e14', category: 'administracion' },
  { name: 'ventas', display_name: 'Ventas', description: 'Tareas de ventas y comercialización', color: '#28a745', category: 'administracion' },
  { name: 'legal', display_name: 'Legal', description: 'Tareas legales y de cumplimiento', color: '#6c757d', category: 'administracion' }
];

// Función principal
async function seedTags() {
  try {
    console.log('🏷️ Iniciando seed de etiquetas...');
    
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Obtener un usuario para asignar como creador
    const users = await AgendaUser.find({ activo: true }).limit(1);
    const creatorId = users.length > 0 ? users[0]._id : null;
    
    if (!creatorId) {
      console.log('❌ No se encontraron usuarios en la base de datos. Ejecuta primero el seed de usuarios.');
      return;
    }
    
    console.log(`👤 Usando usuario creador: ${users[0].nombre}`);
    
    // Limpiar etiquetas existentes
    console.log('🧹 Limpiando etiquetas existentes...');
    await Tag.deleteMany({});
    console.log('✅ Etiquetas limpiadas');
    
    // Crear etiquetas predefinidas
    console.log('🏷️ Creando etiquetas predefinidas...');
    const tagsWithCreator = predefinedTags.map(tag => ({
      ...tag,
      created_by: creatorId
    }));
    
    const createdTags = await Tag.insertMany(tagsWithCreator);
    console.log(`✅ ${createdTags.length} etiquetas creadas`);
    
    // Mostrar resumen por categoría
    console.log('\n📊 Resumen por categoría:');
    const categories = {};
    createdTags.forEach(tag => {
      if (!categories[tag.category]) {
        categories[tag.category] = [];
      }
      categories[tag.category].push(tag.display_name);
    });
    
    Object.keys(categories).forEach(category => {
      console.log(`   ${category.toUpperCase()}: ${categories[category].length} etiquetas`);
      categories[category].forEach(tag => {
        console.log(`     - ${tag}`);
      });
    });
    
    console.log('\n🎉 Seed de etiquetas completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante el seed de etiquetas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedTags();
}

module.exports = { seedTags };

