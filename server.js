const express = require('express');
const cors    = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./config/db');

// Rutas
const productos         = require('./routes/productos');
const clientes          = require('./routes/clientes');
const pedidos           = require('./routes/pedidos');
const juegos            = require('./routes/juegos');
const auth              = require('./routes/auth');
const protegidas        = require('./routes/protegidas');
const carrito           = require('./routes/carrito');
const usuarios          = require('./routes/usuarios');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use('/api/productos',   productos);
app.use('/api/clientes',     clientes);
app.use('/api/pedidos',       pedidos);
app.use('/api/juegos',         juegos);
app.use('/api/auth',             auth);
app.use('/api/protegidas', protegidas);
app.use('/api/carrito',       carrito);
app.use('/api/usuarios',     usuarios);


const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
