// router/nomina.router.js
const router = require('express').Router();
const nomina = require('../controlls/nomina.controller');

// Vistas de configuración

router.get("/", async (req, res) => {
    res.render("home", { nombre_pagina: "Inicio" });
});

router.get("/login", async (req, res) => {
    res.render("login", { nombre_pagina: "Login" });

});

router.get('/nomina/config', nomina.viewConfig);
router.post('/nomina/sector', nomina.crearSector);

// Empleados / Contratos / Horarios
router.get('/nomina/empleados', nomina.viewEmpleados);
router.post('/nomina/empleado', nomina.crearEmpleado);
router.post('/nomina/contrato', nomina.crearContrato);
router.post('/nomina/horario', nomina.crearHorario);

// Periodos
router.get('/nomina/periodos', nomina.listarPeriodos);
router.post('/nomina/periodo', nomina.crearPeriodo);
router.post('/nomina/periodo/:periodoId/calcular', nomina.calcularPeriodo);
router.get('/nomina/periodo/:periodoId/recibos', nomina.verRecibosPeriodo);

module.exports = router;
