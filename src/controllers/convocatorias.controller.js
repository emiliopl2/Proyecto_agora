const { getConnection, sql } = require("../config/db");

// GET: Obtener todas las convocatorias
const obtenerConvocatorias = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM dbo.Convocatorias ORDER BY FechaCierre ASC");
        res.json({ exito: true, datos: result.recordset });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// GET: Obtener convocatoria por ID
const obtenerConvocatoriaPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM dbo.Convocatorias WHERE ConvocatoriaID = @id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ exito: false, mensaje: "Convocatoria no encontrada." });
        }
        res.json({ exito: true, datos: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// POST: Registrar una nueva convocatoria
const crearConvocatoria = async (req, res) => {
    const { NombreFondo, EntidadFinanciera, Estado, FechaCierre, AprobadaDireccion, Observaciones } = req.body;

    if (!NombreFondo || !EntidadFinanciera || !Estado) {
        return res.status(400).json({ exito: false, mensaje: "NombreFondo, EntidadFinanciera y Estado son obligatorios." });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input("nombreFondo", sql.VarChar(150), NombreFondo)
            .input("entidadFinanciera", sql.VarChar(150), EntidadFinanciera)
            .input("estado", sql.VarChar(50), Estado)
            .input("fechaCierre", sql.Date, FechaCierre || null)
            .input("aprobadaDireccion", sql.TinyInt, AprobadaDireccion !== undefined ? Number(AprobadaDireccion) : 0)
            .input("observaciones", sql.VarChar(sql.MAX), Observaciones || null)
            .query(`INSERT INTO dbo.Convocatorias (NombreFondo, EntidadFinanciera, Estado, FechaCierre, AprobadaDireccion, Observaciones)
                    VALUES (@nombreFondo, @entidadFinanciera, @estado, @fechaCierre, @aprobadaDireccion, @observaciones)`);

        res.status(201).json({ exito: true, mensaje: "Convocatoria registrada correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// PUT: Actualizar una convocatoria existente
const actualizarConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { NombreFondo, EntidadFinanciera, Estado, FechaCierre, AprobadaDireccion, Observaciones } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("nombreFondo", sql.VarChar(150), NombreFondo)
            .input("entidadFinanciera", sql.VarChar(150), EntidadFinanciera)
            .input("estado", sql.VarChar(50), Estado)
            .input("fechaCierre", sql.Date, FechaCierre || null)
            .input("aprobadaDireccion", sql.TinyInt, AprobadaDireccion !== undefined ? Number(AprobadaDireccion) : 0)
            .input("observaciones", sql.VarChar(sql.MAX), Observaciones || null)
            .query(`UPDATE dbo.Convocatorias 
                    SET NombreFondo = @nombreFondo, 
                        EntidadFinanciera = @entidadFinanciera, 
                        Estado = @estado, 
                        FechaCierre = @fechaCierre, 
                        AprobadaDireccion = @aprobadaDireccion, 
                        Observaciones = @observaciones 
                    WHERE ConvocatoriaID = @id`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Convocatoria no encontrada." });
        }

        res.json({ exito: true, mensaje: "Convocatoria actualizada correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// DELETE: Eliminar una convocatoria
const eliminarConvocatoria = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM dbo.Convocatorias WHERE ConvocatoriaID = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Convocatoria no encontrada." });
        }

        res.json({ exito: true, mensaje: "Convocatoria eliminada correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

module.exports = {
    obtenerConvocatorias,
    obtenerConvocatoriaPorId,
    crearConvocatoria,
    actualizarConvocatoria,
    eliminarConvocatoria
};