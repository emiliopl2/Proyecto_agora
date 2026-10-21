const { getConnection, sql } = require("../config/db");
const { cifrar, descifrar } = require("../utils/crypto.helper");

// GET: Obtener todos (Descifra el RFC de cada donante para mostrarlo en texto plano)
const obtenerDonantes = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                d.*,
                (SELECT COALESCE(SUM(Monto), 0) FROM dbo.Donaciones WHERE DonanteID = d.DonanteID) AS TotalDonado
            FROM dbo.Donantes d
        `);

        // Descifrar el RFC de cada registro antes de enviarlo al cliente
        const donantesProcesados = result.recordset.map(donante => ({
            ...donante,
            RFC: descifrar(donante.RFC)
        }));

        res.json({ exito: true, datos: donantesProcesados });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// GET: Obtener por ID (Descifra el RFC del donante específico)
const obtenerDonantePorId = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT 
                    d.*,
                    (SELECT COALESCE(SUM(Monto), 0) FROM dbo.Donaciones WHERE DonanteID = d.DonanteID) AS TotalDonado
                FROM dbo.Donantes d 
                WHERE d.DonanteID = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ exito: false, mensaje: "Donante no encontrado." });
        }

        const donante = result.recordset[0];
        // Descifrar el RFC
        donante.RFC = descifrar(donante.RFC);

        res.json({ exito: true, datos: donante });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// POST: Crear registro
const crearDonante = async (req, res) => {
    const { Nombre, Apellido, Correo, Telefono, NivelContribuyente, RazonSocial, RFC, RegimenFiscal, CodigoPostal, UsoCFDI } = req.body;
    
    if (!Nombre || !Apellido || !Correo) {
        return res.status(400).json({ exito: false, mensaje: "Nombre, apellido y correo son obligatorios." });
    }

    try {
        // Forzamos el RFC a mayúsculas antes de cifrarlo
        const rfcLimpio = RFC ? RFC.trim().toUpperCase() : null;
        const rfcCifrado = rfcLimpio ? cifrar(rfcLimpio) : null;

        const pool = await getConnection();
        await pool.request()
            .input("nombre", sql.VarChar(100), Nombre)
            .input("apellido", sql.VarChar(100), Apellido)
            .input("correo", sql.VarChar(100), Correo)
            .input("telefono", sql.VarChar(20), Telefono || null)
            .input("nivel", sql.VarChar(20), NivelContribuyente || 'Semilla')
            .input("razonSocial", sql.VarChar(150), RazonSocial || null)
            .input("rfc", sql.VarChar(255), rfcCifrado)
            .input("regimen", sql.VarChar(10), RegimenFiscal || null)
            .input("cp", sql.VarChar(10), CodigoPostal || null)
            .input("cfdi", sql.VarChar(10), UsoCFDI || null)
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
    const { Nombre, Apellido, Correo, Telefono, NivelContribuyente, RazonSocial, RFC, RegimenFiscal, CodigoPostal, UsoCFDI } = req.body;

    try {
        // Forzamos el RFC a mayúsculas antes de cifrarlo
        const rfcLimpio = RFC ? RFC.trim().toUpperCase() : null;
        const rfcCifrado = rfcLimpio ? cifrar(rfcLimpio) : null;

        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("nombre", sql.VarChar(100), Nombre)
            .input("apellido", sql.VarChar(100), Apellido)
            .input("correo", sql.VarChar(100), Correo)
            .input("telefono", sql.VarChar(20), Telefono || null)
            .input("nivel", sql.VarChar(20), NivelContribuyente || 'Semilla')
            .input("razonSocial", sql.VarChar(150), RazonSocial || null)
            .input("rfc", sql.VarChar(255), rfcCifrado)
            .input("regimen", sql.VarChar(10), RegimenFiscal || null)
            .input("cp", sql.VarChar(10), CodigoPostal || null)
            .input("cfdi", sql.VarChar(10), UsoCFDI || null)
            .query(`UPDATE dbo.Donantes 
                    SET Nombre = @nombre, 
                        Apellido = @apellido, 
                        Correo = @correo, 
                        Telefono = @telefono, 
                        NivelContribuyente = @nivel,
                        RazonSocial = @razonSocial,
                        RFC = @rfc,
                        RegimenFiscal = @regimen,
                        CodigoPostal = @cp,
                        UsoCFDI = @cfdi
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