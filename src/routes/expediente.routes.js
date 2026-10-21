const express = require("express");
const router = express.Router();
const {
    obtenerDocumentos,
    obtenerDocumentoPorId,
    crearDocumento,
    actualizarDocumento,
    eliminarDocumento
} = require("../controllers/expediente.controller");

const { verificarToken } = require("../middlewares/auth.middleware");

// Aplicar el middleware a TODAS las rutas de este archivo
router.use(verificarToken);

router.get("/", obtenerDocumentos);
router.get("/:id", obtenerDocumentoPorId);
router.post("/", crearDocumento);
router.put("/:id", actualizarDocumento);
router.delete("/:id", eliminarDocumento);

module.exports = router;