const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configurar middlewares
app.use(bodyParser.json());
app.use(cors());

// Crear o conectar la base de datos SQLite
const db = new sqlite3.Database('./tienda_ropa.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos.');
    }
});

// Crear tablas (si no existen)
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Clientes (
            Cliente_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Nombre TEXT NOT NULL,
            Direccion TEXT,
            Telefono TEXT
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Productos (
            Producto_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Nombre TEXT NOT NULL,
            Precio_Unitario REAL NOT NULL
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Ventas (
            Venta_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Cliente_ID INTEGER,
            Fecha_Venta DATE NOT NULL,
            FOREIGN KEY (Cliente_ID) REFERENCES Clientes(Cliente_ID)
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Detalles_Ventas (
            Detalle_Venta_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Venta_ID INTEGER,
            Producto_ID INTEGER,
            Cantidad INTEGER NOT NULL,
            FOREIGN KEY (Venta_ID) REFERENCES Ventas(Venta_ID),
            FOREIGN KEY (Producto_ID) REFERENCES Productos(Producto_ID)
        )
    `);
});

// Rutas de la API
// Obtener todos los clientes
app.get('/clientes', (req, res) => {
    db.all('SELECT * FROM Clientes', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Agregar un nuevo cliente
app.post('/clientes', (req, res) => {
    const { Nombre, Direccion, Telefono } = req.body;
    db.run(
        'INSERT INTO Clientes (Nombre, Direccion, Telefono) VALUES (?, ?, ?)',
        [Nombre, Direccion, Telefono],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ Cliente_ID: this.lastID });
            }
        }
    );
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
