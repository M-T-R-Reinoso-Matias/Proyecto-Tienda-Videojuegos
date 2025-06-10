// routes/carrito.js
const express = require('express');
const router = express.Router();
const Pedido = require('../models/pedido');
const Cliente = require('../models/cliente');
const Carrito = require('../models/carrito');
const Producto = require('../models/producto');
const Juego = require('../models/juego');
const { verificarToken } = require('../middleware/auth');

// ✅ GET: Obtener el carrito del usuario
router.get('/', verificarToken, async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuario: req.user._id })
      .populate('items.producto', 'nombre precio descripcion stock')
      .populate('items.juego', 'nombre precio descripcion stock categoria');

    if (!carrito) {
      return res.json({ usuario: req.user._id, items: [] });
    }

    const itemsValidos = carrito.items.filter(item => item.producto || item.juego);

    const itemsFormateados = itemsValidos.map(item => {
      const itemData = item.producto || item.juego;
      const tipo = item.producto ? 'producto' : 'juego';

      return {
        tipo, // "producto" o "juego"
        cantidad: item.cantidad,
        [tipo]: {
          _id: itemData._id,
          nombre: itemData.nombre,
          precio: itemData.precio,
          descripcion: itemData.descripcion,
          stock: itemData.stock,
          ...(itemData.categoria && { categoria: itemData.categoria }),
        },
      };
    });

    res.json({ usuario: req.user._id, items: itemsFormateados });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener el carrito', error: err.message });
  }
});

// ✅ POST: Agregar producto o juego al carrito
router.post('/agregar', verificarToken, async (req, res) => {
  const { productoId, tipo } = req.body;

  if (!productoId || !tipo) {
    return res.status(400).json({ mensaje: 'Faltan campos: productoId o tipo' });
  }

  const tipoNormalizado = tipo.toLowerCase();

  const Modelo = tipoNormalizado === 'producto' ? Producto :
                 tipoNormalizado === 'juego' ? Juego : null;

  if (!Modelo) {
    return res.status(400).json({ mensaje: 'Tipo inválido' });
  }

  try {
    const item = await Modelo.findById(productoId);
    if (!item) {
      return res.status(404).json({ mensaje: `${tipo} no encontrado` });
    }

    if (item.stock !== undefined && item.stock <= 0) {
      return res.status(400).json({ mensaje: 'Sin stock disponible' });
    }

    let carrito = await Carrito.findOne({ usuario: req.user._id });
    if (!carrito) {
      carrito = new Carrito({ usuario: req.user._id, items: [] });
    }

    let existente = carrito.items.find(i =>
      tipoNormalizado === 'producto'
        ? i.producto?.toString() === productoId
        : i.juego?.toString() === productoId
    );

    if (existente) {
      existente.cantidad += 1;
    } else {
      const nuevoItem = {
        producto: tipoNormalizado === 'producto' ? productoId : null,
        juego: tipoNormalizado === 'juego' ? productoId : null,
        cantidad: 1
      };
      carrito.items.push(nuevoItem);
    }

    if (item.stock !== undefined) {
      item.stock -= 1;
      await item.save();
    }

    await carrito.save();

    res.json({ mensaje: `${tipo} agregado al carrito` });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al agregar al carrito', error: err.message });
  }
});

// ✅ POST: Eliminar producto o juego específico del carrito y restaurar stock
router.post('/eliminar', verificarToken, async (req, res) => {
  const { productoId, tipo } = req.body;
  if (!productoId || !tipo) {
    return res.status(400).json({ mensaje: 'Faltan campos' });
  }

  const tipoNormalizado = tipo.toLowerCase();
  const Modelo = tipoNormalizado === 'producto' ? Producto :
                 tipoNormalizado === 'juego' ? Juego : null;

  if (!Modelo) return res.status(400).json({ mensaje: 'Tipo inválido' });

  try {
    const carrito = await Carrito.findOne({ usuario: req.user._id });
    if (!carrito) return res.status(404).json({ mensaje: 'Carrito no encontrado' });

    const index = carrito.items.findIndex((i) =>
      tipoNormalizado === 'producto'
        ? i.producto?.toString() === productoId
        : i.juego?.toString() === productoId
    );

    if (index === -1) return res.status(404).json({ mensaje: 'Item no está en el carrito' });

    const item = carrito.items[index];
    const modelo = await Modelo.findById(productoId);
    if (modelo && modelo.stock !== undefined) {
      modelo.stock += item.cantidad;
      await modelo.save();
    }

    carrito.items.splice(index, 1);
    await carrito.save();

    res.json({ mensaje: 'Item eliminado del carrito' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar del carrito', error: err.message });
  }
});

// ✅ POST: Finalizar compra y generar un pedido
// ✅ POST: Finalizar compra y generar un pedido
router.post('/finalizar', verificarToken, async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuario: req.user._id })
      .populate('items.producto')
      .populate('items.juego');

    if (!carrito || carrito.items.length === 0) {
      return res.status(400).json({ mensaje: 'El carrito está vacío' });
    }

    const cliente = await Cliente.findOne({ usuario: req.user._id });
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Información del cliente no encontrada' });
    }

    const productos = [];
    const juegos = [];
    let total = 0;

    for (const item of carrito.items) {
      if (item.producto) {
        productos.push({
          id_producto: item.producto._id,
          nombre: item.producto.nombre,
          precio_unitario: item.producto.precio,
          cantidad: item.cantidad
        });
        total += item.producto.precio * item.cantidad;
      } else if (item.juego) {
        juegos.push({
          id_juego: item.juego._id,
          nombre: item.juego.nombre,
          precio_unitario: item.juego.precio,
          cantidad: item.cantidad,
          categoria: item.juego.categoria
        });
        total += item.juego.precio * item.cantidad;
      }
    }

    const nuevoPedido = new Pedido({
      cliente: {
        id_cliente: cliente.id_cliente, // ✅ CORREGIDO: usa el ID secuencial del cliente (ej. CLI0001)
        nombre: cliente.nombre,
        correo: cliente.correo,
        telefono: cliente.telefono,
        direccion: cliente.direccion
      },
      productos,
      juegos,
      total
    });

    await nuevoPedido.save();

    carrito.items = [];
    await carrito.save();

    res.json({ mensaje: '✅ Pedido generado correctamente' });
  } catch (err) {
    console.error('Error al finalizar compra:', err); // 👈 importante para depuración
    res.status(500).json({ mensaje: 'Error al finalizar compra', error: err.message });
  }
});



// ✅ POST: Vaciar todo el carrito y restaurar el stock
router.post('/vaciar', verificarToken, async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuario: req.user._id })
      .populate('items.producto')
      .populate('items.juego');

    if (!carrito) {
      return res.status(404).json({ mensaje: 'Carrito no encontrado' });
    }

    for (const item of carrito.items) {
      if (item.producto) {
        const prod = await Producto.findById(item.producto._id);
        if (prod) {
          prod.stock += item.cantidad;
          await prod.save();
        }
      } else if (item.juego) {
        const juego = await Juego.findById(item.juego._id);
        if (juego) {
          juego.stock += item.cantidad;
          await juego.save();
        }
      }
    }

    carrito.items = [];
    await carrito.save();

    res.json({ mensaje: 'Carrito vaciado y stock restaurado' });
  } catch (err) {
    console.error('Error al vaciar carrito:', err);
    res.status(500).json({ mensaje: 'Error interno al vaciar carrito', error: err.message });
  }
});

module.exports = router;
