const mongoose = require('mongoose');
const User = require('../src/models/Users');
const AgendaUser = require('../src/models/agenda.User');

// Conectar a MongoDB
const password = "r7ogqjJ7XyULgrZY";
const usuario = "bernstein";
const bd = "tucajaex";
const uri = `mongodb+srv://${usuario}:${password}@cluster0.ui39vqd.mongodb.net/${bd}?retryWrites=true&w=majority&appName=Cluster0`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function checkUsers() {
  try {
    await mongoose.connect(uri, options);
    console.log('✅ Conectado a MongoDB');

    // Verificar usuarios del sistema principal
    const systemUsers = await User.find({});
    console.log(`\n👥 USUARIOS DEL SISTEMA PRINCIPAL: ${systemUsers.length}`);
    systemUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.correo}) - Activo: ${user.activo}`);
    });

    // Verificar usuarios de agenda
    const agendaUsers = await AgendaUser.find({});
    console.log(`\n📋 USUARIOS DE AGENDA: ${agendaUsers.length}`);
    agendaUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nombre} (${user.email}) - Activo: ${user.activo}`);
    });

    // Verificar si hay usuarios desactivados
    const inactiveSystemUsers = await User.find({ activo: false });
    console.log(`\n❌ USUARIOS DESACTIVADOS DEL SISTEMA: ${inactiveSystemUsers.length}`);
    inactiveSystemUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.correo}) - Desactivado`);
    });

    const inactiveAgendaUsers = await AgendaUser.find({ activo: false });
    console.log(`\n❌ USUARIOS DESACTIVADOS DE AGENDA: ${inactiveAgendaUsers.length}`);
    inactiveAgendaUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nombre} (${user.email}) - Desactivado`);
    });

    // Verificar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📁 COLECCIONES EN LA BASE DE DATOS:`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();



