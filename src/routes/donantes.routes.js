const express = require("express");
const router = express.Router();
const {
    obtenerDonantes,
    obtenerDonantePorId,
    crearDonante,
    actualizarDonante,
    eliminarDonante
} = require("../controllers/donantes.controller");

const { verificarToken } = require("../middlewares/auth.middleware");

// Aplicar el middleware a TODAS las rutas de este archivo
router.use(verificarToken);

router.get("/", obtenerDonantes);
router.get("/:id", obtenerDonantePorId);
router.post("/", crearDonante);
router.put("/:id", actualizarDonante);
router.delete("/:id", eliminarDonante);

module.exports = router;