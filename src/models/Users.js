const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  correo: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true, minlength: 6 },
  celular: { type: String, required: true, trim: true },
  telefono: { type: String, trim: true },
  direccion: { type: String, trim: true },
  pais: { type: String, required: true, trim: true },
  estado: { type: String, required: true, trim: true },
  ciudad: { type: String, required: true, trim: true },
  perfil_usuario: { 
    type: Number, 
    required: true,
    enum: [1, 2, 3], // 1: Admin, 2: Supervisor, 3: Empleado
    default: 3
  },
  tipo_impre: { 
    type: Number, 
    required: true,
    enum: [1, 2], // 1: Persona Natural, 2: Persona Jurídica
    default: 1
  },
  cargo: {
    type: Schema.Types.ObjectId,
    ref: 'Cargos'  // Consistente con Empleado.js
  },
  agencia: {
    type: Schema.Types.ObjectId,
    ref: 'Agencia'
  },
  // Relación con el sistema de agenda
  agenda_user: {
    type: Schema.Types.ObjectId,
    ref: 'agenda.User',
    default: null
  },
  // Información específica para agenda
  agenda_info: {
    nombre_agenda: { type: String, trim: true },
    color: { type: String, default: '#007bff' },
    activo_agenda: { type: Boolean, default: true }
  },
  activo: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Métodos para encriptar y verificar contraseñas
UserSchema.methods.encryptPassword = async function(password) {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

UserSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Middleware para encriptar contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await this.encryptPassword(this.password);
  next();
});

module.exports = model('User', UserSchema);