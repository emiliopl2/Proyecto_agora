require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); // Permite peticiones externas (necesario para Postman y otros dispositivos)
app.use(express.json());

// =========================================================================
// LOGICA DE CONEXION
// =========================================================================

const PORT = process.env.PORT || 3000;

const config = {
    server: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_NAME || "agora_pruebas",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: true,
        trustServerCertificate: process.env.DB_TRUST_CERT === "true",
    },
    connectionTimeout: 8000,
    requestTimeout: 8000,
};

function explicar(err) {
    if (err.code === "ELOGIN") return "Usuario o contraseña incorrectos (revisa DB_USER y DB_PASSWORD en .env).";
    if (err.code === "ESOCKET" || err.code === "ETIMEOUT")
        return "No se pudo llegar al servidor. Revisa que el contenedor esté encendido y que DB_HOST y DB_PORT sean correctos.";
    return "";
}

// =========================================================================
// NUEVA RUTA: ENDPOINT DE LOGIN
// =========================================================================
app.post("/api/login", async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ exito: false, mensaje: "Faltan el correo y la contraseña." });
    }

    let pool;
    try {
        pool = await sql.connect(config);
        
        // Consultar el usuario por correo y verificar que esté activo
        const result = await pool.request()
            .input("correo", sql.VarChar(100), correo)
            .query(`SELECT UsuarioID, NombreCompleto, Correo, PasswordHash, Rol, Activo 
                    FROM dbo.Usuarios 
                    WHERE Correo = @correo AND Activo = 1`);

        if (result.recordset.length === 0) {
            return res.status(401).json({ exito: false, mensaje: "Correo o contraseña incorrectos." });
        }

        const usuario = result.recordset[0];

        if (usuario.PasswordHash !== password) {
            return res.status(401).json({ exito: false, mensaje: "Correo o contraseña incorrectos." });
        }

        // Login exitoso (puedes enviar datos útiles al frontend sin la contraseña)
        res.json({
            exito: true,
            mensaje: "¡Bienvenido!",
            usuario: {
                id: usuario.UsuarioID,
                nombre: usuario.NombreCompleto,
                correo: usuario.Correo,
                rol: usuario.Rol
            }
        });

    } catch (err) {
        console.error("Error en el login:", err.message);
        res.status(500).json({ exito: false, mensaje: "Error interno del servidor." });
    } finally {
        if (pool) await pool.close();
    }
});

// =========================================================================
// NUEVA SECCIÓN: ENDPOINT REST (Aquí se reciben las peticiones HTTP)
// =========================================================================
app.get("/api/conexion", async (req, res) => {
    if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
        return res.status(500).json({ error: "Faltan DB_USER o DB_PASSWORD en el archivo .env" });
    }

    let pool;
    try {
        // Conexión a la base de datos solo cuando alguien hace una petición
        pool = await sql.connect(config);
        const result = await pool
            .request()
            .input("empresa", sql.NVarChar(100), "Ágora")
            .query(`SELECT empresa, ambiente, base_datos, ip, puerto,
                    firewall_entrada, firewall_salida, usuario_consulta
             FROM dbo.conexion_agora
             WHERE empresa = @empresa`);

        if (result.recordset.length === 0) {
            return res.status(404).json({ mensaje: "No se encontró la empresa." });
        }

        // EN VEZ DE CONSOLE.LOG: Respondemos con un objeto JSON estructurado
        res.json({
            exito: true,
            datos: result.recordset
        });

    } catch (err) {
        console.error("Error al consultar:", err.message);
        const ayuda = explicar(err);
        res.status(500).json({ 
            error: err.message, 
            pista: ayuda || "Error desconocido" 
        });
    } finally {
        if (pool) {
            await pool.close(); // Cerramos el pool de conexión de forma segura
        }
    }
});

// =========================================================================
// NUEVA SECCIÓN: INICIAR EL SERVIDOR WEB PARA TODA LA RED
// =========================================================================
// Nota: Usar '0.0.0.0' en lugar de 'localhost' es la clave para que dispositivos
// externos en la misma red puedan acceder a este servidor.
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor API REST corriendo en el puerto ${PORT}`);
    console.log(`Listo para recibir peticiones locales y de la red.`);
});