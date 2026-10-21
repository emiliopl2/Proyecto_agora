const express = require("express");
const router = express.Router();
const {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion
} = require("../controllers/donaciones.controller");

const { verificarToken } = require("../middlewares/auth.middleware");

// Aplicar el middleware a TODAS las rutas de este archivo
router.use(verificarToken);

router.get("/", obtenerDonaciones);
router.get("/:id", obtenerDonacionPorId);
router.post("/", crearDonacion);
router.put("/:id", actualizarDonacion);
router.delete("/:id", eliminarDonacion);

module.exports = router;