const express = require("express");
const router = express.Router();
const { login } = require("../controllers/auth.controller");

// Ruta: POST /api/auth/login (si en server.js lo montaste con /api/auth)
router.post("/login", login);

module.exports = router;