const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuración para MongoDB local
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agenda_tce';

// Opciones de conexión
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // autoIndex: process.env.NODE_ENV !== 'production', // Habilita autoIndex solo en desarrollo
};

// Conecta a MongoDB si no está conectado ya
if (mongoose.connection.readyState === 0) {
  mongoose.connect(uri, options)
    .then(() => console.log('✅ Conexión exitosa a MongoDB local para sesiones'))
    .catch(err => console.error('❌ Error de conexión a MongoDB local para sesiones:', err));
}

// Crea el almacén de sesiones
const sessionStore = MongoStore.create({
  mongoUrl: uri,
  collectionName: 'sessions', // Nombre de la colección donde se almacenarán las sesiones
  ttl: 14 * 24 * 60 * 60, // Tiempo de vida de la sesión en segundos (14 días)
  autoRemove: 'native', // Dejar que MongoDB maneje la eliminación de sesiones expiradas
});

module.exports = sessionStore;
