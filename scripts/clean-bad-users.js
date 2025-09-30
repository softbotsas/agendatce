const mongoose = require('mongoose');
const User = require('../src/models/Users');

// Conectar a MongoDB
const password = "r7ogqjJ7XyULgrZY";
const usuario = "bernstein";
const bd = "tucajaex";
const uri = `mongodb+srv://${usuario}:${password}@cluster0.ui39vqd.mongodb.net/${bd}?retryWrites=true&w=majority&appName=Cluster0`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function cleanBadUsers() {
  try {
    await mongoose.connect(uri, options);
    console.log('✅ Conectado a MongoDB');

    // 1. Identificar usuarios mal creados (que empiezan con "Usuario ")
    const badUsers = await User.find({
      name: { $regex: /^Usuario / }
    });
    
    console.log(`🗑️ Usuarios mal creados encontrados: ${badUsers.length}`);
    
    if (badUsers.length === 0) {
      console.log('✅ No hay usuarios mal creados que eliminar');
      return;
    }

    // 2. Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de usuarios mal creados:');
    badUsers.slice(0, 10).forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.correo}) - ID: ${user._id}`);
    });

    // 3. Eliminar usuarios mal creados
    console.log('\n🗑️ Eliminando usuarios mal creados...');
    const deleteResult = await User.deleteMany({
      name: { $regex: /^Usuario / }
    });
    
    console.log(`✅ Usuarios eliminados: ${deleteResult.deletedCount}`);

    // 4. Verificar usuarios restantes
    const remainingUsers = await User.find({});
    console.log(`\n📊 Usuarios restantes: ${remainingUsers.length}`);
    
    console.log('\n👥 Usuarios restantes:');
    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.correo}) - Agencia: ${user.agencia || 'Sin agencia'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

cleanBadUsers();



