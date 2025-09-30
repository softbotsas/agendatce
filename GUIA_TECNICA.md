# 🛠️ Guía Técnica - Sistema de Agenda TCE

## 🔧 **Configuración del Entorno**

### **Requisitos**
- Node.js 14+
- MongoDB 4.4+
- NPM o Yarn

### **Instalación**
```bash
# Clonar repositorio
git clone [url-del-repo]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env

# Iniciar servidor
npm start
```

### **Variables de Entorno**
```env
MONGODB_URI=mongodb://localhost:27017/nominatce
SESSION_SECRET=tu-secreto-aqui
PORT=3000
```

## 📊 **Modelos de Datos**

### **TaskDefinition**
```javascript
{
  title: String,                    // Título de la tarea
  description: String,              // Descripción
  periodicity: String,              // 'daily', 'weekly', 'monthly', 'biweekly'
  frequency: Number,                // Cuántas veces por período
  specific_days: [Number],          // Días específicos (0-6 para semana, 1-31 para mes)
  mode: String,                     // 'binary' o 'counter'
  target_per_period: Number,        // Meta por período
  sla_time: String,                 // Hora límite (HH:MM)
  requires_evidence: Boolean,       // Requiere evidencia
  tags: [ObjectId],                 // Referencias a etiquetas
  assignment_type: String,          // 'anyone' o 'specific'
  specific_user: ObjectId,          // Usuario específico
  active: Boolean,                  // Activa/inactiva
  created_by: ObjectId              // Usuario creador
}
```

### **Tag**
```javascript
{
  name: String,                     // Nombre único (slug)
  display_name: String,             // Nombre para mostrar
  description: String,              // Descripción
  color: String,                    // Color hexadecimal
  category: String,                 // Categoría
  usage_count: Number,              // Contador de uso
  active: Boolean,                  // Activa/inactiva
  created_by: ObjectId              // Usuario creador
}
```

### **User (Agenda)**
```javascript
{
  nombre: String,                   // Nombre del usuario
  email: String,                    // Email
  user_id: ObjectId,                // Referencia al usuario del sistema
  color: String,                    // Color del usuario
  activo: Boolean,                  // Activo/inactivo
  notificaciones: Boolean           // Recibir notificaciones
}
```

## 🚀 **APIs Disponibles**

### **Tareas**
- `GET /agenda/api/config/tasks` - Listar tareas
- `POST /agenda/api/config/tasks` - Crear tarea
- `PUT /agenda/api/config/tasks/:id` - Actualizar tarea
- `DELETE /agenda/api/config/tasks/:id` - Eliminar tarea

### **Etiquetas**
- `GET /agenda/api/config/tags` - Listar etiquetas
- `POST /agenda/api/config/tags` - Crear etiqueta
- `PUT /agenda/api/config/tags/:id` - Actualizar etiqueta
- `DELETE /agenda/api/config/tags/:id` - Eliminar etiqueta
- `GET /agenda/api/config/tag-categories` - Listar categorías

### **Usuarios**
- `GET /agenda/api/config/users` - Listar usuarios
- `POST /agenda/api/config/users` - Crear usuario
- `PUT /agenda/api/config/users/:id` - Actualizar usuario
- `DELETE /agenda/api/config/users/:id` - Eliminar usuario

## 🔄 **Flujos de Datos**

### **Crear Tarea**
1. Usuario llena formulario
2. JavaScript valida datos
3. Envía POST a `/agenda/api/config/tasks`
4. Controlador valida y guarda en BD
5. Retorna tarea creada con datos poblados
6. Frontend actualiza lista

### **Editar Tarea**
1. Usuario click en "Editar"
2. JavaScript carga datos de la tarea
3. Modal se auto-rellena
4. Usuario modifica datos
5. Envía PUT a `/agenda/api/config/tasks/:id`
6. Controlador actualiza en BD
7. Frontend actualiza lista

### **Gestionar Etiquetas**
1. Usuario crea/edita etiqueta
2. Envía POST/PUT a `/agenda/api/config/tags`
3. Controlador valida y guarda
4. Frontend actualiza lista de etiquetas
5. Etiquetas disponibles para tareas

## 🐛 **Debugging Común**

### **Problema: Etiquetas no se muestran**
```javascript
// Verificar populate en controlador
.populate({
  path: 'tags',
  model: 'agenda.Tag',
  select: 'name display_name color category',
  match: { active: true }
})
```

### **Problema: Auto-relleno no funciona**
```javascript
// Verificar que se llame clearTaskDefinitionForm() primero
clearTaskDefinitionForm();
// Luego llenar campos
document.getElementById('task_definition_title').value = task.title;
```

### **Problema: Frecuencia no se guarda**
```javascript
// Verificar que frequency esté en taskData
const taskData = {
  title,
  description,
  periodicity,
  frequency,  // ← Asegurar que esté incluido
  // ... otros campos
};
```

## 📝 **Scripts de Mantenimiento**

### **Verificar Datos**
```bash
# Verificar tareas
node scripts/check-task-data.js

# Verificar configuración
npm run check-config

# Verificar agenda
npm run check-agenda
```

### **Migrar Datos**
```bash
# Migrar etiquetas
npm run migrate-tags

# Asignar etiquetas automáticamente
npm run assign-tags

# Actualizar tareas existentes
node scripts/update-existing-tasks.js
```

### **Limpiar Datos**
```bash
# Limpiar datos de agenda
npm run clean-agenda

# Limpiar usuarios problemáticos
node scripts/clean-bad-users.js
```

## 🔍 **Monitoreo**

### **Logs del Servidor**
- Revisar consola del terminal
- Verificar errores de MongoDB
- Monitorear respuestas HTTP

### **Base de Datos**
```javascript
// Verificar conexión
mongoose.connection.on('connected', () => {
  console.log('✅ Conexión exitosa a MongoDB');
});

// Verificar errores
mongoose.connection.on('error', (err) => {
  console.error('❌ Error de MongoDB:', err);
});
```

### **Frontend**
```javascript
// Verificar errores en consola del navegador
console.error('Error:', error);

// Verificar datos cargados
console.log('Datos cargados:', data);
```

## 🚨 **Solución de Problemas**

### **Error: Cannot find module 'index'**
- Verificar que el archivo se llame `index.ejs`
- Verificar ruta en `res.render('agenda/index')`

### **Error: Redeclaración de variable**
- Buscar variables duplicadas con `const` o `let`
- Usar nombres únicos para variables

### **Error: Populate no funciona**
- Verificar que el modelo esté registrado
- Usar `model: 'agenda.Tag'` explícitamente
- Verificar que las referencias sean ObjectIds válidos

### **Error: Puerto en uso**
```bash
# Encontrar proceso
netstat -ano | findstr :3000

# Terminar proceso
taskkill /PID [PID] /F
```

## 📚 **Recursos Adicionales**

### **Documentación**
- [Mongoose](https://mongoosejs.com/docs/)
- [Express](https://expressjs.com/)
- [EJS](https://ejs.co/)
- [Bootstrap 5](https://getbootstrap.com/)

### **Herramientas**
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Postman](https://www.postman.com/) para probar APIs
- [VS Code](https://code.visualstudio.com/) con extensiones de Node.js

---

**Mantenido por**: Equipo de Desarrollo TCE  
**Última actualización**: Diciembre 2024







