-- =====================================================
-- Proyecto Ágora - Oracle Database 21c (SQL Developer)
-- Ejecutar como script (F5), no con Ctrl+Enter.
-- Conéctate al esquema donde quieras crear las tablas.
-- =====================================================

-- (Opcional) Crear un esquema propio. Requiere un usuario DBA y estar
-- conectado a un PDB (por ejemplo XEPDB1), no al CDB raíz.
-- CREATE USER agora_gestion IDENTIFIED BY "CambiaEstaClave1"
--     DEFAULT TABLESPACE users QUOTA UNLIMITED ON users;
-- GRANT CREATE SESSION, CREATE TABLE TO agora_gestion;

USE agora_pruebas;
GO

-- =====================================================
-- CREACIÓN DE TABLAS
-- =====================================================

CREATE TABLE Usuarios (
    UsuarioID     INT IDENTITY(1,1) NOT NULL,
    NombreCompleto VARCHAR(150)     NOT NULL,
    Correo        VARCHAR(100)      NOT NULL,
    PasswordHash  VARCHAR(255)      NOT NULL,
    Rol           VARCHAR(50)       NOT NULL, -- Ej: 'Administracion', 'Contabilidad', 'Vinculacion', 'Direccion'
    Activo        TINYINT           DEFAULT 1 NOT NULL,
    FechaCreacion DATETIME2         DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Usuarios PRIMARY KEY (UsuarioID),
    CONSTRAINT UQ_Usuarios_Correo UNIQUE (Correo),
    CONSTRAINT CK_Usuarios_Activo CHECK (Activo IN (0, 1))
);

CREATE TABLE Donantes (
    DonanteID          INT IDENTITY(1,1) NOT NULL,
    Nombre             VARCHAR(100)      NOT NULL,
    Apellido           VARCHAR(100)      NOT NULL,
    Correo             VARCHAR(100)      NOT NULL,
    Telefono           VARCHAR(20),
    NivelContribuyente VARCHAR(20)       DEFAULT 'Semilla' NOT NULL, -- 'Semilla', 'Maceta', 'Árbol'
    RazonSocial        VARCHAR(150),
    RFC                VARCHAR(20),
    RegimenFiscal      VARCHAR(10),
    CodigoPostal       VARCHAR(10),
    UsoCFDI            VARCHAR(10),
    FechaRegistro      DATETIME2         DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Donantes PRIMARY KEY (DonanteID),
    CONSTRAINT UQ_Donantes_Correo UNIQUE (Correo),
    CONSTRAINT CK_Donantes_Nivel CHECK (NivelContribuyente IN ('Semilla', 'Maceta', 'Árbol'))
);

CREATE TABLE Donaciones (
    DonacionID     INT IDENTITY(1,1) NOT NULL,
    DonanteID      INT               NOT NULL,
    Monto          DECIMAL(10,2)     NOT NULL,
    EstadoProceso  VARCHAR(50)       NOT NULL,
    Canal          VARCHAR(30)       NOT NULL, -- 'WhatsApp', 'Correo', 'PayPal', 'Transferencia'
    RequiereRecibo TINYINT           DEFAULT 1 NOT NULL,
    ReciboEmitido  TINYINT           DEFAULT 0 NOT NULL,
    FechaDonacion  DATETIME2         DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Donaciones PRIMARY KEY (DonacionID),
    CONSTRAINT FK_Donaciones_Donantes FOREIGN KEY (DonanteID) REFERENCES Donantes (DonanteID),
    CONSTRAINT CK_Donaciones_Monto   CHECK (Monto > 0),
    CONSTRAINT CK_Donaciones_ReqRec CHECK (RequiereRecibo IN (0, 1)),
    CONSTRAINT CK_Donaciones_Recibo CHECK (ReciboEmitido IN (0, 1)),
    CONSTRAINT CK_Donaciones_Estado CHECK (EstadoProceso IN
        ('InteresRecibido', 'SolicitarDatos', 'TransferenciaEnviada', 'ValidarDonativo',
         'ReciboEmitido', 'Concluido', 'Inconsistencia')),
    CONSTRAINT CK_Donaciones_Canal  CHECK (Canal IN ('WhatsApp', 'Correo', 'PayPal', 'Transferencia'))
);

CREATE TABLE ExpedienteInstitucional (
    DocumentoID     INT IDENTITY(1,1) NOT NULL,
    NombreDocumento VARCHAR(150)      NOT NULL,
    TipoDocumento   VARCHAR(50)       NOT NULL,
    RutaArchivo     VARCHAR(255)      NOT NULL,
    FechaVencimiento DATE,
    Estatus         VARCHAR(30)       DEFAULT 'Vigente' NOT NULL,
    CONSTRAINT PK_Expediente PRIMARY KEY (DocumentoID),
    CONSTRAINT CK_Expediente_Tipo CHECK (TipoDocumento IN
        ('Acta Constitutiva', 'Constancia Fiscal', 'OpinionCumplimiento', 'Informe Anual')),
    CONSTRAINT CK_Expediente_Estatus CHECK (Estatus IN ('Vigente', 'PorRenovar', 'Vencido'))
);

CREATE TABLE Convocatorias (
    ConvocatoriaID    INT IDENTITY(1,1) NOT NULL,
    NombreFondo       VARCHAR(150)      NOT NULL,
    EntidadFinanciera VARCHAR(150)      NOT NULL,
    Estado            VARCHAR(50)       NOT NULL,
    FechaCierre       DATE,
    AprobadaDireccion TINYINT           DEFAULT 0 NOT NULL,
    Observaciones     VARCHAR(MAX),
    FechaRegistro     DATETIME2         DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Convocatorias PRIMARY KEY (ConvocatoriaID),
    CONSTRAINT CK_Convocatorias_Aprob CHECK (AprobadaDireccion IN (0, 1)),
    CONSTRAINT CK_Convocatorias_Estado CHECK (Estado IN
        ('Mapeada', 'ValidarRequisitos', 'CompilarExpediente', 'Postulada', 'EnEspera', 'Descartada'))
);

CREATE TABLE EmpresasProspectos (
    EmpresaID       INT IDENTITY(1,1) NOT NULL,
    NombreEmpresa   VARCHAR(150)      NOT NULL,
    TipoAlianza     VARCHAR(50)       NOT NULL,
    AlineacionEtica TINYINT           DEFAULT 1 NOT NULL,
    Estatus         VARCHAR(50)       NOT NULL,
    EnlaceContacto  VARCHAR(150),
    FechaRegistro   DATETIME2         DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Empresas PRIMARY KEY (EmpresaID),
    CONSTRAINT CK_Empresas_Etica CHECK (AlineacionEtica IN (0, 1)),
    CONSTRAINT CK_Empresas_Tipo CHECK (TipoAlianza IN ('Redondeo', 'Bosque Corporativo', 'Financiamiento')),
    CONSTRAINT CK_Empresas_Estatus CHECK (Estatus IN
        ('SinContacto', 'CumplenCriterios', 'Contactadas', 'Aceptaron', 'PostulacionEnviada', 'Descartada'))
);

CREATE TABLE BitacoraEmpresas (
    BitacoraID         INT IDENTITY(1,1) NOT NULL,
    EmpresaID          INT               NOT NULL,
    UsuarioID          INT               NOT NULL,
    Canal              VARCHAR(30)       NOT NULL, -- 'LinkedIn', 'Correo', 'Reunion', 'Telefono'
    DetalleInteraccion VARCHAR(MAX)      NOT NULL,
    FechaInteraccion   DATETIME2         DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Bitacora PRIMARY KEY (BitacoraID),
    CONSTRAINT FK_Bitacora_Empresas FOREIGN KEY (EmpresaID) REFERENCES EmpresasProspectos (EmpresaID),
    CONSTRAINT FK_Bitacora_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios (UsuarioID),
    CONSTRAINT CK_Bitacora_Canal CHECK (Canal IN ('LinkedIn', 'Correo', 'Reunion', 'Telefono'))
);
GO

-- =====================================================
-- PARTE 1: DATOS DE EJEMPLO
-- =====================================================

-- Usuarios
INSERT INTO Usuarios (NombreCompleto, Correo, PasswordHash, Rol, Activo)
VALUES ('Emilio', 'emilio@agora.org', 'admin123', 'Administracion', 1);
INSERT INTO Usuarios (NombreCompleto, Correo, PasswordHash, Rol, Activo)
VALUES ('AgoraAdmin', 'admin@agora.org', 'admin123', 'Contabilidad', 1);

-- Donantes
INSERT INTO Donantes (Nombre, Apellido, Correo, Telefono, NivelContribuyente)
VALUES ('Ana', 'López', 'ana@correo.com', '5551110001', 'Semilla');
INSERT INTO Donantes (Nombre, Apellido, Correo, Telefono, NivelContribuyente)
VALUES ('Luis', 'Pérez', 'luis@correo.com', '5551110002', 'Maceta');
INSERT INTO Donantes (Nombre, Apellido, Correo, Telefono, NivelContribuyente,
                      RazonSocial, RFC, RegimenFiscal, CodigoPostal, UsoCFDI)
VALUES ('María', 'Gómez', 'maria@correo.com', '5551110003', 'Semilla',
        'María Gómez Díaz', 'GODM800101AB1', '612', '06600', 'G03');

-- Donaciones
INSERT INTO Donaciones (DonanteID, Monto, EstadoProceso, Canal, RequiereRecibo, ReciboEmitido)
VALUES ((SELECT DonanteID FROM Donantes WHERE Correo = 'ana@correo.com'), 25.00, 'Concluido', 'PayPal', 0, 0);
INSERT INTO Donaciones (DonanteID, Monto, EstadoProceso, Canal, RequiereRecibo, ReciboEmitido)
VALUES ((SELECT DonanteID FROM Donantes WHERE Correo = 'ana@correo.com'), 30.00, 'InteresRecibido', 'Correo', 1, 0);
INSERT INTO Donaciones (DonanteID, Monto, EstadoProceso, Canal, RequiereRecibo, ReciboEmitido)
VALUES ((SELECT DonanteID FROM Donantes WHERE Correo = 'luis@correo.com'), 75.50, 'ValidarDonativo', 'Transferencia', 1, 0);
INSERT INTO Donaciones (DonanteID, Monto, EstadoProceso, Canal, RequiereRecibo, ReciboEmitido)
VALUES ((SELECT DonanteID FROM Donantes WHERE Correo = 'maria@correo.com'), 150.00, 'ReciboEmitido', 'Transferencia', 1, 1);
INSERT INTO Donaciones (DonanteID, Monto, EstadoProceso, Canal, RequiereRecibo, ReciboEmitido)
VALUES ((SELECT DonanteID FROM Donantes WHERE Correo = 'maria@correo.com'), 120.00, 'SolicitarDatos', 'WhatsApp', 1, 0);

-- Expediente institucional
INSERT INTO ExpedienteInstitucional (NombreDocumento, TipoDocumento, RutaArchivo, FechaVencimiento, Estatus)
VALUES ('Acta constitutiva 2020', 'Acta Constitutiva', '/docs/acta_2020.pdf', NULL, 'Vigente');
INSERT INTO ExpedienteInstitucional (NombreDocumento, TipoDocumento, RutaArchivo, FechaVencimiento, Estatus)
VALUES ('Constancia de situación fiscal', 'Constancia Fiscal', '/docs/csf.pdf', DATEADD(DAY, 20, GETDATE()), 'PorRenovar');
INSERT INTO ExpedienteInstitucional (NombreDocumento, TipoDocumento, RutaArchivo, FechaVencimiento, Estatus)
VALUES ('Opinión de cumplimiento SAT', 'OpinionCumplimiento', '/docs/opinion_sat.pdf', DATEADD(DAY, -10, GETDATE()), 'Vencido');
INSERT INTO ExpedienteInstitucional (NombreDocumento, TipoDocumento, RutaArchivo, FechaVencimiento, Estatus)
VALUES ('Informe anual 2025', 'Informe Anual', '/docs/informe_2025.pdf', DATEADD(DAY, 300, GETDATE()), 'Vigente');

-- Convocatorias
INSERT INTO Convocatorias (NombreFondo, EntidadFinanciera, Estado, FechaCierre, AprobadaDireccion, Observaciones)
VALUES ('Fondo Verde Comunitario', 'Fundación Bosques', 'ValidarRequisitos', DATEADD(DAY, 25, GETDATE()), 1, 'Falta carta de intención firmada por la dirección.');
INSERT INTO Convocatorias (NombreFondo, EntidadFinanciera, Estado, FechaCierre, AprobadaDireccion, Observaciones)
VALUES ('Reforestación Urbana', 'Gobierno de la Ciudad', 'CompilarExpediente', DATEADD(DAY, 10, GETDATE()), 1, 'Reunir opinión de cumplimiento vigente.');
INSERT INTO Convocatorias (NombreFondo, EntidadFinanciera, Estado, FechaCierre, AprobadaDireccion, Observaciones)
VALUES ('Impacto Social 2026', 'Banco Aliado', 'Postulada', DATEADD(DAY, -5, GETDATE()), 1, 'Postulación enviada, en espera de resultados.');
INSERT INTO Convocatorias (NombreFondo, EntidadFinanciera, Estado, FechaCierre, AprobadaDireccion, Observaciones)
VALUES ('Fondo Internacional X', 'Fundación Extranjera', 'Descartada', DATEADD(DAY, 60, GETDATE()), 0, 'No cumple requisitos geográficos.');

-- Empresas prospectos
INSERT INTO EmpresasProspectos (NombreEmpresa, TipoAlianza, AlineacionEtica, Estatus, EnlaceContacto)
VALUES ('EcoVerde S.A.', 'Bosque Corporativo', 1, 'Contactadas', 'rse@ecoverde.com');
INSERT INTO EmpresasProspectos (NombreEmpresa, TipoAlianza, AlineacionEtica, Estatus, EnlaceContacto)
VALUES ('SuperMercados Sol', 'Redondeo', 1, 'Aceptaron', 'Directora RSE - Ana Torres');
INSERT INTO EmpresasProspectos (NombreEmpresa, TipoAlianza, AlineacionEtica, Estatus, EnlaceContacto)
VALUES ('PetroNorte', 'Financiamiento', 0, 'Descartada', NULL);
INSERT INTO EmpresasProspectos (NombreEmpresa, TipoAlianza, AlineacionEtica, Estatus, EnlaceContacto)
VALUES ('Viveros MX', 'Financiamiento', 1, 'SinContacto', 'contacto@viverosmx.com');

-- Bitácora de interacciones
INSERT INTO BitacoraEmpresas (EmpresaID, UsuarioID, Canal, DetalleInteraccion)
VALUES ((SELECT EmpresaID FROM EmpresasProspectos WHERE NombreEmpresa = 'EcoVerde S.A.'),
        (SELECT UsuarioID FROM Usuarios WHERE Correo = 'emilio@agora.org'),
        'LinkedIn', 'Primer mensaje enviado al directivo de RSE.');
INSERT INTO BitacoraEmpresas (EmpresaID, UsuarioID, Canal, DetalleInteraccion)
VALUES ((SELECT EmpresaID FROM EmpresasProspectos WHERE NombreEmpresa = 'EcoVerde S.A.'),
        (SELECT UsuarioID FROM Usuarios WHERE Correo = 'emilio@agora.org'),
        'Reunion', 'Reunión virtual para presentar el programa Bosque Corporativo.');
INSERT INTO BitacoraEmpresas (EmpresaID, UsuarioID, Canal, DetalleInteraccion)
VALUES ((SELECT EmpresaID FROM EmpresasProspectos WHERE NombreEmpresa = 'SuperMercados Sol'),
        (SELECT UsuarioID FROM Usuarios WHERE Correo = 'admin@agora.org'),
        'Correo', 'Aceptaron la propuesta de redondeo en caja.');
GO

-- =====================================================
-- PARTE 2: CONSULTAS CORREGIDAS PARA SQL SERVER
-- =====================================================

-- 1.1 Resumen de usuarios por rol
SELECT Rol,
       COUNT(*)          AS total_usuarios,
       SUM(CAST(Activo AS INT)) AS activos
FROM   Usuarios
GROUP  BY Rol
ORDER  BY total_usuarios DESC;

-- 1.2 Interacciones registradas por cada usuario en la bitácora
SELECT u.NombreCompleto,
       u.Rol,
       COUNT(b.BitacoraID) AS interacciones
FROM   Usuarios u
LEFT JOIN BitacoraEmpresas b ON b.UsuarioID = u.UsuarioID
GROUP  BY u.UsuarioID, u.NombreCompleto, u.Rol
ORDER  BY interacciones DESC;

-- 2.1 Total donado por donante y nivel sugerido
SELECT d.Nombre + ' ' + d.Apellido AS donante,
       d.NivelContribuyente          AS nivel_actual,
       ISNULL(SUM(dn.Monto), 0)      AS total_donado,
       CASE
           WHEN ISNULL(SUM(dn.Monto), 0) < 50  THEN 'Semilla'
           WHEN ISNULL(SUM(dn.Monto), 0) < 100 THEN 'Maceta'
           ELSE 'Árbol'
       END                           AS nivel_sugerido
FROM   Donantes d
LEFT JOIN Donaciones dn
       ON dn.DonanteID = d.DonanteID
      AND dn.EstadoProceso <> 'Inconsistencia'
GROUP  BY d.DonanteID, d.Nombre, d.Apellido, d.NivelContribuyente
ORDER  BY total_donado DESC;

-- 2.2 Donaciones que requieren recibo y aún no se emite
SELECT dn.DonacionID,
       d.Nombre + ' ' + d.Apellido             AS donante,
       d.RFC,
       dn.Monto,
       dn.EstadoProceso,
       CONVERT(VARCHAR, dn.FechaDonacion, 103) AS fecha
FROM   Donaciones dn
JOIN   Donantes d ON d.DonanteID = dn.DonanteID
WHERE  dn.RequiereRecibo = 1
  AND  dn.ReciboEmitido  = 0
  AND  dn.EstadoProceso <> 'Inconsistencia'
ORDER  BY dn.FechaDonacion;

-- 3.1 Documentos vencidos o que vencen en los próximos 30 días
SELECT NombreDocumento,
       TipoDocumento,
       CONVERT(VARCHAR, FechaVencimiento, 103) AS vence,
       DATEDIFF(DAY, GETDATE(), FechaVencimiento) AS dias_restantes
FROM   ExpedienteInstitucional
WHERE  FechaVencimiento IS NOT NULL
  AND  FechaVencimiento <= DATEADD(DAY, 30, GETDATE())
ORDER  BY FechaVencimiento;

-- 3.2 Cantidad de documentos por estatus
SELECT Estatus,
       COUNT(*) AS total_documentos
FROM   ExpedienteInstitucional
GROUP  BY Estatus
ORDER  BY total_documentos DESC;

-- 4.1 Convocatorias abiertas ordenadas por cierre más próximo
SELECT NombreFondo,
       EntidadFinanciera,
       Estado,
       CONVERT(VARCHAR, FechaCierre, 103)              AS cierre,
       DATEDIFF(DAY, CAST(GETDATE() AS DATE), FechaCierre) AS dias_para_cierre,
       CASE AprobadaDireccion WHEN 1 THEN 'Sí' ELSE 'No' END AS aprobada_direccion,
       LEFT(Observaciones, 100)                        AS observaciones
FROM   Convocatorias
WHERE  Estado NOT IN ('Descartada', 'Postulada')
  AND  FechaCierre >= CAST(GETDATE() AS DATE)
ORDER  BY FechaCierre;

-- 4.2 Resumen por estado
SELECT Estado,
       COUNT(*)                     AS total,
       SUM(CAST(AprobadaDireccion AS INT)) AS aprobadas_direccion
FROM   Convocatorias
GROUP  BY Estado
ORDER  BY total DESC;

-- 5.1 Empresas alineadas éticamente
SELECT e.NombreEmpresa,
       e.TipoAlianza,
       e.Estatus,
       COUNT(b.BitacoraID)                                AS interacciones,
       CONVERT(VARCHAR, MAX(b.FechaInteraccion), 103)    AS ultima_interaccion
FROM   EmpresasProspectos e
LEFT JOIN BitacoraEmpresas b ON b.EmpresaID = e.EmpresaID
WHERE  e.AlineacionEtica = 1
GROUP  BY e.EmpresaID, e.NombreEmpresa, e.TipoAlianza, e.Estatus
ORDER  BY MAX(b.FechaInteraccion) DESC;

-- 5.2 Últimas 10 interacciones con empresas
SELECT TOP 10
       CONVERT(VARCHAR, b.FechaInteraccion, 103) + ' ' + CONVERT(VARCHAR(5), b.FechaInteraccion, 108) AS fecha,
       e.NombreEmpresa,
       u.NombreCompleto                                  AS responsable,
       b.Canal,
       LEFT(b.DetalleInteraccion, 100)                   AS detalle
FROM   BitacoraEmpresas b
JOIN   EmpresasProspectos e ON e.EmpresaID = b.EmpresaID
JOIN   Usuarios u           ON u.UsuarioID = b.UsuarioID
ORDER  BY b.FechaInteraccion DESC;