const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 5000; // Puedes cambiar el puerto según tus preferencias
app.use(bodyParser.json());
// Configuración de la conexión a la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tecsistema',
    password: 'escriba su contra',
    port: 5432,
});



//-----------------RUTAS DE PRODUCTOS--------------------------------------------------------------//
// Ruta para crear un nuevo producto
app.post('/productos', async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { Nombre, Descripcion, Precio, Stock } = req.body;

    if (!Nombre || !Precio || !Stock) {
        return res.status(400).json({ error: 'Por favor, proporciona todos los campos necesarios.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO Producto (Nombre, Descripcion, Precio, Stock) VALUES ($1, $2, $3, $4) RETURNING *',
            [Nombre, Descripcion, Precio, Stock]
        );
        res.json({ message: 'Producto creado con éxito', producto: result.rows[0] });
    } catch (error) {
        console.error('Error al crear un nuevo producto', error);
        res.status(500).json({ error: 'Error al crear un nuevo producto' });
    }
});


// Ruta para eliminar un producto por su Id
app.delete('/productos/:id', async (req, res) => {
    const productId = req.params.id;

    if (!productId) {
        return res.status(400).json({ error: 'Por favor, proporciona el Id del producto a eliminar.' });
    }

    try {
        const result = await pool.query('DELETE FROM Producto WHERE Id = $1 RETURNING *', [productId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró un producto con el Id proporcionado.' });
        }

        res.json({ message: 'Producto eliminado con éxito', producto: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar el producto', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});


// Ruta para obtener todos los productos

app.get('/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Producto');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los productos', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});


//-----------------RUTAS DE FACTURAS-----------------//
// Ruta para crear Factura
// Ruta para crear una nueva factura, su asume que ya hay un producto al menos
app.post('/facturas', async (req, res) => {
    const { fecha, total, cliente, estado, productoId } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO Factura (Fecha, Total, Cliente, Estado, ProductoId) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [fecha, total, cliente, estado, productoId]
        );
        res.json({ message: 'Factura creada con éxito', factura: result.rows[0] });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear la factura', error);
        res.status(500).json({ error: 'Error al crear la factura' });
    }
});


// Ruta para eliminar una factura por su Id
app.delete('/facturas/:id', async (req, res) => {
    const facturaId = req.params.id;

    if (!facturaId) {
        return res.status(400).json({ error: 'Por favor, proporciona el Id de la factura a eliminar.' });
    }

    try {
        const result = await pool.query('DELETE FROM Factura WHERE Id = $1 RETURNING *', [facturaId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró una factura con el Id proporcionado.' });
        }

        res.json({ message: 'Factura eliminada con éxito', factura: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar la factura', error);
        res.status(500).json({ error: 'Error al eliminar la factura' });
    }
});

// Ruta para obtener todas las facturas
app.get('/facturas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Factura');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener las facturas', error);
        res.status(500).json({ error: 'Error al obtener las facturas' });
    }
});

//-----------------Conexion-----------------//
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
