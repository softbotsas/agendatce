// models/nomina/Horario.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const turnoDiaSchema = new Schema({
  dia_semana: { type: Number, required: true },   // 0=Domingo ... 6=Sábado
  inicio: { type: String, required: true },       // "08:00"
  fin: { type: String, required: true },          // "17:00"
  descanso_min: { type: Number, default: 60 },
});

const horarioSchema = new Schema({
  empleado: { type: Schema.Types.ObjectId, ref: 'Empleado', required: true },
  turnos: [turnoDiaSchema],
  aplica_desde: { type: Date, required: true },
}, { timestamps: true });

horarioSchema.index({ empleado: 1, aplica_desde: -1 });

module.exports = mongoose.model('Horario', horarioSchema);
