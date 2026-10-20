const { getConnection, sql } = require("../config/db");

// GET: Obtener todas las donaciones con la información del donante
const obtenerDonaciones = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT d.DonacionID, d.DonanteID, 
                   dn.Nombre + ' ' + dn.Apellido AS Donante,
                   d.Monto, d.EstadoProceso, d.Canal, 
                   d.RequiereRecibo, d.ReciboEmitido, d.FechaDonacion
            FROM dbo.Donaciones d
            JOIN dbo.Donantes dn ON dn.DonanteID = d.DonanteID
            ORDER BY d.FechaDonacion DESC
        `);
        res.json({ exito: true, datos: result.recordset });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// GET: Obtener donación por ID
const obtenerDonacionPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT d.*, dn.Nombre + ' ' + dn.Apellido AS Donante
                FROM dbo.Donaciones d
                JOIN dbo.Donantes dn ON dn.DonanteID = d.DonanteID
                WHERE d.DonacionID = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ exito: false, mensaje: "Donación no encontrada." });
        }
        res.json({ exito: true, datos: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// POST: Registrar nueva donación
const crearDonacion = async (req, res) => {
    // Leemos los nombres exactos tal como los envía el formulario HTML
    const { DonanteID, Monto, EstadoProceso, Canal, RequiereRecibo, ReciboEmitido } = req.body;

    if (!DonanteID || !Monto || !EstadoProceso || !Canal) {
        return res.status(400).json({ 
            exito: false, 
            mensaje: "DonanteID, Monto, EstadoProceso y Canal son obligatorios." 
        });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input("donanteId", sql.Int, DonanteID)
            .input("monto", sql.Decimal(10, 2), Monto)
            .input("estadoProceso", sql.VarChar(50), EstadoProceso)
            .input("canal", sql.VarChar(30), Canal)
            .input("requiereRecibo", sql.TinyInt, RequiereRecibo !== undefined ? RequiereRecibo : 1)
            .input("reciboEmitido", sql.TinyInt, ReciboEmitido !== undefined ? ReciboEmitido : 0)
            .query(`
                INSERT INTO dbo.Donaciones (DonanteID, Monto, EstadoProceso, Canal, RequiereRecibo, ReciboEmitido)
                VALUES (@donanteId, @monto, @estadoProceso, @canal, @requiereRecibo, @reciboEmitido)
            `);

        res.status(201).json({ exito: true, mensaje: "Donación registrada correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// PUT: Actualizar donación
const actualizarDonacion = async (req, res) => {
    const { id } = req.params;
    const { Monto, EstadoProceso, Canal, RequiereRecibo, ReciboEmitido } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("monto", sql.Decimal(10, 2), Monto)
            .input("estadoProceso", sql.VarChar(50), EstadoProceso)
            .input("canal", sql.VarChar(30), Canal)
            .input("requiereRecibo", sql.TinyInt, RequiereRecibo)
            .input("reciboEmitido", sql.TinyInt, ReciboEmitido)
            .query(`
                UPDATE dbo.Donaciones 
                SET Monto = @monto, 
                    EstadoProceso = @estadoProceso, 
                    Canal = @canal, 
                    RequiereRecibo = @requiereRecibo, 
                    ReciboEmitido = @reciboEmitido
                WHERE DonacionID = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Donación no encontrada." });
        }

        res.json({ exito: true, mensaje: "Donación actualizada correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// DELETE: Eliminar donación
const eliminarDonacion = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM dbo.Donaciones WHERE DonacionID = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Donación no encontrada." });
        }

        res.json({ exito: true, mensaje: "Donación eliminada correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

module.exports = {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion
};