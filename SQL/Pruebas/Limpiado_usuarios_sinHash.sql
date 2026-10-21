USE agora_pruebas;

-- 1. Eliminar los registros de la bitácora asociados a los usuarios 1 y 2
DELETE FROM dbo.BitacoraEmpresas 
WHERE UsuarioID IN (1, 2);

-- 2. Eliminar los usuarios
DELETE FROM dbo.Usuarios 
WHERE UsuarioID IN (1, 2);

DELETE FROM dbo.Usuarios 
WHERE PasswordHash NOT LIKE '$2b$%';

SELECT * FROM dbo.Usuarios;

