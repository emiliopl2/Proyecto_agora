const { getConnection, sql } = require("../config/db");

// GET: Obtener todos
const obtenerDonantes = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM dbo.Donantes");
        res.json({ exito: true, datos: result.recordset });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// GET: Obtener por ID
const obtenerDonantePorId = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM dbo.Donantes WHERE DonanteID = @id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ exito: false, mensaje: "Donante no encontrado." });
        }
        res.json({ exito: true, datos: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// POST: Crear registro
const crearDonante = async (req, res) => {
    const { nombre, apellido, correo, telefono, nivelContribuyente, razonSocial, rfc, regimenFiscal, codigoPostal, usoCFDI } = req.body;
    
    if (!nombre || !apellido || !correo) {
        return res.status(400).json({ exito: false, mensaje: "Nombre, apellido y correo son obligatorios." });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input("nombre", sql.VarChar(100), nombre)
            .input("apellido", sql.VarChar(100), apellido)
            .input("correo", sql.VarChar(100), correo)
            .input("telefono", sql.VarChar(20), telefono || null)
            .input("nivel", sql.VarChar(20), nivelContribuyente || 'Semilla')
            .input("razonSocial", sql.VarChar(150), razonSocial || null)
            .input("rfc", sql.VarChar(20), rfc || null)
            .input("regimen", sql.VarChar(10), regimenFiscal || null)
            .input("cp", sql.VarChar(10), codigoPostal || null)
            .input("cfdi", sql.VarChar(10), usoCFDI || null)
            .query(`INSERT INTO dbo.Donantes (Nombre, Apellido, Correo, Telefono, NivelContribuyente, RazonSocial, RFC, RegimenFiscal, CodigoPostal, UsoCFDI)
                    VALUES (@nombre, @apellido, @correo, @telefono, @nivel, @razonSocial, @rfc, @regimen, @cp, @cfdi)`);

        res.status(201).json({ exito: true, mensaje: "Donante registrado correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// PUT: Actualizar registro
const actualizarDonante = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, correo, telefono, nivelContribuyente } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("nombre", sql.VarChar(100), nombre)
            .input("apellido", sql.VarChar(100), apellido)
            .input("correo", sql.VarChar(100), correo)
            .input("telefono", sql.VarChar(20), telefono)
            .input("nivel", sql.VarChar(20), nivelContribuyente)
            .query(`UPDATE dbo.Donantes 
                    SET Nombre = @nombre, Apellido = @apellido, Correo = @correo, Telefono = @telefono, NivelContribuyente = @nivel 
                    WHERE DonanteID = @id`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Donante no encontrado." });
        }

        res.json({ exito: true, mensaje: "Donante actualizado correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// DELETE: Eliminar registro
const eliminarDonante = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM dbo.Donantes WHERE DonanteID = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Donante no encontrado." });
        }

        res.json({ exito: true, mensaje: "Donante eliminado correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

module.exports = {
    obtenerDonantes,
    obtenerDonantePorId,
    crearDonante,
    actualizarDonante,
    eliminarDonante
};