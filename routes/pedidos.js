// routes/pedidos.js
const express = require('express');
const router = express.Router();
const Carrito = require('../models/carrito');
const Pedido = require('../models/pedido');
const Cliente = require('../models/cliente');
const { verificarToken } = require('../middleware/auth');

/**
 * POST /api/pedidos
 * Crea un nuevo pedido tomando el carrito del usuario autenticado.
 * Valida que el perfil de cliente tenga nombre, correo, teléfono y dirección.
 */
router.post('/', verificarToken, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Buscar datos del cliente
    const cliente = await Cliente.findOne({ usuario: req.user._id });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Validar campos obligatorios en el perfil
    const camposFaltantes = [];
    if (!cliente.nombre)   camposFaltantes.push('nombre');
    if (!cliente.correo)   camposFaltantes.push('correo');
    if (!cliente.telefono) camposFaltantes.push('telefono');
    if (!cliente.direccion)camposFaltantes.push('direccion');

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        error: 'Perfil incompleto. Complete los siguientes campos:',
        camposFaltantes
      });
    }

    // Obtener carrito
    const carrito = await Carrito.findOne({ usuario: req.user._id })
      .populate('items.producto')
      .populate('items.juego');
    if (!carrito || carrito.items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Procesar items y calcular total
    let total = 0;
    const productosFinal = [];
    const juegosFinal = [];

    for (const item of carrito.items) {
      if (item.producto) {
        if (item.cantidad > item.producto.stock) {
          return res.status(400).json({ error: `Stock insuficiente para ${item.producto.nombre}` });
        }
        item.producto.stock -= item.cantidad;
        await item.producto.save();
        total += item.cantidad * item.producto.precio;
        productosFinal.push({
          id_producto: item.producto._id,
          nombre: item.producto.nombre,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio
        });
      }
      if (item.juego) {
        if (item.cantidad > item.juego.stock) {
          return res.status(400).json({ error: `Stock insuficiente para ${item.juego.nombre}` });
        }
        item.juego.stock -= item.cantidad;
        await item.juego.save();
        total += item.cantidad * item.juego.precio;
        juegosFinal.push({
          id_juego: item.juego._id,
          nombre: item.juego.nombre,
          cantidad: item.cantidad,
          precio_unitario: item.juego.precio,
          categoria: item.juego.categoria
        });
      }
    }

    // Crear pedido
    const nuevoPedido = new Pedido({
      cliente: {
        id_cliente: cliente._id,
        codigo_cliente: cliente.id_cliente,
        nombre: cliente.nombre,
        correo: cliente.correo,
        telefono: cliente.telefono,
        direccion: cliente.direccion
      },
      productos: productosFinal,
      juegos: juegosFinal,
      total,
      estado: 'pendiente'
    });

    await nuevoPedido.save();
    carrito.items = [];
    await carrito.save();
    return res.status(201).json(nuevoPedido);
  } catch (err) {
    console.error('Error al crear pedido:', err);
    return res.status(500).json({ error: 'Error del servidor al crear el pedido' });
  }
});

/**
 * GET /api/pedidos
 * Lista todos los pedidos (modo admin).
 */
router.get('/', verificarToken, async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    return res.json(pedidos);
  } catch (err) {
    console.error('Error al listar pedidos:', err);
    return res.status(500).json({ error: 'Error del servidor al listar pedidos' });
  }
});

/**
 * GET /api/pedidos/:id
 * Recupera un pedido concreto por su ID.
 */
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    return res.json(pedido);
  } catch (err) {
    console.error('Error al obtener pedido:', err);
    return res.status(500).json({ error: 'Error del servidor al obtener el pedido' });
  }
});

/**
 * PUT /api/pedidos/:id
 * Actualiza el estado de un pedido.
 */
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { estado } = req.body;
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    pedido.estado = estado;
    await pedido.save();
    return res.json(pedido);
  } catch (err) {
    console.error('Error al actualizar pedido:', err);
    return res.status(500).json({ error: 'Error del servidor al actualizar el pedido' });
  }
});

/**
 * DELETE /api/pedidos/:id
 * Elimina un pedido.
 */
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    await Pedido.findByIdAndDelete(req.params.id); // ✅ Soluciona el error.
    return res.json({ message: 'Pedido eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar pedido:', err);
    return res.status(500).json({ error: 'Error del servidor al eliminar el pedido' });
  }
});



/* 
// Código para eliminar pedido y devolver stock (comentado)
// Descomentar y ajustar si necesitas esta funcionalidad

router.delete('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    // Devolver el stock de productos
    for (const item of pedido.productos) {
      const producto = await Producto.findById(item.id_producto);
      if (producto) {
        producto.stock += item.cantidad;
        await producto.save();
      }
    }

    // Devolver el stock de juegos si aplicara similarmente
    // (Agregar lógica similar para juegos si es necesario)

    await pedido.deleteOne();
    res.json({ mensaje: 'Pedido eliminado y stock devuelto' });
  } catch (err) {
    console.error('Error al eliminar pedido:', err);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});
*/

module.exports = router;


