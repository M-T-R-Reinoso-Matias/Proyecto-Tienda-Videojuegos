// models/cliente.js
const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
 id_cliente: { type: String, required: true, unique: true },
  usuario:   { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
  nombre:    { type: String, required: true },
  correo:    { type: String, required: true, unique: true, match: /.+@.+\..+/ },
  telefono:  { type: String },
  direccion: { type: String }
});

module.exports = mongoose.models.Cliente || mongoose.model('Cliente', ClienteSchema);
