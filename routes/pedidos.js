// routes/pedidos.js
const express = require('express');
const router = express.Router();
const Carrito = require('../models/carrito');
const Pedido = require('../models/pedido');
const Cliente = require('../models/cliente');
const Producto = require('../models/producto');
const Juego = require('../models/juego');
const { verificarToken } = require('../middleware/auth');

const generarIdPedido = async () => {
  const ultimoPedido = await Pedido.findOne().sort({ createdAt: -1 });
  let nuevoNumero = 1;
  if (ultimoPedido && ultimoPedido.id_pedido) {
    const ultimoNumero = parseInt(ultimoPedido.id_pedido.replace('PED', ''), 10);
    nuevoNumero = ultimoNumero + 1;
  }
  return 'PED' + nuevoNumero.toString().padStart(4, '0');
};

// Crear nuevo pedido
router.post('/', verificarToken, async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ error: 'Usuario no autenticado' });

    const cliente = await Cliente.findOne({ usuario: req.user._id });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const camposFaltantes = [];
    if (!cliente.nombre) camposFaltantes.push('nombre');
    if (!cliente.correo) camposFaltantes.push('correo');
    if (!cliente.telefono) camposFaltantes.push('telefono');
    if (!cliente.direccion) camposFaltantes.push('direccion');

    if (camposFaltantes.length > 0) return res.status(400).json({ error: 'Perfil incompleto.', camposFaltantes });

    const carrito = await Carrito.findOne({ usuario: req.user._id }).populate('items.producto').populate('items.juego');
    if (!carrito || carrito.items.length === 0) return res.status(400).json({ error: 'El carrito está vacío' });

    let total = 0;
    const productosFinal = [], juegosFinal = [];

    for (const item of carrito.items) {
      if (item.producto) {
        if (item.cantidad > item.producto.stock) return res.status(400).json({ error: `Stock insuficiente para ${item.producto.nombre}` });
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
        if (item.cantidad > item.juego.stock) return res.status(400).json({ error: `Stock insuficiente para ${item.juego.nombre}` });
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

    const nuevoIdPedido = await generarIdPedido();

    const nuevoPedido = new Pedido({
      id_pedido: nuevoIdPedido,
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

// Obtener pedidos (admin o cliente)
router.get('/', verificarToken, async (req, res) => {
  try {
    if (req.user.rol === 'admin') {
      const pedidos = await Pedido.find().sort({ createdAt: -1 });
      return res.json(pedidos);
    } else {
      const cliente = await Cliente.findOne({ usuario: req.user._id });
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
      const pedidos = await Pedido.find({ 'cliente.id_cliente': cliente.id_cliente }).sort({ createdAt: -1 });
      return res.json(pedidos);
    }
  } catch (err) {
    console.error('Error al listar pedidos:', err);
    return res.status(500).json({ error: 'Error del servidor al listar pedidos' });
  }
});

// Obtener pedido por ID
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    return res.json(pedido);
  } catch (err) {
    console.error('Error al obtener pedido:', err);
    return res.status(500).json({ error: 'Error del servidor al obtener el pedido' });
  }
});

// Actualizar estado del pedido
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { estado } = req.body;
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    pedido.estado = estado;
    await pedido.save();
    return res.json(pedido);
  } catch (err) {
    console.error('Error al actualizar pedido:', err);
    return res.status(500).json({ error: 'Error del servidor al actualizar el pedido' });
  }
});

// Eliminar pedido (admin)
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    // Lógica según el estado
    if (pedido.estado === 'enviado') {
      return res.status(400).json({ error: 'No se puede eliminar un pedido que ya fue enviado. Espere a que sea entregado.' });
    }

    // Si es pendiente, procesando o cancelado => se devuelve stock
    if (['pendiente', 'procesando', 'cancelado'].includes(pedido.estado)) {
      for (const prod of pedido.productos || []) {
        await Producto.findByIdAndUpdate(prod.id_producto, { $inc: { stock: prod.cantidad } });
      }

      for (const juego of pedido.juegos || []) {
        await Juego.findByIdAndUpdate(juego.id_juego, { $inc: { stock: juego.cantidad } });
      }

      await Pedido.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Pedido eliminado y stock devuelto correctamente.' });
    }

    // Si fue entregado => eliminar sin modificar stock
    if (pedido.estado === 'entregado') {
      await Pedido.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Pedido entregado eliminado. No se devolvió stock.' });
    }

  } catch (err) {
    console.error('Error al eliminar pedido:', err);
    return res.status(500).json({ error: 'Error del servidor al eliminar el pedido' });
  }
});


// Cancelar pedido (cliente o admin)
router.patch('/cancelar/:id', verificarToken, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado.' });

    // Buscar al cliente vinculado al usuario actual
    const cliente = await Cliente.findOne({ usuario: req.user._id });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });

    // Comparar el campo id_cliente (string, ej: "CLI0002")
    const esClientePropietario = pedido.cliente.id_cliente === cliente.id_cliente;
    const esAdmin = req.user.rol === 'admin';

    if (!esClientePropietario && !esAdmin) {
      return res.status(403).json({ error: 'No autorizado para cancelar este pedido.' });
    }

    if (pedido.estado === 'enviado' || pedido.estado === 'entregado') {
      return res.status(400).json({ error: 'No se puede cancelar un pedido enviado o entregado.' });
    }

    for (const prod of pedido.productos || []) {
      await Producto.findByIdAndUpdate(prod.id_producto, { $inc: { stock: prod.cantidad } });
    }

    for (const juego of pedido.juegos || []) {
      await Juego.findByIdAndUpdate(juego.id_juego, { $inc: { stock: juego.cantidad } });
    }

    await Pedido.findByIdAndDelete(req.params.id);
    return res.json({ mensaje: 'Pedido cancelado, eliminado y stock devuelto.' });

  } catch (err) {
    console.error('Error al cancelar y eliminar pedido:', err);
    return res.status(500).json({ error: 'Error del servidor al cancelar el pedido.' });
  }
});




module.exports = router;




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



