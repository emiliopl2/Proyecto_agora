const express = require("express");
const router = express.Router();
const {
    obtenerDocumentos,
    obtenerDocumentoPorId,
    crearDocumento,
    actualizarDocumento,
    eliminarDocumento
} = require("../controllers/expediente.controller");

router.get("/", obtenerDocumentos);
router.get("/:id", obtenerDocumentoPorId);
router.post("/", crearDocumento);
router.put("/:id", actualizarDocumento);
router.delete("/:id", eliminarDocumento);

module.exports = router;