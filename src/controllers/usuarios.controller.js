const { getConnection, sql } = require("../config/db");

// GET: Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(
            "SELECT UsuarioID, NombreCompleto, Correo, Rol, Activo, FechaCreacion FROM dbo.Usuarios"
        );
        res.json({ exito: true, datos: result.recordset });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// GET: Obtener un usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT UsuarioID, NombreCompleto, Correo, Rol, Activo, FechaCreacion FROM dbo.Usuarios WHERE UsuarioID = @id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ exito: false, mensaje: "Usuario no encontrado." });
        }
        res.json({ exito: true, datos: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId
};