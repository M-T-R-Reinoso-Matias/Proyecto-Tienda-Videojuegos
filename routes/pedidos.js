// routes/pedidos.js
const express = require('express');
const router = express.Router();
const Cliente = require('../models/cliente');
const Pedido = require('../models/pedido');
const Producto = require('../models/producto');


// Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find();
    res.json(pedidos);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// Crear un nuevo pedido
router.post('/', async (req, res) => {
  try {
    const { cliente, productos } = req.body;

    let total = 0;
    const productosActualizados = [];

    for (const p of productos) {
      const productoDB = await Producto.findById(p.id_producto);
      if (!productoDB) {
        return res.status(400).json({ error: `Producto con ID ${p.id_producto} no encontrado.` });
      }

      if (p.cantidad > productoDB.stock) {
        return res.status(400).json({
          error: `No hay suficiente stock para ${productoDB.nombre}. Disponible: ${productoDB.stock}, solicitado: ${p.cantidad}`
        });
      }

      // Actualizar stock
      productoDB.stock -= p.cantidad;
      await productoDB.save();

      total += p.cantidad * productoDB.precio;

      productosActualizados.push({
        id_producto: productoDB._id,
        nombre: productoDB.nombre,
        cantidad: p.cantidad,
        precio_unitario: productoDB.precio,
      });
    }

    const nuevoPedido = new Pedido({
      cliente, // embebido directamente sin buscarlo en DB
      productos: productosActualizados,
      total,
    });

    await nuevoPedido.save();

    res.status(201).json(nuevoPedido);
  } catch (err) {
    console.error('Error al crear pedido:', err);
    res.status(500).json({ error: 'Error del servidor al crear el pedido' });
  }
});


// Actualizar el estado de un pedido existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const pedido = await Pedido.findById(id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    pedido.estado = estado;
    await pedido.save();

    res.json({ mensaje: 'Estado actualizado correctamente', pedido });
  } catch (err) {
    console.error('Error al actualizar estado del pedido:', err);
    res.status(500).json({ error: 'Error al actualizar estado del pedido' });
  }
});


// Eliminar un pedido (sin devolver el stock)
router.delete('/:id', async (req, res) => {
  try {
    console.log('🧨 Eliminando pedido con ID:', req.params.id);
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      console.log('⚠️ Pedido no encontrado');
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    await pedido.deleteOne();
    res.json({ mensaje: 'Pedido eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar pedido:', err);
    res.status(500).json({ error: 'Error al eliminar el pedido' });
  }
});

/*// Eliminar un pedido y devolver el stock
router.delete('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    // Devolver el stock
    for (const item of pedido.productos) {
      const producto = await Producto.findById(item.id_producto);
      if (producto) {
        producto.stock += item.cantidad;
        await producto.save();
      }
    }

    await pedido.deleteOne();
    res.json({ mensaje: 'Pedido eliminado y stock devuelto' });
  } catch (err) {
    console.error('Error al eliminar pedido:', err);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});*/



module.exports = router;

