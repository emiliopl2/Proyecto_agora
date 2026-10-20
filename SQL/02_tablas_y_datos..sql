-- =====================================================
-- 02_tablas_y_datos.sql
-- Se puede ejecutar varias veces sin errores ni duplicados.
-- =====================================================
USE agora_pruebas;


GO
-- 1) Tabla principal: datos de conexión de la empresa
IF OBJECT_ID(N'dbo.conexion_agora', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.conexion_agora (
            id               INT            IDENTITY (1, 1) PRIMARY KEY,
            empresa          NVARCHAR (100) NOT NULL,
            ambiente         NVARCHAR (30)  DEFAULT 'pruebas' NOT NULL,
            base_datos       NVARCHAR (128) NOT NULL,
            ip               VARCHAR (45)   NOT NULL,
            puerto           INT            NOT NULL CHECK (puerto BETWEEN 1 AND 65535),
            protocolo        NVARCHAR (50)  NOT NULL,
            firewall_entrada BIT            NOT NULL,
            firewall_salida  BIT            NOT NULL,
            usuario_consulta NVARCHAR (128) NOT NULL,
            notas            NVARCHAR (400) NULL,
            CONSTRAINT UQ_conexion_empresa_ambiente UNIQUE (empresa, ambiente)
        );
    END


GO
-- 2) Fila de Ágora (solo se inserta si todavía no existe)
IF NOT EXISTS (SELECT 1
               FROM   dbo.conexion_agora
               WHERE  empresa = N'Ágora'
                      AND ambiente = 'pruebas')
    BEGIN
        INSERT  INTO dbo.conexion_agora (
            empresa,
            ambiente,
            base_datos,
            ip,
            puerto,
            protocolo,
            firewall_entrada,
            firewall_salida,
            usuario_consulta,
            notas
        )
        VALUES                          (N'Ágora', 'pruebas', 'agora_pruebas', '192.168.1.67', 1433, 'SQL Server', 1, 1, 'agora_consulta', N'IP de ejemplo: se reemplaza con 04_actualizar_ip.sql');
    END


GO
-- 3) Tabla de personas con acceso
IF OBJECT_ID(N'dbo.accesos', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.accesos (
            id         INT            IDENTITY (1, 1) PRIMARY KEY,
            persona    NVARCHAR (100) NOT NULL UNIQUE,
            usuario_db NVARCHAR (128) NOT NULL,
            ip_origen  VARCHAR (45)   NOT NULL,
            activo     BIT            DEFAULT 1 NOT NULL
        );
    END


GO
-- 4) Personas (solo se insertan las que todavía no existen)
INSERT INTO dbo.accesos (
    persona,
    usuario_db,
    ip_origen
)
SELECT v.persona,
       v.usuario_db,
       v.ip_origen
FROM   (VALUES (N'Emilio', N'Emilio', '127.0.0.1'), (N'ConPrueba', N'ConPrueba', '192.168.1.73')) AS v(persona, usuario_db, ip_origen)
WHERE  NOT EXISTS (SELECT 1
                   FROM   dbo.accesos AS a
                   WHERE  a.persona = v.persona);


GO
-- 5) Ver el resultado
SELECT *
FROM   dbo.conexion_agora;

SELECT *
FROM   dbo.accesos;