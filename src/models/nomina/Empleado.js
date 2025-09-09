// models/nomina/Empleado.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const empleadoSchema = new Schema({
  sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  cargo:  { type: Schema.Types.ObjectId, ref: 'Cargos', required: true }, // tu modelo existente
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  documento: { type: String, required: true },
  correo: { type: String },
  telefono: { type: String },
  fecha_ingreso: { type: Date, required: true },
  estado: { type: String, enum: ['ACTIVO','INACTIVO'], default: 'ACTIVO' },
}, { timestamps: true });

empleadoSchema.index({ sector: 1, documento: 1 }, { unique: true });

module.exports = mongoose.model('Empleado', empleadoSchema);
