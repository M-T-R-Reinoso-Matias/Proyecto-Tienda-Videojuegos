// models/carrito.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', default: null },
  juego: { type: mongoose.Schema.Types.ObjectId, ref: 'Juego', default: null },
  cantidad: { type: Number, required: true },
  
});

const carritoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  items: [itemSchema],
});

module.exports = mongoose.model('Carrito', carritoSchema);

