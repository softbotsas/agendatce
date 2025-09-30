const mongoose = require('mongoose');
const AgendaTaskDefinition = require('../src/models/agenda.TaskDefinition');
const AgendaTaskAssignment = require('../src/models/agenda.TaskAssignment');
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

async function seedTasks() {
  try {
    await mongoose.connect(uri, options);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await AgendaTaskDefinition.deleteMany({});
    await AgendaTaskAssignment.deleteMany({});
    console.log('🧹 Datos existentes eliminados');

    console.log('🎉 Seed completado!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedTasks();