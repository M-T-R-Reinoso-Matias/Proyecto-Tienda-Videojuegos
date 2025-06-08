const mongoose = require('mongoose');
const User = require('./models/user'); // Ajusta la ruta si es diferente

mongoose.connect('mongodb://localhost:27017/tienda_virtual', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function crearAdmin() {
  const email = 'admin@admin.com';
  const password = 'admin123';

  const yaExiste = await User.findOne({ email });
  if (yaExiste) {
    console.log('⚠️ El usuario admin ya existe');
    return mongoose.disconnect();
  }

  const admin = new User({
    nombre: 'Administrador',
    email,
    password,
    rol: 'admin'
  });

  await admin.save();
  console.log('✅ Usuario admin creado con éxito');
  mongoose.disconnect();
}

crearAdmin();
