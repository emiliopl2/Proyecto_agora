-- =====================================================
-- 03_logins_usuarios_y_permisos.sql
-- Configuración de seguridad para 'emilio' y 'ConPrueba'
-- =====================================================

-- 1) CREACIÓN DE LOGINS (Nivel Servidor)
USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'Emilio')
    CREATE LOGIN [emilio]
        WITH PASSWORD = N'1212', 
             DEFAULT_DATABASE = [agora_pruebas], 
             CHECK_POLICY = ON, 
             CHECK_EXPIRATION = OFF;

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'ConPrueba')
    CREATE LOGIN [ConPrueba]
        WITH PASSWORD = N'1212', 
             DEFAULT_DATABASE = [agora_pruebas], 
             CHECK_POLICY = ON, 
             CHECK_EXPIRATION = OFF;
GO

-- 2) CREACIÓN DE ROLES, USUARIOS Y PERMISOS (Nivel Base de Datos)
USE agora_pruebas;
GO

-- Crear rol de lectura si no existe
IF DATABASE_PRINCIPAL_ID('lector_agora') IS NULL
    CREATE ROLE [lector_agora];

-- Asignar permiso SELECt, UPDATE, DELETE sobre las tablas requeridas
GRANT SELECT ON OBJECT::dbo.conexion_agora TO [lector_agora];
GRANT SELECT ON OBJECT::dbo.accesos TO [lector_agora];
GRANT SELECT ON OBJECT::dbo.Usuarios TO [lector agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.Donantes TO [lector_agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.Donaciones TO [lector_agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.ExpedienteInstitucional TO [lector_agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.Convocatorias TO [lector_agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.EmpresasProspectos TO [lector_agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.BitacoraEmpresas TO [lector_agora];
GO

GO

-- Crear Usuarios de Base de Datos asociados a los Logins
IF DATABASE_PRINCIPAL_ID('Emilio') IS NULL
    CREATE USER [emilio] FOR LOGIN [emilio];

IF DATABASE_PRINCIPAL_ID('ConPrueba') IS NULL
    CREATE USER [ConPrueba] FOR LOGIN [ConPrueba];
GO

-- Asignar usuarios al rol de lectura
ALTER ROLE [lector_agora] ADD MEMBER [emilio];
ALTER ROLE [lector_agora] ADD MEMBER [ConPrueba];
GO

-- 3) PRUEBA DE SEGURIDAD E IMPERSONACIÓN
USE agora_pruebas;
GO

-- Simular el inicio de sesión de ConPrueba
EXECUTE AS LOGIN = 'ConPrueba';

-- Confirmar identidad activa
SELECT SUSER_NAME() AS usuario_actual;

-- Consultas SELECT (Ahora sí deben funcionar correctamente)
SELECT TOP 5 NombreCompleto, Correo, Rol FROM dbo.Usuarios;
SELECT TOP 5 Nombre, Apellido, Correo, NivelContribuyente FROM dbo.Donantes;
SELECT TOP 5 DonacionID, Monto, EstadoProceso FROM dbo.Donaciones;

-- Regresar al contexto del usuario administrador
REVERT;
GO