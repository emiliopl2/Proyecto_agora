USE agora_pruebas;
GO

-- Reemplaza '192.168.1.XX' por la IP de la nueva máquina cliente
UPDATE dbo.accesos
SET    ip_origen = '192.168.1.73' 
WHERE  persona = N'ConPrueba';
GO

-- Confirmar la actualización
SELECT id, persona, usuario_db, ip_origen, activo 
FROM dbo.accesos 
WHERE persona = N'ConPrueba';