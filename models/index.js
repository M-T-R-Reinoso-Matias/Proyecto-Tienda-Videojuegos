const express = require('express');
const mongoose = require('./db');
const cors = require('cors');
const Producto = require('./producto');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

app.post('/productos', async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.status(201).json(nuevoProducto);
    } catch (err) {
        res.status(400).json({ error: "Error al guardar producto" });
    }
});

app.listen(3000, () => {
    console.log("🚀 Servidor escuchando en http://localhost:3000");
});
