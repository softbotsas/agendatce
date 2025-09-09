// models/nomina/Contrato.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contratoSchema = new Schema({
  empleado: { type: Schema.Types.ObjectId, ref: 'Empleado', required: true },
  tipo: { type: String, enum: ['FIJO','INDEFINIDO','POR_HORAS'], required: true },
  salario_base_mensual: { type: Number, default: 0 }, // en moneda del sector
  salario_por_hora: { type: Number, default: 0 },     // si POR_HORAS
  periodicidad: { type: String, enum: ['MENSUAL','QUINCENAL','SEMANAL'], default: 'MENSUAL' },
  inicio: { type: Date, required: true },
  fin: { type: Date }, // opcional
  activo: { type: Boolean, default: true },
}, { timestamps: true });

contratoSchema.index({ empleado: 1, activo: 1 });

module.exports = mongoose.model('Contrato', contratoSchema);
