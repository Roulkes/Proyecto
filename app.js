const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err.stack);
    res.status(500).send('Algo salió mal.');
});

// Configuración de vistas
app.set('views', path.join(__dirname, 'views'));

// Middleware para manejar datos de formularios
app.use(express.urlencoded({ extended: true }));

// Establecer el motor de plantillas EJS
app.set('view engine', 'ejs');

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Crear la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'roulkes',
    port: 3306
});

// Comprobar la conexión a la base de datos
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the MySQL database');
    }
});

// Iniciar el servidor
const port = 3009;
app.listen(port, () => {
    console.log(`Servidor en funcionamiento desde http://localhost:${port}`);
});

// Ruta para verificar la conexión a la base de datos
app.get('/check-db', (req, res) => {
    db.query('SELECT 1', (err) => {
        if (err) {
            console.error('Error de conexión a la base de datos:', err);
            res.send(`Error de conexión a la base de datos: ${err.message}`);
        } else {
            res.send('Conexión a la base de datos exitosa');
        }
    });
});

// Ruta principal para mostrar todos los usuarios
app.get('/', (req, res) => {
    const query = 'SELECT * FROM usuarios';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.send('Error');
        } else {
            res.render('index', { users: results });
        }
    });
});

// Ruta para agregar un nuevo usuario
app.post('/add', (req, res) => {
    const { name, fecha_nacimiento, sexo, edad, email, altura, peso, numero_cuenta } = req.body;

    if (!name || !fecha_nacimiento || !sexo || !edad || !email || !altura || !peso || !numero_cuenta) {
        return res.send('Todos los campos son requeridos.');
    }

    const query = 'INSERT INTO usuarios (name, fecha_nacimiento, sexo, edad, email, altura, peso, numero_cuenta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, fecha_nacimiento, sexo, edad, email, altura, peso, numero_cuenta], (err) => {
        if (err) {
            console.error('Error adding user:', err);
            res.send('Error al agregar el usuario');
        } else {
            res.redirect('/');
        }
    });
});

// Ruta para editar un usuario (GET)
app.get('/edit/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Intentando editar usuario con ID: ${id}`);
    const query = 'SELECT * FROM usuarios WHERE id = ?';

    db.query('SELECT 1', (err) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.send(`Error de conexión: ${err.message}`);
        } else {
            console.log('Conexión exitosa');

            db.query(query, [id], (err, results) => {
                if (err) {
                    console.error('Error fetching user:', err);
                    return res.send(`Error fetching user: ${err.message}`);
                } else {
                    console.log('Resultados de la consulta:', results);
                    if (results.length === 0) {
                        return res.send(`No se encontró el usuario con ID: ${id}`);
                    } else {
                        let user = results[0];
                        console.log('Usuario encontrado:', user);
                        user.fecha_nacimiento = user.fecha_nacimiento.toISOString().split('T')[0];
                        res.render('edit', { user });
                    }
                }
            });
        }
    });
});

// Ruta para actualizar un usuario (POST)
app.post('/edit/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, fecha_nacimiento, sexo, edad, altura, peso, numero_cuenta } = req.body;

    console.log(`Actualizando usuario con ID: ${id}`);
    console.log('Datos recibidos:', req.body);

    if (!name || !email || !fecha_nacimiento || !sexo || !edad || !altura || !peso || !numero_cuenta) {
        return res.send('Todos los campos son requeridos.');
    }

    const query = 'UPDATE usuarios SET name = ?, email = ?, fecha_nacimiento = ?, sexo = ?, edad = ?, altura = ?, peso = ?, numero_cuenta = ? WHERE id = ?';
    db.query(query, [name, email, fecha_nacimiento, sexo, edad, altura, peso, numero_cuenta, id], (err) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.send(`Error al actualizar el usuario: ${err.message}`);
        } else {
            console.log(`Usuario con ID: ${id} actualizado`);
            res.redirect('/');
        }
    });
});

// Ruta para eliminar un usuario
app.get('/delete/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM usuarios WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.send('Error al eliminar el usuario');
        } else {
            res.redirect('/');
        }
    });
});



