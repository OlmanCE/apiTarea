CREATE DATABASE tecsistema;
-- tabla Producto
CREATE TABLE Producto (
    Id SERIAL PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    Descripcion TEXT,
    Precio DECIMAL(10, 2) NOT NULL,
    Stock INT NOT NULL
);

-- Factura
CREATE TABLE Factura (
    Id SERIAL PRIMARY KEY,
    Fecha DATE NOT NULL,
    Total DECIMAL(10, 2) NOT NULL,
    Cliente VARCHAR(255) NOT NULL,
    Estado VARCHAR(50) NOT NULL

);
    --ProductoId INT REFERENCES Producto(Id) ON DELETE CASCADE