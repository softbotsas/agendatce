// models/nomina/Empleado.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const empleadoSchema = new Schema({
  sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  cargo:  { type: Schema.Types.ObjectId, ref: 'Cargos', required: true }, // OJO: ref = 'Cargos'
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  documento: { type: String, required: true },
  correo: { type: String },
  telefono: { type: String },
  fecha_ingreso: { type: Date, required: true },
  estado: { type: String, enum: ['ACTIVO','INACTIVO'], default: 'ACTIVO' },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, { timestamps: true });

empleadoSchema.index({ sector: 1, documento: 1 }, { unique: true });

// Unicidad de usuario solo cuando existe (1 a 1):
empleadoSchema.index(
  { usuario: 1 },
  { unique: true, partialFilterExpression: { usuario: { $type: 'objectId' } } }
);

module.exports = mongoose.model('Empleado', empleadoSchema);
