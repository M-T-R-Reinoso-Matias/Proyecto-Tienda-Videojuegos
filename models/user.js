// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre:   String,
  email:    { type: String, unique: true },
  password: String,
  rol:      { type: String, enum: ['visitante', 'cliente', 'admin'], default: 'cliente' }
});

// Aquí haces hash solo cuando se crea o modifica la contraseña
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.models.User || mongoose.model('user', userSchema);



