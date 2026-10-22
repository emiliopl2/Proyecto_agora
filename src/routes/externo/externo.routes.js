const express = require("express");
const router = express.Router();
const { verificarApiKeyExterna } = require("../../middlewares/externo.middleware");

// Importar los submodulos externos
const usuariosExternosRoutes = require("./externo.usuarios.routes");
const donacionesExternosRoutes = require("./externo.donaciones.routes");
const donantesExternosRoutes = require("./externo.donantes.routes");
const expedienteExternosRoutes = require("./externo.expediente.routes");
const bitacoraExternosRoutes = require("./externo.bitacora.routes");
const convocatoriasExternosRoutes = require("./externo.convocatorias.routes");
const empresasExternosRoutes = require("./externo.empresas.routes");

// Aplicar seguridad por API Key a todo este bloque
router.use(verificarApiKeyExterna);

// Endpoints del contrato expuestos al nodo externo

router.use("/usuarios", usuariosExternosRoutes);
router.use("/donaciones", donacionesExternosRoutes);
router.use("/donantes", donantesExternosRoutes);
router.use("/expediente", expedienteExternosRoutes);
router.use("/bitacora", bitacoraExternosRoutes);
router.use("/convocatorias", convocatoriasExternosRoutes);
router.use("/empresas", empresasExternosRoutes);

module.exports = router;