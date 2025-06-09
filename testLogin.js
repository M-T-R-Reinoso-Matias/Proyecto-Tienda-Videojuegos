const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user'); // Ajusta la ruta

mongoose.connect('mongodb://localhost:27017/tienda_virtual', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const email = 'matias@correo.com';
  const password = 'admin'; // la que usas para probar
  
  const user = await User.findOne({ email });
  if (!user) {
    console.log('Usuario no encontrado');
    return process.exit(0);
  }
  
  const match = await bcrypt.compare(password, user.password);
  if (match) {
    console.log('Contraseña correcta');
  } else {
    console.log('Contraseña incorrecta');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
});
