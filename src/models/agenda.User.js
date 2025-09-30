const { Schema, model } = require('mongoose');

const AgendaUserSchema = new Schema({
  nombre: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  // Relación con el usuario principal del sistema
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Información específica para agenda
  color: { 
    type: String, 
    default: '#007bff' 
  },
  activo: { 
    type: Boolean, 
    default: true 
  },
  // Configuración de notificaciones
  notificaciones: {
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
    recordatorios_sla: { type: Boolean, default: true }
  },
  // Campos adicionales para el sistema de agenda
  perfil_usuario: {
    type: Number,
    enum: [1, 2, 3], // 1: Admin, 2: Supervisor, 3: Empleado
    default: 3
  },
  cargo: {
    type: String,
    default: 'Empleado'
  },
  departamento: {
    type: String,
    default: 'Sin departamento'
  },
  departamento_name: {
    type: String,
    default: 'Sin departamento'
  }
}, {
  timestamps: true
});

module.exports = model('agenda.User', AgendaUserSchema);



