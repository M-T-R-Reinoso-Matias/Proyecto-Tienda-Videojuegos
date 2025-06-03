const express = require('express');
const cors    = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./config/db');

// Rutas
const productos = require('./routes/productos');
const clientes  = require('./routes/clientes');
const pedidos   = require('./routes/pedidos');
const demo      = require('./routes/demo');

const app = express();
connectDB();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/productos', productos);
app.use('/api/clientes',  clientes);
app.use('/api/pedidos',   pedidos);
app.use('/api/demo',      demo);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
