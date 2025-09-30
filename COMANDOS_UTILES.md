# 🚀 Comandos Útiles - Sistema de Agenda TCE

## 🏃‍♂️ **Comandos de Desarrollo**

### **Iniciar Servidor**
```bash
# Iniciar servidor de desarrollo
npm start

# Iniciar con nodemon (auto-reload)
npm run dev
```

### **Verificar Estado**
```bash
# Verificar configuración
npm run check-config

# Verificar datos de agenda
npm run check-agenda

# Verificar datos de tareas
node scripts/check-task-data.js
```

## 🗄️ **Comandos de Base de Datos**

### **Seeding (Poblar Datos)**
```bash
# Poblar datos de agenda
npm run seed-agenda

# Crear etiquetas predefinidas
npm run seed-tags

# Asignar etiquetas automáticamente
npm run assign-tags
```

### **Migración**
```bash
# Migrar etiquetas existentes
npm run migrate-tags

# Actualizar tareas existentes
node scripts/update-existing-tasks.js
```

### **Limpieza**
```bash
# Limpiar datos de agenda
npm run clean-agenda

# Limpiar usuarios problemáticos
node scripts/clean-bad-users.js
```

## 🔍 **Comandos de Debugging**

### **Verificar Conexión**
```bash
# Verificar conexión a MongoDB
node scripts/check-database.js

# Verificar logs de MongoDB
node scripts/check-mongodb-logs.js
```

### **Verificar Datos**
```bash
# Verificar usuarios
node scripts/check-all-users.js

# Verificar tareas
node scripts/check-tasks.js

# Verificar configuración
node scripts/check-config.js
```

### **Scripts de Emergencia**
```bash
# Verificación completa de usuarios
node scripts/emergency-check-users.js

# Recuperar usuarios faltantes
node scripts/recover-all-missing-users.js

# Verificación completa del sistema
node scripts/test-agenda-system.js
```

## 🛠️ **Comandos de Mantenimiento**

### **Backup y Restauración**
```bash
# Crear backup de MongoDB
mongodump --db nominatce --out backup/

# Restaurar desde backup
mongorestore --db nominatce backup/nominatce/
```

### **Limpieza de Puerto**
```bash
# Encontrar proceso usando puerto 3000
netstat -ano | findstr :3000

# Terminar proceso (reemplazar PID)
taskkill /PID [PID] /F
```

### **Verificar Procesos**
```bash
# Ver procesos de Node.js
tasklist | findstr node

# Ver procesos de MongoDB
tasklist | findstr mongod
```

## 📊 **Comandos de Monitoreo**

### **Logs del Servidor**
```bash
# Ver logs en tiempo real
npm start

# Ver logs con más detalle
DEBUG=* npm start
```

### **Verificar APIs**
```bash
# Probar endpoint de tareas
curl http://localhost:3000/agenda/api/config/tasks

# Probar endpoint de etiquetas
curl http://localhost:3000/agenda/api/config/tags

# Probar endpoint de usuarios
curl http://localhost:3000/agenda/api/config/users
```

## 🔧 **Comandos de Desarrollo**

### **Instalar Dependencias**
```bash
# Instalar dependencias
npm install

# Instalar dependencia específica
npm install [nombre-paquete]

# Instalar como dependencia de desarrollo
npm install --save-dev [nombre-paquete]
```

### **Scripts Personalizados**
```bash
# Ejecutar script personalizado
node scripts/[nombre-script].js

# Ejecutar con variables de entorno
NODE_ENV=development node scripts/[nombre-script].js
```

## 🚨 **Comandos de Emergencia**

### **Reiniciar Todo**
```bash
# 1. Terminar procesos
taskkill /F /IM node.exe
taskkill /F /IM mongod.exe

# 2. Limpiar datos si es necesario
npm run clean-agenda

# 3. Re-seedear datos
npm run seed-agenda
npm run seed-tags
npm run assign-tags

# 4. Iniciar servidor
npm start
```

### **Recuperar Sistema**
```bash
# Verificar estado general
npm run check-agenda

# Si hay problemas, limpiar y re-seedear
npm run clean-agenda
npm run seed-agenda
npm run seed-tags
npm run assign-tags

# Verificar que todo funcione
npm run check-agenda
```

## 📝 **Comandos de Documentación**

### **Generar Documentación**
```bash
# Ver estructura del proyecto
tree /f

# Ver archivos modificados
git status

# Ver historial de commits
git log --oneline
```

### **Verificar Archivos**
```bash
# Verificar sintaxis de archivos
node -c src/models/agenda.TaskDefinition.js
node -c src/controllers/agenda/agenda.configController.js

# Verificar package.json
npm list
```

## 🔄 **Comandos de Actualización**

### **Actualizar Dependencias**
```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update

# Actualizar dependencia específica
npm install [nombre-paquete]@latest
```

### **Actualizar Base de Datos**
```bash
# Actualizar esquemas existentes
node scripts/update-existing-tasks.js

# Migrar datos
npm run migrate-tags
npm run assign-tags
```

## 📋 **Checklist de Verificación**

### **Antes de Desarrollar**
- [ ] `npm start` funciona
- [ ] Base de datos conectada
- [ ] APIs responden correctamente
- [ ] No hay errores en consola

### **Después de Cambios**
- [ ] `npm run check-agenda` pasa
- [ ] No hay errores de JavaScript
- [ ] Formularios funcionan correctamente
- [ ] Auto-relleno funciona en edición

### **Antes de Commit**
- [ ] Código probado localmente
- [ ] No hay errores de linting
- [ ] Documentación actualizada
- [ ] Scripts de verificación pasan

---

**💡 Tip**: Usa `Ctrl+C` para detener cualquier comando en ejecución

**⚠️ Advertencia**: Siempre haz backup antes de ejecutar comandos de limpieza

**📚 Referencia**: Consulta `GUIA_TECNICA.md` para más detalles técnicos







