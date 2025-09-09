// controlls/nomina.controller.js
const Sector = require('../models/nomina/Sector');
const Empleado = require('../models/nomina/Empleado');
const Contrato = require('../models/nomina/Contrato');
const Horario = require('../models/nomina/Horario');
const Feriado = require('../models/nomina/Feriado');
const NominaPeriodo = require('../models/nomina/NominaPeriodo');
const ReciboPago = require('../models/nomina/ReciboPago');
const { construirTimesheetEmpleado, calcularRecibo } = require('../services/nomina/calculadoraNomina');

const nominaCtrl = {};

nominaCtrl.viewConfig = async (req,res)=>{
  const sectores = await Sector.find({ activo:true }).lean();
  res.render('nomina/config', { sectores });
};

nominaCtrl.crearSector = async (req,res)=>{
  const s = new Sector(req.body);
  await s.save();
  res.redirect('/nomina/config');
};

nominaCtrl.viewEmpleados = async (req,res)=>{
  const { sectorId } = req.query;
  const empleados = await Empleado.find(sectorId?{ sector: sectorId }:{}).populate('cargo').populate('sector').lean();
  res.render('nomina/empleados', { empleados });
};

nominaCtrl.crearEmpleado = async (req,res)=>{
  const emp = new Empleado(req.body);
  await emp.save();
  res.redirect('/nomina/empleados');
};

nominaCtrl.crearContrato = async (req,res)=>{
  const c = new Contrato(req.body);
  await c.save();
  res.redirect('/nomina/empleados');
};

nominaCtrl.crearHorario = async (req,res)=>{
  const h = new Horario(req.body);
  await h.save();
  res.redirect('/nomina/empleados');
};

nominaCtrl.listarPeriodos = async (req,res)=>{
  const { sectorId } = req.query;
  const periodos = await NominaPeriodo.find(sectorId?{ sector: sectorId }:{}).populate('sector').sort({ inicio: -1 }).lean();
  res.render('nomina/periodos', { periodos });
};

nominaCtrl.crearPeriodo = async (req,res)=>{
  const p = new NominaPeriodo(req.body);
  await p.save();
  res.redirect('/nomina/periodos');
};

nominaCtrl.calcularPeriodo = async (req,res)=>{
  const { periodoId } = req.params;
  const periodo = await NominaPeriodo.findById(periodoId).populate('sector');
  if(!periodo) return res.status(404).send('Periodo no encontrado');

  const empleados = await Empleado.find({ sector: periodo.sector._id, estado:'ACTIVO' });
  for (const emp of empleados) {
    const contrato = await Contrato.findOne({ empleado: emp._id, activo:true }).sort({ inicio: -1 });
    const horario  = await Horario.findOne({ empleado: emp._id }).sort({ aplica_desde: -1 });
    await construirTimesheetEmpleado(emp, periodo, horario, periodo.sector);
    await calcularRecibo(emp, periodo.sector, contrato, periodo);
  }

  periodo.estado = 'CALCULADO';
  await periodo.save();
  res.redirect('/nomina/periodos');
};

nominaCtrl.verRecibosPeriodo = async (req,res)=>{
  const { periodoId } = req.params;
  const recibos = await ReciboPago.find({ periodo: periodoId }).populate('empleado').lean();
  res.render('nomina/recibos', { recibos });
};

module.exports = nominaCtrl;
