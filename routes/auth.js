const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Cliente = require('../models/cliente');
const Carrito = require('../models/carrito');
const Counter = require('../models/counter');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función generadora de ID incremental
async function generarIdCliente() {
  const resultado = await Counter.findOneAndUpdate(
    { entidad: 'cliente' },
    { $inc: { secuencia: 1 } },
    { new: true, upsert: true }
  );

  const numero = resultado.secuencia.toString().padStart(4, '0'); // 0001
  return `CLI${numero}`;
}

// Registro
router.post('/register', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  console.log('Registro recibido:', req.body);
  if (!nombre || !correo || !contraseña)
    return res.status(400).json({ error: 'Campos obligatorios' });

  try {
    const existe = await User.findOne({ email: correo });
    if (existe) return res.status(400).json({ error: 'Correo ya registrado' });

    const nuevoUsuario = new User({ nombre, email: correo, password: contraseña });
    const usuarioGuardado = await nuevoUsuario.save();

    // Crear carrito vacío
    const carrito = new Carrito({ usuario: usuarioGuardado._id, items: [] });
    await carrito.save();

    // 🔢 Generar ID incremental para cliente
    const id_cliente = await generarIdCliente();

    // Crear cliente asociado al usuario
    const nuevoCliente = new Cliente({
      id_cliente,
      usuario: usuarioGuardado._id,
      nombre,
      correo,
      telefono: '',
      direccion: ''
    });
    await nuevoCliente.save();

    res.status(201).json({ mensaje: 'Usuario, cliente y carrito creados correctamente' });
  } catch (err) {
    console.error('Error en /register:', err);
    res.status(500).json({ error: 'Error al registrar' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login recibido:', req.body);

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(400).json({ error: 'Correo o contraseña incorrectos' });

    const match = await bcrypt.compare(password, usuario.password);
    if (!match) return res.status(400).json({ error: 'Correo o contraseña incorrectos' });

    const token = jwt.sign({ id: usuario._id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

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


