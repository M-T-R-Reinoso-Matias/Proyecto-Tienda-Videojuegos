// models/Juego.js
const mongoose = require('mongoose');
const Counter  = require('./counter');

const juegoSchema = new mongoose.Schema({
  id_juego: { type: String, unique: true },
  nombre: { type: String, unique: true },
  plataforma: { type: String, required: true },
  categoria: { type: String, required: true },
  precio:    { type: Number, required: true, min: 0 },
  stock:     { type: Number, required: true, min: 0 }
}, { versionKey: false },);

juegoSchema.pre('save', async function (next) { // 🔍 Aquí estaba el error
  if (!this.id_juego) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { entidad: 'juego' },
        { $inc: { secuencia: 1 } },
        { new: true, upsert: true } // crea si no existe
      );
      this.id_juego = `JUEG${counter.secuencia.toString().padStart(4, '0')}`; // JUEG0001
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.models.Juego || mongoose.model('Juego', juegoSchema);

