const { getConnection, sql } = require("../config/db");

// GET: Obtener todas las empresas prospectos
const obtenerEmpresas = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM dbo.EmpresasProspectos ORDER BY FechaRegistro DESC");
        res.json({ exito: true, datos: result.recordset });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// GET: Obtener empresa prospecto por ID
const obtenerEmpresaPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM dbo.EmpresasProspectos WHERE EmpresaID = @id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ exito: false, mensaje: "Empresa no encontrada." });
        }
        res.json({ exito: true, datos: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// POST: Registrar una nueva empresa prospecto
const crearEmpresa = async (req, res) => {
    const { nombreEmpresa, tipoAlianza, alineacionEtica, estatus, enlaceContacto } = req.body;

    if (!nombreEmpresa || !tipoAlianza || !estatus) {
        return res.status(400).json({ exito: false, mensaje: "NombreEmpresa, TipoAlianza y Estatus son obligatorios." });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input("nombreEmpresa", sql.VarChar(150), nombreEmpresa)
            .input("tipoAlianza", sql.VarChar(50), tipoAlianza)
            .input("alineacionEtica", sql.TinyInt, alineacionEtica !== undefined ? alineacionEtica : 1)
            .input("estatus", sql.VarChar(50), estatus)
            .input("enlaceContacto", sql.VarChar(150), enlaceContacto || null)
            .query(`INSERT INTO dbo.EmpresasProspectos (NombreEmpresa, TipoAlianza, AlineacionEtica, Estatus, EnlaceContacto)
                    VALUES (@nombreEmpresa, @tipoAlianza, @alineacionEtica, @estatus, @enlaceContacto)`);

        res.status(201).json({ exito: true, mensaje: "Empresa prospecto registrada correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// PUT: Actualizar una empresa prospecto
const actualizarEmpresa = async (req, res) => {
    const { id } = req.params;
    const { nombreEmpresa, tipoAlianza, alineacionEtica, estatus, enlaceContacto } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("nombreEmpresa", sql.VarChar(150), nombreEmpresa)
            .input("tipoAlianza", sql.VarChar(50), tipoAlianza)
            .input("alineacionEtica", sql.TinyInt, alineacionEtica)
            .input("estatus", sql.VarChar(50), estatus)
            .input("enlaceContacto", sql.VarChar(150), enlaceContacto || null)
            .query(`UPDATE dbo.EmpresasProspectos 
                    SET NombreEmpresa = @nombreEmpresa, 
                        TipoAlianza = @tipoAlianza, 
                        AlineacionEtica = @alineacionEtica, 
                        Estatus = @estatus, 
                        EnlaceContacto = @enlaceContacto 
                    WHERE EmpresaID = @id`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Empresa no encontrada." });
        }

        res.json({ exito: true, mensaje: "Empresa prospecto actualizada correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

// DELETE: Eliminar una empresa prospecto
const eliminarEmpresa = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM dbo.EmpresasProspectos WHERE EmpresaID = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ exito: false, mensaje: "Empresa no encontrada." });
        }

        res.json({ exito: true, mensaje: "Empresa prospecto eliminada correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
};

module.exports = {
    obtenerEmpresas,
    obtenerEmpresaPorId,
    crearEmpresa,
    actualizarEmpresa,
    eliminarEmpresa
};