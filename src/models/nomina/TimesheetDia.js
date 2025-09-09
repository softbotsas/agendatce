// models/nomina/TimesheetDia.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timesheetDiaSchema = new Schema({
  empleado: { type: Schema.Types.ObjectId, ref: 'Empleado', required: true },
  fecha_local: { type: String, required: true }, // "YYYY-MM-DD" en TZ del sector
  horas_normales: { type: Number, default: 0 },
  horas_extra_diurnas: { type: Number, default: 0 },
  horas_extra_nocturnas: { type: Number, default: 0 },
  horas_festivas: { type: Number, default: 0 },
  tardanza_min: { type: Number, default: 0 },
  falta_injustificada: { type: Boolean, default: false },
  notas: { type: String },
}, { timestamps: true });

timesheetDiaSchema.index({ empleado: 1, fecha_local: 1 }, { unique: true });

module.exports = mongoose.model('TimesheetDia', timesheetDiaSchema);
