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
    const { donanteId, monto, estadoProceso, canal, requiereRecibo, reciboEmitido } = req.body;

    if (!donanteId || !monto || !estadoProceso || !canal) {
        return res.status(400).json({ exito: false, mensaje: "DonanteID, Monto, EstadoProceso y Canal son obligatorios." });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input("donanteId", sql.Int, donanteId)
            .input("monto", sql.Decimal(10, 2), monto)
            .input("estadoProceso", sql.VarChar(50), estadoProceso)
            .input("canal", sql.VarChar(30), canal)
            .input("requiereRecibo", sql.TinyInt, requiereRecibo !== undefined ? requiereRecibo : 1)
            .input("reciboEmitido", sql.TinyInt, reciboEmitido !== undefined ? reciboEmitido : 0)
            .query(`
                INSERT INTO dbo.Donaciones (DonanteID, Monto, EstadoProceso, Canal, RequiereRecibo, ReciboEmitido)
                VALUES (@donanteId, @monto, @estadoProceso, @canal, @requiereRecibo, @reciboEmitido)
            `);

        res.status(201).json({ exito: true, mensaje: "Donación registrada correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// PUT: Actualizar donación (estado de proceso, recibo emitido, etc.)
const actualizarDonacion = async (req, res) => {
    const { id } = req.params;
    const { monto, estadoProceso, canal, requiereRecibo, reciboEmitido } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("monto", sql.Decimal(10, 2), monto)
            .input("estadoProceso", sql.VarChar(50), estadoProceso)
            .input("canal", sql.VarChar(30), canal)
            .input("requiereRecibo", sql.TinyInt, requiereRecibo)
            .input("reciboEmitido", sql.TinyInt, reciboEmitido)
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