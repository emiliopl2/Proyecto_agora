const { getConnection, sql } = require("../config/db");

// POST: Iniciar sesión
const login = async (req, res) => {
    const { NombreCompleto, password } = req.body;

    if (!NombreCompleto || !password) {
        return res.status(400).json({ exito: false, mensaje: "Faltan el usuario y la contraseña." });
    }

    try {
        const pool = await getConnection();
        
        // Consultar el usuario y verificar que esté activo (Activo = 1)
        const result = await pool.request()
            .input("NombreCompleto", sql.VarChar(100), NombreCompleto)
            .query(`SELECT UsuarioID, NombreCompleto, Correo, PasswordHash, Rol, Activo 
                    FROM dbo.Usuarios 
                    WHERE NombreCompleto = @NombreCompleto AND Activo = 1`);

        if (result.recordset.length === 0) {
            return res.status(401).json({ exito: false, mensaje: "usuario o contraseña incorrectos." });
        }

        const usuario = result.recordset[0];

        // Validación de contraseña (en producción se recomienda usar bcrypt, aquí validamos texto plano según tu script inicial)
        if (usuario.PasswordHash !== password) {
            return res.status(401).json({ exito: false, mensaje: "usuario o contraseña incorrectos." });
        }

        // Login exitoso
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
    }
};

module.exports = {
    login
};