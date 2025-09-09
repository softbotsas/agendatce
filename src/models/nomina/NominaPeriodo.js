// models/nomina/NominaPeriodo.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const periodoSchema = new Schema({
  sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  tipo: { type: String, enum: ['MENSUAL','QUINCENAL','SEMANAL'], required: true },
  inicio: { type: Date, required: true },
  fin: { type: Date, required: true }, // inclusive
  estado: { type: String, enum: ['ABIERTO','CALCULADO','CERRADO'], default: 'ABIERTO' },
}, { timestamps: true });

periodoSchema.index({ sector: 1, inicio: 1, fin: 1 }, { unique: true });

module.exports = mongoose.model('NominaPeriodo', periodoSchema);
