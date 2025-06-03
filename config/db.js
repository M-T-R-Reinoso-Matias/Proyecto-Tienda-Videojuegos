const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    await mongoose.connect(mongoURI); // sin opciones obsoletas
    console.log('✅ MongoDB conectado correctamente.');
    console.log(`🔗 URL de conexión: ${mongoURI}`);
  } catch (err) {
    console.error('❌ Error al conectar con MongoDB:', err.message);
    console.error(`🔗 Verifica la URL: ${mongoURI}`);
    process.exit(1);
  }
};

module.exports = connectDB;
