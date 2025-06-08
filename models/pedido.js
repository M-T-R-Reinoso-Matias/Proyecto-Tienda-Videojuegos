// pedido.js
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  id_producto:    { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  nombre:         String,
  precio_unitario:Number,
  cantidad:       Number
}, { _id: false });

const ClienteSchema = new mongoose.Schema({
  id_cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  nombre:     String,
  correo:     String,
  telefono:   String,
  direccion:  String
}, { _id: false });

const PedidoSchema = new mongoose.Schema({
  cliente:      ClienteSchema,  // embebido
  productos:    [ProductoSchema],
  fecha_pedido: { type: Date, default: Date.now },
  estado:       { type: String, enum: ['pendiente','procesando','enviado','entregado'], default: 'pendiente' },
  total:        Number
});

module.exports = mongoose.models.Pedido || mongoose.model('Pedido', PedidoSchema);
