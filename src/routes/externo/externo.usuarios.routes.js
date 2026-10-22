const express = require("express");
const router = express.Router();
const {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario
} = require("../../controllers/usuarios.controller");

// Como el enrutador maestro ya validó la API Key, aquí solo mapeamos las operaciones directas
router.get("/", obtenerUsuarios);
router.get("/:id", obtenerUsuarioPorId);
router.post("/", crearUsuario);
router.put("/:id", actualizarUsuario);

module.exports = router;