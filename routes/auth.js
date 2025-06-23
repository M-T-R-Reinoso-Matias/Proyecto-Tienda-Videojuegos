// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Cliente = require('../models/cliente');
const Carrito = require('../models/carrito');
const Counter = require('../models/counter');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generador de ID incremental
async function generarIdCliente() {
  const resultado = await Counter.findOneAndUpdate(
    { entidad: 'cliente' },
    { $inc: { secuencia: 1 } },
    { new: true, upsert: true }
  );
  const numero = resultado.secuencia.toString().padStart(4, '0');
  return `CLI${numero}`;
}

// Registro
router.post('/register', async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });

  try {
    const existe = await User.findOne({ email: correo });
    if (existe) {
      return res.status(400).json({ error: 'Este correo ya está registrado. Inicia sesión o usa otro.' });
    }

    const nuevoUsuario = new User({ nombre, email: correo, password });

    const usuarioGuardado = await nuevoUsuario.save();

    const carrito = new Carrito({ usuario: usuarioGuardado._id, items: [] });
    await carrito.save();

    const id_cliente = await generarIdCliente();

    const nuevoCliente = new Cliente({
      id_cliente,
      usuario: usuarioGuardado._id,
      nombre,
      correo,
      telefono: '',
      direccion: ''
    });
    await nuevoCliente.save();

    res.status(201).json({ mensaje: '✅ Usuario, cliente y carrito creados correctamente' });
  } catch (err) {
    console.error('Error en /register:', err);
    res.status(500).json({ error: '❌ Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login recibido:', email, password);

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ error: 'Debe registrarse antes de iniciar sesión.' });
    }

    console.log('Usuario encontrado:', usuario.email);
    console.log('Hash en BD:', usuario.password);

    const match = await bcrypt.compare(password, usuario.password);
    console.log('¿Coincide la contraseña?', match);

    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta. Intenta nuevamente.' });
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      usuario: {
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error('Error en /login:', err);
    res.status(500).json({ error: '❌ Error del servidor al iniciar sesión' });
  }
});

module.exports = router;

