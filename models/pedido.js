// models/pedido.js
const mongoose = require('mongoose');
const Counter = require('./counter');

// Esquema de productos en el pedido
const ProductoSchema = new mongoose.Schema({
  id_producto:     { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  nombre:          String,
  precio_unitario: Number,
  cantidad:        Number
}, { versionKey: false, _id: false });

// Esquema de juegos en el pedido
const JuegoSchema = new mongoose.Schema({
  id_juego:        { type: mongoose.Schema.Types.ObjectId, ref: 'Juego' },
  nombre:          String,
  precio_unitario: Number,
  cantidad:        Number,
  categoria:       String
}, { versionKey: false, _id: false });

// Esquema del cliente embebido en el pedido
const ClienteSchema = new mongoose.Schema({
  id_cliente: { type: String }, // Ahora es String para aceptar 'CLI0002'
  codigo_cliente: { type: String }, // opcional, si no lo usas puedes eliminarlo
  nombre:     String,
  correo:     String,
  telefono:   String,
  direccion:  String
}, { versionKey: false, _id: false }); // _id: false para que no genere un _id extra

// Esquema del pedido
const PedidoSchema = new mongoose.Schema({
  id_pedido:    { type: String, unique: true }, // ID secuencial tipo 'PEDI0001'
  cliente:      ClienteSchema,
  productos:    [ProductoSchema],
  juegos:       [JuegoSchema],
  fecha_pedido: { type: Date, default: Date.now },
  estado:       { type: String, enum: ['pendiente','procesando','enviado','entregado' ,'cancelado'], default: 'pendiente' },
  total:        Number
}, { versionKey: false });

// Generar ID secuencial antes de guardar
PedidoSchema.pre('save', async function(next) {
  if (!this.id_pedido) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { entidad: 'pedido' },
        { $inc: { secuencia: 1 } },
        { new: true, upsert: true }
      );
      this.id_pedido = `PEDI${counter.secuencia.toString().padStart(4, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.models.Pedido || mongoose.model('Pedido', PedidoSchema);

