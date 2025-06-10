// models/pedido.js
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  id_producto:    { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  nombre:         String,
  precio_unitario:Number,
  cantidad:       Number
}, { _id: false });

const JuegoSchema = new mongoose.Schema({
  id_juego:       { type: mongoose.Schema.Types.ObjectId, ref: 'Juego' },
  nombre:         String,
  precio_unitario:Number,
  cantidad:       Number,
  categoria:      String
}, { _id: false });

const ClienteSchema = new mongoose.Schema({
  id_cliente:     { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' }, // ✅ Referencia válida
  codigo_cliente: { type: String },  // ✅ Para guardar "CLI0001"
  nombre:         String,
  correo:         String,
  telefono:       String,
  direccion:      String
}, { _id: true });

const PedidoSchema = new mongoose.Schema({
  cliente:      ClienteSchema,
  productos:    [ProductoSchema],
  juegos:       [JuegoSchema],
  fecha_pedido: { type: Date, default: Date.now },
  estado:       { type: String, enum: ['pendiente','procesando','enviado','entregado'], default: 'pendiente' },
  total:        Number
});

module.exports = mongoose.models.Pedido || mongoose.model('Pedido', PedidoSchema);


