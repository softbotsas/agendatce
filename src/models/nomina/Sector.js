// models/nomina/Sector.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reglaHorasSchema = new Schema({
  // multiplicadores (ej. 1.25 = 25% extra)
  extra_diurna: { type: Number, default: 1.25 },
  extra_nocturna: { type: Number, default: 1.35 },
  extra_festiva: { type: Number, default: 1.50 },
  nocturnidad_inicio: { type: String, default: "21:00" }, // HH:mm
  nocturnidad_fin: { type: String, default: "06:00" },
  horas_jornada_diaria: { type: Number, default: 8 },
  horas_jornada_semanal: { type: Number, default: 48 },
});

const reglasPenalizacionesSchema = new Schema({
  tolerancia_minutos: { type: Number, default: 5 }, // sin descuento
  tardanza_descuento_por_minuto: { type: Number, default: 0 }, // ej: % del valor-minuto
  falta_injustificada_descuento_dias: { type: Number, default: 1 },
});

const sectorSchema = new Schema({
  nombre_comercial: { type: String, required: true },
  razon_social: { type: String, required: true },
  pais_iso2: { type: String, required: true }, // "CO", "VE", "US", etc.
  moneda_iso3: { type: String, required: true }, // "COP", "VES", "USD"
  timezone: { type: String, required: true },    // "America/Bogota"
  reglas_horas: { type: reglaHorasSchema, default: () => ({}) },
  reglas_penalizaciones: { type: reglasPenalizacionesSchema, default: () => ({}) },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

sectorSchema.index({ pais_iso2: 1, moneda_iso3: 1 });

module.exports = mongoose.model('Sector', sectorSchema);
