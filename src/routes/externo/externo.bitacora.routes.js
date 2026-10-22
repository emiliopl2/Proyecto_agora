const express = require("express");
const router = express.Router();
const {
    obtenerBitacoras,
    obtenerBitacoraPorEmpresa,
    crearBitacora,
    actualizarBitacora,
    eliminarBitacora
} = require("../../controllers/bitacora.controller");

router.get("/", obtenerBitacoras);
router.get("/empresa/:empresaId", obtenerBitacoraPorEmpresa);
router.post("/", crearBitacora);
router.put("/:id", actualizarBitacora);
router.delete("/:id", eliminarBitacora);

module.exports = router;