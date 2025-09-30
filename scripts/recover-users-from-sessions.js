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

async function recoverUsersFromSessions() {
  try {
    await mongoose.connect(uri, options);
    console.log('✅ Conectado a MongoDB');

    // Obtener todas las sesiones
    const sessions = mongoose.connection.db.collection('sessions');
    const allSessions = await sessions.find({}).toArray();
    
    console.log(`📊 Total sesiones encontradas: ${allSessions.length}`);

    // Extraer usuarios únicos de las sesiones
    const usersFromSessions = new Map();
    
    allSessions.forEach(session => {
      try {
        if (session.session) {
          const sessionData = JSON.parse(session.session);
          if (sessionData.usuario) {
            const user = sessionData.usuario;
            const userId = user._id;
            
            if (!usersFromSessions.has(userId)) {
              usersFromSessions.set(userId, {
                _id: user._id,
                name: user.name,
                correo: user.correo,
                password: user.password,
                celular: user.celular,
                telefono: user.telefono,
                direccion: user.direccion,
                pais: user.pais,
                estado: user.estado,
                ciudad: user.ciudad,
                perfil_usuario: user.perfil_usuario,
                tipo_impre: user.tipo_impre,
                cargo: user.cargo,
                agencia: user.agencia,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                activo: true
              });
            }
          }
        }
      } catch (error) {
        // Ignorar sesiones con formato incorrecto
      }
    });

    console.log(`\n👥 USUARIOS ÚNICOS ENCONTRADOS EN SESIONES: ${usersFromSessions.size}`);
    
    const usersArray = Array.from(usersFromSessions.values());
    usersArray.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.correo}) - ID: ${user._id}`);
    });

    // Verificar cuáles ya existen en la colección users
    console.log('\n🔍 VERIFICANDO USUARIOS EXISTENTES...');
    const existingUsers = await User.find({});
    const existingUserIds = existingUsers.map(u => u._id.toString());
    
    console.log(`📊 Usuarios existentes en colección 'users': ${existingUsers.length}`);
    existingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.correo}) - ID: ${user._id}`);
    });

    // Identificar usuarios que faltan
    const missingUsers = usersArray.filter(user => 
      !existingUserIds.includes(user._id.toString())
    );

    console.log(`\n❌ USUARIOS FALTANTES: ${missingUsers.length}`);
    missingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.correo}) - ID: ${user._id}`);
    });

    if (missingUsers.length > 0) {
      console.log('\n🚀 RECUPERANDO USUARIOS FALTANTES...');
      
      for (const userData of missingUsers) {
        try {
          // Crear el usuario con el ID original
          const newUser = new User({
            _id: userData._id,
            name: userData.name,
            correo: userData.correo,
            password: userData.password,
            celular: userData.celular,
            telefono: userData.telefono,
            direccion: userData.direccion,
            pais: userData.pais,
            estado: userData.estado,
            ciudad: userData.ciudad,
            perfil_usuario: userData.perfil_usuario,
            tipo_impre: userData.tipo_impre,
            cargo: userData.cargo,
            agencia: userData.agencia,
            activo: true
          });

          // Guardar sin validar el password (ya está hasheado)
          await newUser.save({ validateBeforeSave: false });
          console.log(`✅ Recuperado: ${userData.name} (${userData.correo})`);
        } catch (error) {
          console.log(`❌ Error recuperando ${userData.name}: ${error.message}`);
        }
      }

      console.log('\n🎉 RECUPERACIÓN COMPLETADA');
      
      // Verificar el resultado final
      const finalUsers = await User.find({});
      console.log(`\n📊 USUARIOS FINALES EN LA COLECCIÓN: ${finalUsers.length}`);
      finalUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.correo}) - Activo: ${user.activo}`);
      });
    } else {
      console.log('\n✅ Todos los usuarios ya están en la colección');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

recoverUsersFromSessions();



