// productos.js
const express = require('express');
const router = express.Router();
const Producto = require('../models/producto');

// Middleware de validación para crear y actualizar
const validarProducto = (req, res, next) => {
  const { id_producto, nombre, precio, stock, categoria } = req.body;

  if (!id_producto || typeof id_producto !== 'string') {
    return res.status(400).json({ error: 'El ID de producto es obligatorio y debe ser un texto.' });
  }
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

// Crear un nuevo producto con validaciones
router.post('/', validarProducto, async (req, res) => {
  try {
    const { id_producto, nombre, precio, stock, categoria } = req.body;

    // Verificar si ya existe un producto con el mismo ID
    const existente = await Producto.findOne({ id_producto });
    if (existente) {
      return res.status(400).json({ error: 'Ya existe un producto con ese ID' });
    }

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

// Actualizar producto con validaciones
router.put('/:id', validarProducto, async (req, res) => {
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


