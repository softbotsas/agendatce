// models/nomina/Feriado.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feriadoSchema = new Schema({
  sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  fecha: { type: Date, required: true }, // día completo
  descripcion: { type: String },
}, { timestamps: true });

feriadoSchema.index({ sector: 1, fecha: 1 }, { unique: true });

module.exports = mongoose.model('Feriado', feriadoSchema);
