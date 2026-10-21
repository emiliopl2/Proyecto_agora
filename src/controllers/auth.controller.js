const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getConnection, sql } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura_agora_2026';

// POST: Iniciar sesión
const login = async (req, res) => {
    const { NombreCompleto, password } = req.body;

    if (!NombreCompleto || !password) {
        return res.status(400).json({ exito: false, mensaje: "Faltan el usuario y la contraseña." });
    }

    try {
        const pool = await getConnection();
        
        const result = await pool.request()
            .input("NombreCompleto", sql.VarChar(100), NombreCompleto)
            .query(`SELECT UsuarioID, NombreCompleto, Correo, PasswordHash, Rol, Activo 
                    FROM dbo.Usuarios 
                    WHERE NombreCompleto = @NombreCompleto AND Activo = 1`);

        if (result.recordset.length === 0) {
            return res.status(401).json({ exito: false, mensaje: "usuario o contraseña incorrectos." });
        }

        const usuario = result.recordset[0];

        const esValida = await bcrypt.compare(password, usuario.PasswordHash);

        if (!esValida) {
            return res.status(401).json({ exito: false, mensaje: "usuario o contraseña incorrectos." });
        }

        // Generar Token JWT (expira en 8 horas)
        const token = jwt.sign(
            { 
                id: usuario.UsuarioID, 
                nombre: usuario.NombreCompleto, 
                rol: usuario.Rol 
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Login exitoso respondiendo con el token
        res.json({
            exito: true,
            mensaje: "¡Bienvenido!",
            token: token,
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
    }
};

module.exports = {
    login
};