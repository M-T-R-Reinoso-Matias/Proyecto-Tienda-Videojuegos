const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  entidad: { 
    type: String, 
    required: [true, 'La entidad es obligatoria.'], 
    unique: true,
    trim: true 
  },
  secuencia: { 
    type: Number, 
    default: 0, 
    min: [0, 'La secuencia no puede ser negativa.'] 
  }
}, {
  versionKey: false // elimina __v de los documentos
});

module.exports = mongoose.models.Counter || mongoose.model('Counter', counterSchema);
