const express = require('express');
const routerC = express.Router();
const Cliente = require('../models/cliente');
const Pedido  = require('../models/pedido');

// POST - Agregar nuevo cliente con validación de duplicados
routerC.post('/', async (req, res) => {
  try {
    const { id_cliente, correo } = req.body;

    const existe = await Cliente.findOne({
      $or: [{ id_cliente }, { correo }]
    });

    if (existe) {
      return res.status(400).json({ error: 'Ya existe un cliente con ese ID o correo' });
    }

    const nuevoCliente = new Cliente(req.body);
    await nuevoCliente.save();
    res.json(nuevoCliente);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET - Obtener todos los clientes
routerC.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /clientes/compradores - obtener clientes que hicieron al menos un pedido
routerC.get('/compradores', async (req, res) => {
  try {
    const pedidos = await Pedido.find({}, 'cliente');

    const clientesMap = new Map();

    pedidos.forEach(pedido => {
      const cliente = pedido.cliente;
      if (cliente && cliente.correo) {
        clientesMap.set(cliente.correo, cliente); // clave: correo único
      }
    });

    const clientesUnicos = Array.from(clientesMap.values());

    res.json(clientesUnicos);
  } catch (error) {
    console.error('Error en /clientes/compradores:', error);
    res.status(500).json({ error: 'Error al obtener clientes compradores' });
  }
});

// DELETE - Eliminar cliente por ID (_id de MongoDB)
routerC.delete('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    await cliente.deleteOne();
    res.json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar cliente' });
  }
});

module.exports = routerC;

