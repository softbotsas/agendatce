// models/nomina/Marcaje.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const marcajeSchema = new Schema({
  empleado: { type: Schema.Types.ObjectId, ref: 'Empleado', required: true },
  ts: { type: Date, required: true }, // siempre UTC
  fuente: { type: String, enum: ['BIOMETRICO','APP','MANUAL'], default: 'APP' },
  tipo: { type: String, enum: ['IN','OUT'], required: true },
}, { timestamps: true });

marcajeSchema.index({ empleado: 1, ts: 1 });

module.exports = mongoose.model('Marcaje', marcajeSchema);
