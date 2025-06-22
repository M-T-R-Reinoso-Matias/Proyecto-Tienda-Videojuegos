// productos.js
const express = require('express');
const router = express.Router();
const Producto = require('../models/producto');

// Middleware de validación para crear producto (sin id_producto)
const validarProductoCreacion = (req, res, next) => {
  const { nombre, precio, stock, categoria } = req.body;

  if (!nombre || typeof nombre !== 'string') {
    return res.status(400).json({ error: 'El nombre es obligatorio y debe ser un texto.' });
  }
  if (precio == null || typeof precio !== 'number' || precio <= 0) {
    return res.status(400).json({ error: 'El precio debe ser un número mayor a 0.' });
  }
  if (stock == null || typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({ error: 'El stock no puede ser negativo.' });
  }
  if (!categoria || typeof categoria !== 'string') {
    return res.status(400).json({ error: 'La categoría es obligatoria y debe ser un texto.' });
  }

  next();
};

// Middleware de validación para actualizar producto (puede incluir id_producto o no)
const validarProductoActualizacion = (req, res, next) => {
  const { nombre, precio, stock, categoria } = req.body;

  if (nombre && typeof nombre !== 'string') {
    return res.status(400).json({ error: 'El nombre debe ser un texto.' });
  }
  if (precio != null && (typeof precio !== 'number' || precio <= 0)) {
    return res.status(400).json({ error: 'El precio debe ser un número mayor a 0.' });
  }
  if (stock != null && (typeof stock !== 'number' || stock < 0)) {
    return res.status(400).json({ error: 'El stock no puede ser negativo.' });
  }
  if (categoria && typeof categoria !== 'string') {
    return res.status(400).json({ error: 'La categoría debe ser un texto.' });
  }

  next();
};

// Crear un nuevo producto (sin id_producto en req.body)
router.post('/', validarProductoCreacion, async (req, res) => {
  try {
    const { nombre, precio, stock, categoria } = req.body;

    const nuevoProducto = new Producto({ nombre, precio, stock, categoria });
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
    const productos = await Producto.find().sort({ id_producto: 1 }); // orden ascendente
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error });
  }
});

// Buscar productos por nombre o categoría
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

// Obtener productos sin stock
router.get('/sin-stock', async (req, res) => {
  try {
    const productos = await Producto.find({ stock: 0 });
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar productos sin stock' });
  }
});

// Actualizar producto (se permite id_producto, pero no obligatorio)
router.put('/:id', validarProductoActualizacion, async (req, res) => {
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(productoActualizado);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;



