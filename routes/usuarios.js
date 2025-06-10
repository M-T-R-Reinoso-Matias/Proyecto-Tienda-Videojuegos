// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Cliente = require('../models/cliente');
const { verificarToken } = require('../middleware/auth');

/**
 * GET /api/users/me
 * Recupera datos del usuario autenticado y su perfil de cliente.
 */
router.get('/me', verificarToken, async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id).select('-password');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const cliente = await Cliente.findOne({ usuario: req.user._id });
    res.json({
      nombre:    usuario.nombre,
      email:     usuario.email,
      rol:       usuario.rol,
      telefono:  cliente?.telefono || '',
      direccion: cliente?.direccion || ''
    });
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ error: 'Error del servidor al obtener perfil' });
  }
});

/**
 * PUT /api/users/me
 * Actualiza nombre, email, teléfono y dirección del usuario autenticado.
 */
router.put('/me', verificarToken, async (req, res) => {
  try {
    const { nombre, email, telefono, direccion } = req.body;
    // Actualizar User
    const usuario = await User.findById(req.user._id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    await usuario.save();

    // Actualizar o crear Cliente
    let cliente = await Cliente.findOne({ usuario: req.user._id });
    if (!cliente) {
      cliente = new Cliente({ usuario: req.user._id });
    }
    if (telefono !== undefined)  cliente.telefono  = telefono;
    if (direccion !== undefined) cliente.direccion = direccion;
    await cliente.save();

    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ error: 'Error del servidor al actualizar perfil' });
  }
});

/**
 * GET /api/users
 * Lista todos los usuarios (solo para admins).
 */
router.get('/', verificarToken, async (req, res) => {
  try {
    // opcional: verificar rol admin antes de listar
    const usuarios = await User.find({}, 'nombre email rol');
    res.json(usuarios);
  } catch (e) {
    console.error('Error al obtener usuarios:', e);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router;