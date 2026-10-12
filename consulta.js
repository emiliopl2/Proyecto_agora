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

function explicar(err) {
    if (err.code === "ELOGIN") return "Usuario o contraseña incorrectos (revisa DB_USER y DB_PASSWORD en .env).";
    if (err.code === "ESOCKET" || err.code === "ETIMEOUT")
        return "No se pudo llegar al servidor. Revisa que el contenedor esté encendido y que DB_HOST y DB_PORT sean correctos.";
    return "";
}

async function main() {
    if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
        throw new Error("Faltan DB_USER o DB_PASSWORD en el archivo .env");
    }
    const pool = await sql.connect(config);
    try {
        const result = await pool
            .request()
            .input("empresa", sql.NVarChar(100), "Ágora")
            .query(`SELECT empresa, ambiente, base_datos, ip, puerto,
                     firewall_entrada, firewall_salida, usuario_consulta
                FROM dbo.conexion_agora
               WHERE empresa = @empresa`);

        if (result.recordset.length === 0) {
            console.log("No se encontró la empresa.");
            return;
        }
        for (const fila of result.recordset) {
            for (const [campo, valor] of Object.entries(fila)) {
                console.log(`${campo.padEnd(18)}: ${valor}`);
            }
        }
    } finally {
        await pool.close();
    }
}

main().catch((err) => {
    console.error("No se pudo consultar:", err.message);
    const ayuda = explicar(err);
    if (ayuda) console.error("Pista:", ayuda);
    process.exit(1);
});