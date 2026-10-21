const express = require("express");
const router = express.Router();
const {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario
} = require("../controllers/usuarios.controller");

const { verificarToken, verificarRolAdmin } = require("../middlewares/auth.middleware");

// Rutas protegidas: Cualquier usuario logueado puede listar
router.get("/", verificarToken, obtenerUsuarios);
router.get("/:id", verificarToken, obtenerUsuarioPorId);

// Rutas estrictamente protegidas: Solo un Administrador autenticado puede crear o modificar
router.post("/", verificarToken, verificarRolAdmin, crearUsuario);
router.put("/:id", verificarToken, verificarRolAdmin, actualizarUsuario);

module.exports = router;