// models/nomina/ReciboPago.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lineaSchema = new Schema({
  codigo: String,                 // p.ej. "SAL_BASE", "EXT_DIUR", "PEN_TAR"
  descripcion: String,
  tipo: { type: String, enum: ['ASIGNACION','DEDUCCION'], required: true },
  cantidad: { type: Number, default: 1 },
  monto_unit: { type: Number, default: 0 },
  total: { type: Number, default: 0 }, // cantidad * unit
});

const reciboSchema = new Schema({
  periodo: { type: Schema.Types.ObjectId, ref: 'NominaPeriodo', required: true },
  empleado: { type: Schema.Types.ObjectId, ref: 'Empleado', required: true },
  moneda_iso3: { type: String, required: true },
  lineas: [lineaSchema],
  total_asignaciones: { type: Number, default: 0 },
  total_deducciones: { type: Number, default: 0 },
  neto_pagar: { type: Number, default: 0 },
  calculado_en: { type: Date, default: Date.now },
}, { timestamps: true });

reciboSchema.index({ periodo: 1, empleado: 1 }, { unique: true });

module.exports = mongoose.model('ReciboPago', reciboSchema);
