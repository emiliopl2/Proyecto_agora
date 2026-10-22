require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// =========================================================================
// IMPORTAR RUTAS
// =========================================================================

const authRoutes = require("./src/routes/auth.routes");
const usuariosRoutes = require("./src/routes/usuarios.routes");
const donantesRoutes = require("./src/routes/donantes.routes");
const donacionesRoutes = require("./src/routes/donaciones.routes");
const expedienteRoutes = require("./src/routes/expediente.routes");
const convocatoriasRoutes = require("./src/routes/convocatorias.routes");
const empresasRoutes = require("./src/routes/empresas.routes");
const bitacoraRoutes = require("./src/routes/bitacora.routes");

// =========================================================================
// MONTAR RUTAS EN LA API
// =========================================================================

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/donantes", donantesRoutes);
app.use("/api/donaciones", donacionesRoutes);
app.use("/api/expediente", expedienteRoutes);
app.use("/api/convocatorias", convocatoriasRoutes);
app.use("/api/empresas", empresasRoutes);
app.use("/api/bitacora", bitacoraRoutes);

// =========================================================================
// MONTAR RUTAS EN LA API PARA PRIMER SEMESTRE
// =========================================================================

const externoRoutes = require("./src/routes/externo/externo.routes");

// Montar rutas del nodo externo
app.use("/api/externo", externoRoutes);

// =========================================================================
// INICIAR EL SERVIDOR WEB PARA TODA LA RED
// =========================================================================
// Nota: Usar '0.0.0.0' en lugar de 'localhost' es la clave para que dispositivos
// externos en la misma red puedan acceder a este servidor.
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor API REST corriendo en el puerto ${PORT}`);
    console.log(`Listo para recibir peticiones locales y de la red.`);
});