// Backend: Validar nombre único y agregar búsqueda por plataforma o categoría

const express = require('express');
const router = express.Router();
const Juego = require('../models/juego');

// Obtener todos o buscar por plataforma o categoría
router.get('/', async (req, res) => {
  const { plataforma, categoria } = req.query;
  const filtro = {};
  if (plataforma) filtro.plataforma = plataforma;
  if (categoria) filtro.categoria = categoria;

  const juegos = await Juego.find(filtro);
  res.json(juegos);
});

// Agregar uno (nombre único)
router.post('/', async (req, res) => {
  const { nombre } = req.body;
  const existente = await Juego.findOne({ nombre });
  if (existente) return res.status(400).json({ error: 'Ese juego ya está registrado.' });

  const nuevoJuego = new Juego(req.body);
  await nuevoJuego.save();
  res.status(201).json(nuevoJuego);
});

// Eliminar
router.delete('/:id', async (req, res) => {
  await Juego.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// Editar
router.put('/:id', async (req, res) => {
  const { nombre } = req.body;
  const duplicado = await Juego.findOne({ nombre, _id: { $ne: req.params.id } });
  if (duplicado) return res.status(400).json({ error: 'Ya existe otro juego con ese nombre.' });

  const juego = await Juego.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(juego);
});

module.exports = router;