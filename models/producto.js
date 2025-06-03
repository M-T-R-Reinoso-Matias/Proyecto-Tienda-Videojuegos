// models/producto.js
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  id_producto: { type: String, required: true, unique: true },
  nombre:      { type: String, required: true },
  descripcion: String,
  precio:      { type: Number, required: true, min: 0 },
  categoria:   String,
  stock:       { type: Number, default: 0, min: 0 }
});

module.exports = mongoose.model('Producto', ProductoSchema);
