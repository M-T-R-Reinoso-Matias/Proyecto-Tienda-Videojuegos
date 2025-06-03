// productos.js
const express = require('express');
const router = express.Router();
const Producto = require('../models/producto');

// Crear un nuevo producto con validaciones
router.post('/', async (req, res) => {
  try {
    const { id_producto, nombre, precio, stock, categoria } = req.body;

    // Verificar campos obligatorios
    if (!id_producto || !nombre || !precio || !stock || !categoria) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar si ya existe un producto con el mismo ID
    const existente = await Producto.findOne({ id_producto });
    if (existente) {
      return res.status(400).json({ error: 'Ya existe un producto con ese ID' });
    }

    // Crear y guardar producto
    const nuevoProducto = new Producto({ id_producto, nombre, precio, stock, categoria });
    await nuevoProducto.save();

    res.status(201).json(nuevoProducto);
  } catch (e) {
    console.error('Error al agregar producto:', e);
    res.status(500).json({ error: e.message });
  }
});

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/productos/buscar
router.get('/buscar', async (req, res) => {
  const { query } = req.query;

  try {
    const productos = await Producto.find({
      $or: [
        { nombre: { $regex: query, $options: 'i' } },
        { categoria: { $regex: query, $options: 'i' } }
      ]
    });

    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar productos' });
  }
});

// GET /api/productos/sin-stock
router.get('/sin-stock', async (req, res) => {
  try {
    const productos = await Producto.find({ stock: 0 });
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar productos sin stock' });
  }
});


// Eliminar producto por ID
router.delete('/:id', async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

