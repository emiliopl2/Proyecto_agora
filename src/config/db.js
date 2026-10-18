require("dotenv").config();
const sql = require("mssql");

const config = {
    server: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_NAME || "agora_pruebas",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: true,
        trustServerCertificate: process.env.DB_TRUST_CERT === "true",
    },
    connectionTimeout: 8000,
    requestTimeout: 8000,
};

async function getConnection() {
    try {
        const pool = await sql.connect(config);
        return pool;
    } catch (err) {
        console.error("Error al conectar con SQL Server:", err.message);
        throw err;
    }
}

module.exports = { sql, getConnection };