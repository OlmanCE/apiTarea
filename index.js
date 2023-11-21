const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tecsistema',
    password: 'nueva',
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
app.delete('/productos/delete/:id', async (req, res) => {
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
app.get('/productos/obtener', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Producto');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los productos', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Ruta para obtener un producto por su Id
app.get('/productos/by/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const result = await pool.query('SELECT * FROM Producto WHERE Id = $1', [productId]);
        const producto = result.rows[0];

        if (!producto) {
            return res.status(404).json({ error: `No se encontró ningún producto con el ID ${productId}` });
        }

        res.json(producto);
    } catch (error) {
        console.error('Error al obtener el producto', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});
// Ruta para obtener los nombres de los productos
app.get('/productos/nombres', async (req, res) => {
    try {
        const result = await pool.query('SELECT nombre FROM Producto');
        const nombres = result.rows.map(producto => producto.nombre);
        res.json(nombres);
    } catch (error) {
        console.error('Error al obtener los nombres de los productos', error);
        res.status(500).json({ error: 'Error al obtener los nombres de los productos' });
    }
});

// Ruta para obtener las descripciones de un producto
app.get('/productos/descripciones', async (req, res) => {
    try {
        const result = await pool.query('SELECT descripcion FROM Producto');
        const descripciones = result.rows.map(producto => producto.descripcion);
        res.json(descripciones);
    } catch (error) {
        console.error('Error al obtener las descripciones de los productos', error);
        res.status(500).json({ error: 'Error al obtener las descripciones de los productos' });
    }
});

// Ruta para filtrar productos por nombre y descripcion
app.get('/productos/filtrar', async (req, res) => {
    try {
        const { nombre, descripcion } = req.query;

        // Construir la consulta SQL con los parámetros recibidos
        const query = `
            SELECT *
            FROM Producto
            WHERE nombre = $1
            AND descripcion = $2
        `;

        const result = await pool.query(query, [nombre, descripcion]);
        const productos = result.rows;
        console.log("mostar productos filtrar", productos);
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener los productos desde la base de datos', error);
        res.status(500).json({ error: 'Error al obtener los productos desde la base de datos' });
    }
});


//-----------------RUTAS DE FACTURAS-----------------//
// Ruta para crear Factura
app.post('/facturas', async (req, res) => {
    const { fecha, total, cliente, estado} = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO Factura (Fecha, Total, Cliente, Estado) VALUES ($1, $2, $3, $4) RETURNING *',
            [fecha, total, cliente, estado]
        );
        res.json({ message: 'Factura creada con éxito', factura: result.rows[0] });
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
app.get('/facturas/obtener', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, TO_CHAR(fecha, \'YYYY-MM-DD\') as fecha, total, cliente, estado FROM Factura');

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener las facturas', error);
        res.status(500).json({ error: 'Error al obtener las facturas' });
    }
});



// Ruta para actualizar una factura por ID
app.put('/facturas/update/:id', async (req, res) => {
  const { id } = req.params;
  const nuevaFactura = req.body;
  
  try {
    // Verificar si la factura con el ID proporcionado existe
    const facturaExistente = await pool.query('SELECT * FROM Factura WHERE id = $1', [id]);

    if (facturaExistente.rows.length === 0) {
      return res.status(404).json({ error: `No se encontró ninguna factura con el ID ${id}` });
    }
    // Realizar la actualización de la factura
    await pool.query(
      'UPDATE Factura SET fecha = $1, total = $2, cliente = $3, estado = $4 WHERE id = $5',
      [nuevaFactura.fecha, nuevaFactura.total, nuevaFactura.cliente, nuevaFactura.estado, id]
    );

    res.status(200).json({ message: `Factura con ID ${id} actualizada correctamente` });
  } catch (error) {
    console.error('Error al actualizar la factura:', error);
    res.status(500).json({ error: 'Error al actualizar la factura' });
  }
});


// Ruta para obtener facturas por fecha y estado desde la base de datos
app.get('/facturas/filtrar', async (req, res) => {
    try {
      const { fecha, estado } = req.query;
  
      // Construir la consulta SQL con los parámetros recibidos
      const query = `
        SELECT id, TO_CHAR(COALESCE(fecha, CURRENT_DATE), 'YYYY-MM-DD') as fecha, total, cliente, estado
        FROM Factura
        WHERE TO_CHAR(COALESCE(fecha, CURRENT_DATE), 'YYYY-MM-DD') = $1
        AND estado = $2
      `;
  
      const result = await pool.query(query, [fecha, estado]);
      const facturas = result.rows;
  
      res.json(facturas);
    } catch (error) {
      console.error('Error al obtener las facturas desde la base de datos', error);
      res.status(500).json({ error: 'Error al obtener las facturas desde la base de datos' });
    }
  });
  
    // Ruta para obtener las fechas desde la base de datos
    app.get('/facturas/fechas', async (req, res) => {
        try {
        const result = await pool.query('SELECT TO_CHAR(COALESCE(fecha, CURRENT_DATE), \'YYYY-MM-DD\') as fecha FROM Factura');
        const fechas = result.rows.map(factura => factura.fecha);
        res.json(fechas);
        } catch (error) {
        console.error('Error al obtener las fechas desde la base de datos', error);
        res.status(500).json({ error: 'Error al obtener las fechas desde la base de datos' });
        }
    });
    
  
    // Ruta para obtener los estados desde la base de datos
    app.get('/facturas/estados', async (req, res) => {
        try {
        const result = await pool.query('SELECT estado FROM Factura');
        const estados = result.rows.map(factura => factura.estado);
        res.json(estados);
        } catch (error) {
        console.error('Error al obtener los estados desde la base de datos', error);
        res.status(500).json({ error: 'Error al obtener los estados desde la base de datos' });
        }
    });
    
    // Ruta para obtener factura por id desde la base de datos
    app.get('/facturas/by/:id', async (req, res) => {
        try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, TO_CHAR(COALESCE(fecha, CURRENT_DATE), \'YYYY-MM-DD\') as fecha, total, cliente, estado FROM Factura WHERE id = $1', [id]);
        const factura = result.rows[0];
    
        if (!factura) {
            return res.status(404).json({ error: `No se encontró ninguna factura con el ID ${id}` });
        }
    
        res.json(factura);
        } catch (error) {
        console.error('Error al obtener la factura desde la base de datos', error);
        res.status(500).json({ error: 'Error al obtener la factura desde la base de datos' });
        }
    });
    
//-----------------Conexion-----------------//
const port = 5000; // Puedes cambiar el puerto según tus preferencias
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
