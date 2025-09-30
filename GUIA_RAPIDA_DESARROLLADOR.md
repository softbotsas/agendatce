# ⚡ Guía Rápida para Desarrolladores - Sistema Agenda TCE

## 🚀 **Inicio Rápido**

### **1. Configuración del Entorno**
```bash
# Clonar y configurar
git clone [repositorio]
cd agendatce
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con MongoDB URI

# Iniciar servidor
npm start
# Acceder a: http://localhost:3000/agenda/
```

### **2. Estructura Rápida**
```
src/
├── controllers/agenda/    # Controladores (req/res)
├── services/agenda/       # Lógica de negocio
├── models/               # Esquemas MongoDB
├── views/agenda/         # Vistas EJS
└── router/               # Rutas API
```

---

## 🔧 **Comandos Esenciales**

### **Desarrollo**
```bash
npm start                 # Iniciar servidor
taskkill /f /im node.exe  # Matar procesos Node.js
npm run dev              # Modo desarrollo (si existe)
```

### **Base de Datos**
```bash
# Scripts útiles en /scripts
node scripts/check-agenda-data.js    # Verificar datos
node scripts/seed-users.js          # Crear usuarios
node scripts/import-tasks.js        # Importar tareas
```

---

## 📋 **Checklist de Desarrollo**

### **Antes de Modificar Código:**
- [ ] **Revisar documentación** en `/DOCUMENTACION_TECNICA_AGENDA.md`
- [ ] **Verificar problemas conocidos** en `/PROBLEMAS_RESUELTOS_Y_SOLUCIONES.md`
- [ ] **Entender estructura** de datos actual
- [ ] **Probar sistema** funcionando antes de cambios

### **Al Modificar Servicios:**
- [ ] **Mantener mapeo** de campos de usuario (`name` vs `nombre`)
- [ ] **Validar ObjectIds** antes de consultas MongoDB
- [ ] **Usar populate explícito** con modelo especificado
- [ ] **Retornar estructura** `{ success: true, data: result }`

### **Al Modificar Frontend:**
- [ ] **Usar campos correctos** (`user._id`, `user.name || user.nombre`)
- [ ] **Manejar estados** de carga con async/await
- [ ] **Validar datos** antes de mostrar en UI
- [ ] **Probar login** después de cambios

---

## 🔐 **Flujo de Autenticación**

### **1. Login**
```
GET /agenda/auth/available-users  → Lista usuarios
POST /agenda/auth/login           → Seleccionar usuario
GET /agenda/                      → Dashboard (requiere auth)
```

### **2. Middleware de Autenticación**
```javascript
// En agenda.router.js
router.use('/api', authenticateToken);  // Proteger APIs
router.use('/', authenticateToken);     // Proteger rutas principales
```

### **3. Estructura de Usuario**
```javascript
// Modelo BD
{ nombre: "Laisa", email: "laisa@tce.com", cargo: "Líder" }

// Mapeo Frontend
{ name: "Laisa", nombre: "Laisa", correo: "laisa@tce.com" }
```

---

## 📊 **Modelos de Datos Clave**

### **Usuario (agenda.User)**
```javascript
{
  _id: ObjectId,
  nombre: String,        // Campo principal
  email: String,         // Email
  cargo: String,         // Cargo/posición
  perfil_usuario: Number, // 1=Admin, 2=Supervisor, 3=Empleado
  activo: Boolean
}
```

### **Tarea (agenda.TaskDefinition)**
```javascript
{
  _id: ObjectId,
  title: String,
  mode: String,          // "binary" | "counter"
  periodicity: String,   // "daily" | "weekly" | "monthly"
  assigned_users: [ObjectId],  // Usuarios asignados
  specific_user: ObjectId,     // Usuario específico
  activo: Boolean
}
```

### **Log (agenda.TaskLog)**
```javascript
{
  _id: ObjectId,
  task_assignment: ObjectId,
  user: ObjectId,
  action_type: String,   // "completed" | "increment"
  value: Number,
  comment: String,
  log_date: Date
}
```

---

## 🛠️ **APIs Principales**

### **Autenticación**
```bash
GET  /agenda/auth/available-users    # Usuarios disponibles
POST /agenda/auth/login              # Login
POST /agenda/auth/logout             # Logout
GET  /agenda/auth/current-user       # Usuario actual
```

### **Tareas**
```bash
GET  /agenda/api/tasks/today         # Tareas del día
GET  /agenda/api/tasks/overdue       # Tareas atrasadas
POST /agenda/api/tasks/complete      # Completar tarea
POST /agenda/api/tasks/increment     # Incrementar contador
POST /agenda/api/tasks/not-applicable # No aplica
POST /agenda/api/tasks/retroactive   # Completar retroactivo
```

### **Dashboard**
```bash
GET  /agenda/api/dashboard/stats     # Estadísticas
GET  /agenda/api/dashboard/weekly    # Tareas semanales
GET  /agenda/api/activity/recent     # Actividad reciente
GET  /agenda/api/history             # Historial completo
```

---

## ⚠️ **Problemas Comunes y Soluciones**

### **1. "Usuario no encontrado" en login**
```javascript
// ❌ Problema: user.id no existe
onclick="selectUser('${user.id}')"

// ✅ Solución: usar user._id
onclick="selectUser('${user._id}')"
```

### **2. Campos undefined en UI**
```javascript
// ❌ Problema: campos incorrectos
user.email, user.roleText

// ✅ Solución: campos correctos
user.correo, user.role_name
```

### **3. "Usuario eliminado" en historial**
```javascript
// ❌ Problema: populate sin modelo
.populate('user', 'nombre email')

// ✅ Solución: especificar modelo
.populate('user', 'nombre email', 'agenda.User')
```

### **4. Error 500 en APIs**
```javascript
// ❌ Problema: retornar array directamente
return mappedUsers;

// ✅ Solución: estructura esperada
return { success: true, data: mappedUsers };
```

---

## 🎯 **Patrones de Código**

### **Servicio de Usuario**
```javascript
// Mapeo estándar
const mapUser = (user) => ({
  _id: user._id,
  name: user.nombre,        // Compatibilidad frontend
  nombre: user.nombre,      // Campo original
  correo: user.email,       // Compatibilidad frontend
  cargo: user.cargo,
  perfil_usuario: user.perfil_usuario,
  activo: user.activo
});
```

### **Validación de ObjectId**
```javascript
// Validar antes de consultas
if (!mongoose.Types.ObjectId.isValid(id)) {
  throw new Error('ID inválido');
}
```

### **Populate Explícito**
```javascript
// Especificar modelo siempre
.populate('user', 'nombre email', 'agenda.User')
.populate({
  path: 'task_assignment',
  populate: {
    path: 'user',
    select: 'nombre email',
    model: 'agenda.User'
  }
})
```

### **Respuesta de API**
```javascript
// Estructura estándar
res.json({
  success: true,
  data: result,
  message: "Operación exitosa"
});
```

---

## 🔍 **Debugging Rápido**

### **Logs del Servidor**
```bash
# Buscar logs específicos
🔍 - Inicio de función
✅ - Operación exitosa
❌ - Error encontrado
⚠️ - Advertencia
```

### **Verificar Login**
1. Acceder a `/agenda/login`
2. Verificar que cargan usuarios
3. Seleccionar usuario y login
4. Verificar redirect a dashboard

### **Verificar APIs**
```bash
# Probar endpoints críticos
curl -X GET http://localhost:3000/agenda/auth/available-users
curl -X GET http://localhost:3000/agenda/api/tasks/today
```

### **Verificar Base de Datos**
```bash
# Scripts de verificación
node scripts/check-agenda-data.js
node scripts/check-users.js
```

---

## 📚 **Recursos Adicionales**

### **Documentación Completa**
- `DOCUMENTACION_TECNICA_AGENDA.md` - Arquitectura completa
- `PROBLEMAS_RESUELTOS_Y_SOLUCIONES.md` - Problemas y soluciones
- `README.md` - Información general del proyecto

### **Archivos Críticos**
- `src/services/agenda/agenda.userService.js` - Lógica de usuarios
- `src/services/agenda/agenda.taskService.js` - Lógica de tareas
- `src/controllers/agenda/agenda.authController.js` - Autenticación
- `src/views/agenda/login.ejs` - Vista de login
- `src/views/agenda/main.ejs` - Layout principal

---

## 🚨 **Reglas de Oro**

1. **NUNCA** modificar campos de usuario sin actualizar mapeo
2. **SIEMPRE** validar ObjectIds antes de consultas MongoDB
3. **SIEMPRE** especificar modelo en populate
4. **SIEMPRE** probar login después de cambios críticos
5. **SIEMPRE** mantener compatibilidad entre frontend y backend

---

**📅 Última actualización:** Diciembre 2024  
**🎯 Objetivo:** Desarrollo rápido y sin errores  
**✅ Estado:** Sistema estable y documentado
