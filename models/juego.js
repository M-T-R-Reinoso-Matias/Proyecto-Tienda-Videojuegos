// models/Juego.js
const mongoose = require('mongoose');

const juegoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  plataforma: { type: String, required: true },
  categoria: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 }
});

module.exports = mongoose.model('Juego', juegoSchema);
