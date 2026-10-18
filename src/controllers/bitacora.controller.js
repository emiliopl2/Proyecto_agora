const { getConnection, sql } = require("../config/db");

// GET: Obtener todas las interacciones registradas
const obtenerBitacoras = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT b.BitacoraID, b.EmpresaID, e.NombreEmpresa,
                   b.UsuarioID, u.NombreCompleto AS Responsable,
                   b.Canal, b.DetalleInteraccion, b.FechaInteraccion
            FROM dbo.BitacoraEmpresas b
            JOIN dbo.EmpresasProspectos e ON e.EmpresaID = b.EmpresaID
            JOIN dbo.Usuarios u ON u.UsuarioID = b.UsuarioID
            ORDER BY b.FechaInteraccion DESC
        `);
        res.json({ exito: true, datos: result.recordset });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// GET: Obtener interacciones de una empresa en específico
const obtenerBitacoraPorEmpresa = async (req, res) => {
    const { empresaId } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("empresaId", sql.Int, empresaId)
            .query(`
                SELECT b.BitacoraID, b.EmpresaID, e.NombreEmpresa,
                       b.UsuarioID, u.NombreCompleto AS Responsable,
                       b.Canal, b.DetalleInteraccion, b.FechaInteraccion
                FROM dbo.BitacoraEmpresas b
                JOIN dbo.EmpresasProspectos e ON e.EmpresaID = b.EmpresaID
                JOIN dbo.Usuarios u ON u.UsuarioID = b.UsuarioID
                WHERE b.EmpresaID = @empresaId
                ORDER BY b.FechaInteraccion DESC
            `);

        res.json({ exito: true, datos: result.recordset });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// POST: Registrar nueva interacción en bitácora
const crearBitacora = async (req, res) => {
    const { empresaId, usuarioId, canal, detalleInteraccion } = req.body;

    if (!empresaId || !usuarioId || !canal || !detalleInteraccion) {
        return res.status(400).json({ 
            exito: false, 
            mensaje: "EmpresaID, UsuarioID, Canal y DetalleInteraccion son obligatorios." 
        });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input("empresaId", sql.Int, empresaId)
            .input("usuarioId", sql.Int, usuarioId)
            .input("canal", sql.VarChar(30), canal)
            .input("detalleInteraccion", sql.VarChar(sql.MAX), detalleInteraccion)
            .query(`
                INSERT INTO dbo.BitacoraEmpresas (EmpresaID, UsuarioID, Canal, DetalleInteraccion)
                VALUES (@empresaId, @usuarioId, @canal, @detalleInteraccion)
            `);

        res.status(201).json({ exito: true, mensaje: "Interacción registrada correctamente en la bitácora." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// PUT: Actualizar una interacción existente
const actualizarBitacora = async (req, res) => {
    const { id } = req.params;
    const { canal, detalleInteraccion } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("canal", sql.VarChar(30), canal)
            .input("detalleInteraccion", sql.VarChar(sql.MAX), detalleInteraccion)
            .query(`
                UPDATE dbo.BitacoraEmpresas 
                SET Canal = @canal, 
                    DetalleInteraccion = @detalleInteraccion 
                WHERE BitacoraID = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Registro de bitácora no encontrado." });
        }

        res.json({ exito: true, mensaje: "Interacción actualizada correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// DELETE: Eliminar una interacción
const eliminarBitacora = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM dbo.BitacoraEmpresas WHERE BitacoraID = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Registro de bitácora no encontrado." });
        }

        res.json({ exito: true, mensaje: "Registro eliminado de la bitácora." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

module.exports = {
    obtenerBitacoras,
    obtenerBitacoraPorEmpresa,
    crearBitacora,
    actualizarBitacora,
    eliminarBitacora
};