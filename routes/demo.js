// demo.js (ruta de datos de prueba)
const express = require('express'), routerD = express.Router();
const Producto = require('../models/producto');
const Cliente = require('../models/cliente');
const Pedido  = require('../models/pedido');
routerD.post('/', async (req,res)=>{
  try{
    // Insertar productos
    await Producto.deleteMany();
    const prod = await Producto.insertMany([
      { id_producto: 'P001', nombre: 'Laptop Dell', descripcion:'GPU Intel', precio:1200, stock:10, categoria:'Computadoras' },
      { id_producto: 'P002', nombre: 'Mouse Logitech', descripcion:'Óptico', precio:50, stock:30, categoria:'Accesorios' }
    ]);
    // Insertar clientes
    await Cliente.deleteMany();
    const cli = await Cliente.insertMany([{ id_cliente:'C001', nombre:'Juan Pérez', correo:'juan@example.com', telefono:'123456789', direccion:'Av. Central 123' }]);
    // Insertar pedidos
    await Pedido.deleteMany();
    const ped = await Pedido.create({ cliente:cli[0], productos: [
        { ...prod[0].toObject(), cantidad:1, precio_unitario:prod[0].precio },
        { ...prod[1].toObject(), cantidad:2, precio_unitario:prod[1].precio }
      ], estado:'pendiente', total: prod[0].precio*1 + prod[1].precio*2
    });
    res.json({ productos:prod, clientes:cli, pedidos:[ped] });
  }catch(e){res.status(500).json({error:e.message})}
});
module.exports = routerD;