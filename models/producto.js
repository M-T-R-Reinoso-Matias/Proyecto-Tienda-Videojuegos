// models/producto.js
const mongoose = require('mongoose');
const Counter = require('./counter');

const ProductoSchema = new mongoose.Schema({
  id_producto: { type: String, unique: true },
  nombre:      { type: String, required: true },
  precio:      { type: Number, required: true, min: 0 },
  categoria:   { type: String, default: '' },
  stock:       { type: Number, default: 0, min: 0 }
}, { versionKey: false }, { timestamps: true },); // Para tener createdAt y updatedAt

// Middleware pre-save para generar ID secuencial
ProductoSchema.pre('save', async function(next) {
  // Solo genera si es un documento nuevo
  if (this.isNew && !this.id_producto) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { entidad: 'producto' },
        { $inc: { secuencia: 1 } },
        { new: true, upsert: true } // Si no existe, lo crea
      );
      this.id_producto = `PROD${counter.secuencia.toString().padStart(4, '0')}`; // ejemplo: PROD0001
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.models.Producto || mongoose.model('Producto', ProductoSchema);


