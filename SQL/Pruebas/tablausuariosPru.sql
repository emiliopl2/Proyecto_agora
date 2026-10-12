USE agora_pruebas;
GO

CREATE TABLE dbo.usuarios (
    UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
    NombreCompleto VARCHAR(150) NOT NULL,
    Correo VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Rol VARCHAR(50) NOT NULL, -- Ej: 'Administracion', 'Contabilidad', 'Vinculacion', 'Direccion'
    Activo BIT DEFAULT 1,
    FechaCreacion DATETIME DEFAULT GETDATE()
);
GO

INSERT INTO dbo.usuarios (NombreCompleto, Correo, PasswordHash, Rol, Activo)
VALUES (N'adminagora', 'admin@agora.com', 'adminagora137', 'administracion', 1);
GO

SELECT * FROM dbo.usuarios;
