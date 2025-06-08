// routes/juegos.js
const express = require('express');
const router = express.Router();
const Juego = require('../models/juego');
const { verificarToken, soloRol } = require('../middleware/auth');

const soloAdmin = soloRol('admin'); // ✅ middleware bien definido

// Obtener todos o buscar por plataforma o categoría
router.get('/', async (req, res) => {
  const { plataforma, categoria } = req.query;
  const filtro = {};
  if (plataforma) filtro.plataforma = plataforma;
  if (categoria) filtro.categoria = categoria;

  try {
    const juegos = await Juego.find(filtro);
    res.json(juegos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener juegos' });
  }
});

// Agregar un juego (solo admin)
router.post('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, plataforma, categoria, stock, precio } = req.body;

    if (!nombre || !plataforma || !categoria || stock == null || precio == null) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'El stock debe ser un número no negativo.' });
    }

    if (typeof precio !== 'number' || precio < 0) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo.' });
    }

    const existente = await Juego.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });
    if (existente) {
      return res.status(400).json({ error: 'Ese juego ya está registrado.' });
    }

    const nuevoJuego = new Juego({ nombre, plataforma, categoria, stock, precio });
    const guardado = await nuevoJuego.save();

    res.status(201).json(guardado);
  } catch (error) {
    console.error('Error al agregar juego:', error.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Editar juego por ID (solo admin)
router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, stock, precio } = req.body;

    const duplicado = await Juego.findOne({ nombre, _id: { $ne: req.params.id } });
    if (duplicado) return res.status(400).json({ error: 'Ya existe otro juego con ese nombre.' });

    if (stock != null && (typeof stock !== 'number' || stock < 0)) {
      return res.status(400).json({ error: 'Stock inválido.' });
    }

    if (precio != null && (typeof precio !== 'number' || precio < 0)) {
      return res.status(400).json({ error: 'Precio inválido.' });
    }

    const juego = await Juego.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(juego);
  } catch (err) {
    console.error('Error al editar juego:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Eliminar juego (solo admin)
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    await Juego.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar juego' });
  }
});

// ✅ Ruta para modificar stock (ej: al agregar al carrito)
router.put('/:id/stock', async (req, res) => {
  const { cantidad } = req.body;

  if (typeof cantidad !== 'number') {
    return res.status(400).json({ error: 'Cantidad inválida.' });
  }

  try {
    const juego = await Juego.findById(req.params.id);
    if (!juego) return res.status(404).json({ error: 'Juego no encontrado.' });

    if (juego.stock + cantidad < 0) {
      return res.status(400).json({ error: 'No hay suficiente stock.' });
    }

    juego.stock += cantidad;
    await juego.save();
    res.json(juego);
  } catch (err) {
    res.status(500).json({ error: 'Error al modificar stock' });
  }
});

module.exports = router;


