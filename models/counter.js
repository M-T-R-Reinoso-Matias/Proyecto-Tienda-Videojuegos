const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  entidad: { type: String, required: true, unique: true },
  secuencia: { type: Number, default: 0 }
});

module.exports = mongoose.models.Counter || mongoose.model('Counter', counterSchema);