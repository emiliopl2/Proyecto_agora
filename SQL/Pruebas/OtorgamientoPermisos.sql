USE agora_pruebas;
GO

USE agora_pruebas;
GO

-- 1. Otorgar permisos completos (SELECT, INSERT, UPDATE, DELETE) 
-- usando el nombre correcto del rol: [lector_agora] (con guion bajo)

GRANT SELECT ON OBJECT::dbo.Usuarios TO [lector_agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.Donantes TO [lector_agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.Donaciones TO [lector_agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.ExpedienteInstitucional TO [lector_agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.Convocatorias TO [lector_agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.EmpresasProspectos TO [lector_agora];
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.BitacoraEmpresas TO [lector_agora];


-- =====================================================
-- 2. PRUEBA DE VERIFICACIÓN (Impersonación)
-- =====================================================
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