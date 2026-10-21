const express = require("express");
const router = express.Router();
const {
    obtenerEmpresas,
    obtenerEmpresaPorId,
    crearEmpresa,
    actualizarEmpresa,
    eliminarEmpresa
} = require("../controllers/empresas.controller");

const { verificarToken } = require("../middlewares/auth.middleware");

// Aplicar el middleware a TODAS las rutas de este archivo
router.use(verificarToken);

router.get("/", obtenerEmpresas);
router.get("/:id", obtenerEmpresaPorId);
router.post("/", crearEmpresa);
router.put("/:id", actualizarEmpresa);
router.delete("/:id", eliminarEmpresa);

module.exports = router;