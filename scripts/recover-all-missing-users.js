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

async function recoverAllMissingUsers() {
  try {
    await mongoose.connect(uri, options);
    console.log('✅ Conectado a MongoDB');

    // 1. Obtener usuarios existentes
    const existingUsers = await User.find({});
    const existingUserIds = existingUsers.map(u => u._id.toString());
    console.log(`📊 Usuarios existentes: ${existingUsers.length}`);

    // 2. Obtener usuarios únicos de activitylogs
    const activityLogs = mongoose.connection.db.collection('activitylogs');
    const uniqueActivityUserIds = await activityLogs.distinct('user_id');
    console.log(`📊 Usuarios únicos en activitylogs: ${uniqueActivityUserIds.length}`);

    // 3. Identificar usuarios faltantes
    const missingUserIds = uniqueActivityUserIds.filter(userId => 
      !existingUserIds.includes(userId.toString())
    );
    console.log(`❌ Usuarios faltantes: ${missingUserIds.length}`);

    if (missingUserIds.length === 0) {
      console.log('✅ No hay usuarios faltantes');
      return;
    }

    // 4. Obtener información de los usuarios faltantes desde activitylogs
    console.log('\n🔍 OBTENIENDO INFORMACIÓN DE USUARIOS FALTANTES...');
    const userInfoMap = new Map();
    
    // Procesar en lotes para evitar timeout
    const batchSize = 100;
    for (let i = 0; i < missingUserIds.length; i += batchSize) {
      const batch = missingUserIds.slice(i, i + batchSize);
      
      for (const userId of batch) {
        try {
          // Obtener la última actividad del usuario para extraer información
          const lastActivity = await activityLogs.findOne(
            { user_id: userId },
            { sort: { created_at: -1 } }
          );
          
          if (lastActivity) {
            // Extraer información básica del usuario
            const userInfo = {
              _id: userId,
              name: `Usuario ${userId.slice(-6)}`, // Nombre temporal
              correo: `usuario${userId.slice(-6)}@tucajaexpress.com`, // Email temporal
              password: 'password123', // Password temporal
              celular: '0000000000',
              telefono: '0000000000',
              direccion: 'Dirección no especificada',
              pais: '55', // Guatemala por defecto
              estado: '784', // Guatemala por defecto
              ciudad: '96027', // Guatemala por defecto
              perfil_usuario: 3, // Empleado por defecto
              tipo_impre: 1, // Persona Natural por defecto
              activo: true,
              last_activity: lastActivity.created_at
            };
            
            userInfoMap.set(userId, userInfo);
          }
        } catch (error) {
          console.log(`❌ Error obteniendo info para ${userId}: ${error.message}`);
        }
      }
      
      console.log(`📊 Procesados ${Math.min(i + batchSize, missingUserIds.length)} de ${missingUserIds.length} usuarios`);
    }

    console.log(`\n📊 USUARIOS CON INFORMACIÓN EXTRAÍDA: ${userInfoMap.size}`);

    // 5. Crear usuarios faltantes
    console.log('\n🚀 CREANDO USUARIOS FALTANTES...');
    let createdCount = 0;
    let errorCount = 0;

    for (const [userId, userInfo] of userInfoMap) {
      try {
        const newUser = new User({
          _id: userInfo._id,
          name: userInfo.name,
          correo: userInfo.correo,
          password: userInfo.password,
          celular: userInfo.celular,
          telefono: userInfo.telefono,
          direccion: userInfo.direccion,
          pais: userInfo.pais,
          estado: userInfo.estado,
          ciudad: userInfo.ciudad,
          perfil_usuario: userInfo.perfil_usuario,
          tipo_impre: userInfo.tipo_impre,
          activo: userInfo.activo
        });

        // Guardar sin validar el password (ya está hasheado)
        await newUser.save({ validateBeforeSave: false });
        createdCount++;
        
        if (createdCount % 50 === 0) {
          console.log(`✅ Creados ${createdCount} usuarios...`);
        }
      } catch (error) {
        errorCount++;
        if (errorCount % 10 === 0) {
          console.log(`❌ Errores: ${errorCount} usuarios...`);
        }
      }
    }

    console.log(`\n🎉 RECUPERACIÓN COMPLETADA:`);
    console.log(`✅ Usuarios creados: ${createdCount}`);
    console.log(`❌ Errores: ${errorCount}`);

    // 6. Verificar resultado final
    const finalUsers = await User.find({});
    console.log(`\n📊 TOTAL USUARIOS FINALES: ${finalUsers.length}`);

    // 7. Mostrar algunos usuarios creados
    console.log('\n👥 ALGUNOS USUARIOS CREADOS:');
    const recentUsers = await User.find({}).sort({ _id: -1 }).limit(10);
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.correo}) - ID: ${user._id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

recoverAllMissingUsers();



