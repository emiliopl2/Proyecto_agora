const express = require("express");
const router = express.Router();
const {
    obtenerBitacoras,
    obtenerBitacoraPorEmpresa,
    crearBitacora,
    actualizarBitacora,
    eliminarBitacora
} = require("../controllers/bitacora.controller");

const { verificarToken } = require("../middlewares/auth.middleware");

// Aplicar el middleware a TODAS las rutas de este archivo
router.use(verificarToken);

router.get("/", obtenerBitacoras);
router.get("/empresa/:empresaId", obtenerBitacoraPorEmpresa);
router.post("/", crearBitacora);
router.put("/:id", actualizarBitacora);
router.delete("/:id", eliminarBitacora);

module.exports = router;