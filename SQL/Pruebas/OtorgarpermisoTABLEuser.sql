USE agora_pruebas;
GO

-- Otorgar permiso SELECT sobre la tabla Usuarios al rol de lectura
GRANT SELECT ON OBJECT::dbo.Usuarios TO [lector_agora];
GO