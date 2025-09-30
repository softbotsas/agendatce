const mongoose = require('mongoose');
const User = require('../src/models/Users');
const AgendaUser = require('../src/models/agenda.User');

// Conectar a MongoDB usando la misma configuración que sessionStore.js
const password = "r7ogqjJ7XyULgrZY";
const usuario = "bernstein";
const bd = "tucajaex";
const uri = `mongodb+srv://${usuario}:${password}@cluster0.ui39vqd.mongodb.net/${bd}?retryWrites=true&w=majority&appName=Cluster0`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function seedUsers() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(uri, options);
    console.log('✅ Conectado a MongoDB');

    // Limpiar usuarios existentes (opcional)
    await User.deleteMany({});
    await AgendaUser.deleteMany({});
    console.log('🧹 Usuarios existentes eliminados');

    // Crear usuarios del sistema principal
    const systemUsers = [
      {
        name: 'Laisa Rodriguez',
        correo: 'laisa@tce.com',
        password: '123456',
        celular: '1234567890',
        pais: 'Guatemala',
        estado: 'Guatemala',
        ciudad: 'Guatemala',
        perfil_usuario: 2, // Supervisor
        activo: true
      },
      {
        name: 'Alejandra Martinez',
        correo: 'alejandra@tce.com',
        password: '123456',
        celular: '0987654321',
        pais: 'Guatemala',
        estado: 'Guatemala',
        ciudad: 'Guatemala',
        perfil_usuario: 2, // Supervisor
        activo: true
      },
      {
        name: 'Yorman Admin',
        correo: 'yorman@tce.com',
        password: '123456',
        celular: '5555555555',
        pais: 'Guatemala',
        estado: 'Guatemala',
        ciudad: 'Guatemala',
        perfil_usuario: 1, // Admin
        activo: true
      }
    ];

    const createdSystemUsers = await User.insertMany(systemUsers);
    console.log('✅ Usuarios del sistema creados:', createdSystemUsers.length);

    // Crear usuarios de agenda
    const agendaUsers = [
      {
        nombre: 'Laisa Rodriguez',
        email: 'laisa@tce.com',
        user_id: createdSystemUsers[0]._id,
        color: '#28a745',
        activo: true
      },
      {
        nombre: 'Alejandra Martinez',
        email: 'alejandra@tce.com',
        user_id: createdSystemUsers[1]._id,
        color: '#dc3545',
        activo: true
      }
    ];

    const createdAgendaUsers = await AgendaUser.insertMany(agendaUsers);
    console.log('✅ Usuarios de agenda creados:', createdAgendaUsers.length);

    // Actualizar usuarios del sistema con la relación
    for (let i = 0; i < createdSystemUsers.length; i++) {
      if (i < createdAgendaUsers.length) {
        await User.findByIdAndUpdate(createdSystemUsers[i]._id, {
          agenda_user: createdAgendaUsers[i]._id,
          'agenda_info.nombre_agenda': createdAgendaUsers[i].nombre,
          'agenda_info.color': createdAgendaUsers[i].color
        });
      }
    }

    console.log('✅ Relaciones actualizadas');
    console.log('🎉 Seed completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el seed
seedUsers();



