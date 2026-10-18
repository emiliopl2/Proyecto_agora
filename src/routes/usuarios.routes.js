const express = require("express");
const router = express.Router();
const {
    obtenerUsuarios,
    obtenerUsuarioPorId
} = require("../controllers/usuarios.controller");

// Rutas configuradas (Montadas en /api/usuarios desde server.js)
router.get("/", obtenerUsuarios);
router.get("/:id", obtenerUsuarioPorId);

module.exports = router;