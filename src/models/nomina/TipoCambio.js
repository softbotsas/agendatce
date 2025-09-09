// models/nomina/TipoCambio.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tipoCambioSchema = new Schema({
  base_iso3: { type: String, required: true },   // p.ej. "USD"
  quote_iso3: { type: String, required: true },  // p.ej. "COP"
  fecha: { type: Date, required: true },
  tasa: { type: Number, required: true },        // 1 base = tasa quote
}, { timestamps: true });

tipoCambioSchema.index({ base_iso3: 1, quote_iso3: 1, fecha: 1 }, { unique: true });

module.exports = mongoose.model('TipoCambio', tipoCambioSchema);
