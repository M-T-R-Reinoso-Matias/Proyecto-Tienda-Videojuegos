// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Carrito = require('../models/carrito'); // 👈 importamos el modelo de carrito
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro
router.post('/register', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  if (!nombre || !correo || !contraseña)
    return res.status(400).json({ error: 'Campos obligatorios' });

  try {
    const existe = await User.findOne({ email: correo });
    if (existe) return res.status(400).json({ error: 'Correo ya registrado' });

    const hash = await bcrypt.hash(contraseña, 10); // 👈 encriptamos contraseña
    const nuevoUsuario = new User({ nombre, email: correo, password: hash });
    const usuarioGuardado = await nuevoUsuario.save();

    // ✅ Crear carrito vacío al registrar el usuario
    const carrito = new Carrito({ usuario: usuarioGuardado._id, items: [] });
    await carrito.save();

    res.status(201).json({ mensaje: 'Usuario creado y carrito inicializado' });
  } catch (err) {
    console.error('Error en /register:', err);
    res.status(500).json({ error: 'Error al registrar' });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;

  try {
    const usuario = await User.findOne({ email: correo });
    if (!usuario) return res.status(400).json({ error: 'Correo o contraseña incorrectos' });

    const match = await bcrypt.compare(password, usuario.password);
    if (!match) return res.status(400).json({ error: 'Correo o contraseña incorrectos' });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({
      token,
      usuario: {
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});


module.exports = router;

