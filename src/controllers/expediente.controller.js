const { getConnection, sql } = require("../config/db");

// GET: Obtener todos los documentos
const obtenerDocumentos = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM dbo.ExpedienteInstitucional ORDER BY FechaVencimiento ASC");
        res.json({ exito: true, datos: result.recordset });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// GET: Obtener un documento por ID
const obtenerDocumentoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM dbo.ExpedienteInstitucional WHERE DocumentoID = @id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ exito: false, mensaje: "Documento no encontrado." });
        }
        res.json({ exito: true, datos: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// POST: Registrar un nuevo documento
const crearDocumento = async (req, res) => {
    const { nombreDocumento, tipoDocumento, rutaArchivo, fechaVencimiento, estatus } = req.body;

    if (!nombreDocumento || !tipoDocumento || !rutaArchivo) {
        return res.status(400).json({ exito: false, mensaje: "NombreDocumento, TipoDocumento y RutaArchivo son obligatorios." });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input("nombreDocumento", sql.VarChar(150), nombreDocumento)
            .input("tipoDocumento", sql.VarChar(50), tipoDocumento)
            .input("rutaArchivo", sql.VarChar(255), rutaArchivo)
            .input("fechaVencimiento", sql.Date, fechaVencimiento || null)
            .input("estatus", sql.VarChar(30), estatus || 'Vigente')
            .query(`INSERT INTO dbo.ExpedienteInstitucional (NombreDocumento, TipoDocumento, RutaArchivo, FechaVencimiento, Estatus)
                    VALUES (@nombreDocumento, @tipoDocumento, @rutaArchivo, @fechaVencimiento, @estatus)`);

        res.status(201).json({ exito: true, mensaje: "Documento registrado correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// PUT: Actualizar un documento existente
const actualizarDocumento = async (req, res) => {
    const { id } = req.params;
    const { nombreDocumento, tipoDocumento, rutaArchivo, fechaVencimiento, estatus } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("nombreDocumento", sql.VarChar(150), nombreDocumento)
            .input("tipoDocumento", sql.VarChar(50), tipoDocumento)
            .input("rutaArchivo", sql.VarChar(255), rutaArchivo)
            .input("fechaVencimiento", sql.Date, fechaVencimiento || null)
            .input("estatus", sql.VarChar(30), estatus)
            .query(`UPDATE dbo.ExpedienteInstitucional 
                    SET NombreDocumento = @nombreDocumento, 
                        TipoDocumento = @tipoDocumento, 
                        RutaArchivo = @rutaArchivo, 
                        FechaVencimiento = @fechaVencimiento, 
                        Estatus = @estatus 
                    WHERE DocumentoID = @id`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Documento no encontrado." });
        }

        res.json({ exito: true, mensaje: "Documento actualizado correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// DELETE: Eliminar un documento
const eliminarDocumento = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM dbo.ExpedienteInstitucional WHERE DocumentoID = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Documento no encontrado." });
        }

        res.json({ exito: true, mensaje: "Documento eliminado correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

module.exports = {
    obtenerDocumentos,
    obtenerDocumentoPorId,
    crearDocumento,
    actualizarDocumento,
    eliminarDocumento
};