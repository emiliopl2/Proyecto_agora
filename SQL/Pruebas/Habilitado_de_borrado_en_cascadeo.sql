-- 1. Eliminar la restricción actual
ALTER TABLE dbo.Donaciones
DROP CONSTRAINT FK_Donaciones_Donantes;

-- 2. Volver a crearla con borrado en cascada
ALTER TABLE dbo.Donaciones
ADD CONSTRAINT FK_Donaciones_Donantes
FOREIGN KEY (DonanteID) REFERENCES dbo.Donantes(DonanteID)
ON DELETE CASCADE;

-- 3. Eliminar la restricción actual de la bitácora
ALTER TABLE dbo.BitacoraEmpresas
DROP CONSTRAINT FK_Bitacora_Empresas;

-- 4. Volver a crearla permitiendo borrado en cascada
ALTER TABLE dbo.BitacoraEmpresas
ADD CONSTRAINT FK_Bitacora_Empresas
FOREIGN KEY (EmpresaID) REFERENCES dbo.EmpresasProspectos(EmpresaID)
ON DELETE CASCADE;