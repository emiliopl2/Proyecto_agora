const bcrypt = require("bcrypt");
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

// POST: Crear un nuevo usuario (con encriptación de contraseña)
const crearUsuario = async (req, res) => {
    const { NombreCompleto, Correo, Password, Rol, Activo } = req.body;

    if (!NombreCompleto || !Correo || !Password || !Rol) {
        return res.status(400).json({ exito: false, mensaje: "NombreCompleto, Correo, Password y Rol son obligatorios." });
    }

    try {
        // 1. Generar el hash seguro de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(Password, saltRounds);

        const pool = await getConnection();
        await pool.request()
            .input("nombreCompleto", sql.VarChar(100), NombreCompleto)
            .input("correo", sql.VarChar(100), Correo)
            .input("passwordHash", sql.VarChar(255), passwordHash)
            .input("rol", sql.VarChar(50), Rol)
            .input("activo", sql.TinyInt, Activo !== undefined ? Number(Activo) : 1)
            .query(`
                INSERT INTO dbo.Usuarios (NombreCompleto, Correo, PasswordHash, Rol, Activo)
                VALUES (@nombreCompleto, @correo, @passwordHash, @rol, @activo)
            `);

        res.status(201).json({ exito: true, mensaje: "Usuario creado correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// PUT: Actualizar un usuario (si se incluye contraseña, se vuelve a encriptar)
const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { NombreCompleto, Correo, Password, Rol, Activo } = req.body;

    try {
        const pool = await getConnection();

        // Si se envía un nuevo password, lo encriptamos; de lo contrario, actualizamos solo los demás campos
        let queryUpdate = `
            UPDATE dbo.Usuarios 
            SET NombreCompleto = @nombreCompleto, 
                Correo = @correo, 
                Rol = @rol, 
                Activo = @activo
        `;

        const request = pool.request()
            .input("id", sql.Int, id)
            .input("nombreCompleto", sql.VarChar(100), NombreCompleto)
            .input("correo", sql.VarChar(100), Correo)
            .input("rol", sql.VarChar(50), Rol)
            .input("activo", sql.TinyInt, Activo);

        if (Password && Password.trim() !== "") {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(Password, saltRounds);
            queryUpdate += `, PasswordHash = @passwordHash `;
            request.input("passwordHash", sql.VarChar(255), passwordHash);
        }

        queryUpdate += ` WHERE UsuarioID = @id`;

        const result = await request.query(queryUpdate);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Usuario no encontrado." });
        }

        res.json({ exito: true, mensaje: "Usuario actualizado correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario
};