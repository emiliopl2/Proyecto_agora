USE agora_pruebas;


GO
UPDATE dbo.conexion_agora
SET    ip = '192.168.1.67'
WHERE  empresa = N'Ágora'
       AND ambiente = 'pruebas';
