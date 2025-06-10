// models/cliente.js
const mongoose = require('mongoose');
const Counter = require('./counter');

const ClienteSchema = new mongoose.Schema({
  id_cliente: {
    type: String,
    unique: true
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    match: /.+@.+\..+/
  },
  telefono: {
    type: String
  },
  direccion: {
    type: String
  }
}, { versionKey: false });

ClienteSchema.pre('save', async function(next) {
  if (!this.id_cliente) { // Solo si aún no tiene ID asignado
    try {
      const counter = await Counter.findOneAndUpdate(
        { entidad: 'cliente' },
        { $inc: { secuencia: 1 } },
        { new: true, upsert: true }
      );
      this.id_cliente = `CLI${counter.secuencia.toString().padStart(4, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.models.Cliente || mongoose.model('Cliente', ClienteSchema);

