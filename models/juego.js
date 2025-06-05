// models/Juego.js
const mongoose = require('mongoose');

const juegoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: String,
  plataforma: String,
  stock: { type: Number, default: 0 }
});

module.exports = mongoose.model('Juego', juegoSchema);
