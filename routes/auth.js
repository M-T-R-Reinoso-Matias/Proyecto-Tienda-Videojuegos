// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  if (!nombre || !correo || !contraseña) return res.status(400).json({ error: 'Faltan campos' });

  const existente = await User.findOne({ email: correo });
  if (existente) return res.status(400).json({ error: 'Ya existe una cuenta con ese correo' });

  const user = new User({ nombre, email: correo, password: contraseña });
  await user.save();
  res.status(201).json({ mensaje: 'Usuario registrado' });
});

// Login
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  const user = await User.findOne({ email: correo });
  if (!user) return res.status(400).json({ error: 'Correo no registrado' });

  const esValido = await bcrypt.compare(password, user.password);
  if (!esValido) return res.status(400).json({ error: 'Contraseña incorrecta' });

  const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, rol: user.rol });
});

module.exports = router;
