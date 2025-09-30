# Sistema de Agenda - TCE Nómina

## 📋 Descripción

Sistema de gestión de tareas y agenda para el proyecto TCE Nómina. Permite crear, asignar y hacer seguimiento de tareas con diferentes periodicidades (diaria, semanal, mensual, etc.).

## 🏗️ Arquitectura

### Modelos de Datos

1. **AgendaUser** - Usuarios del sistema de agenda
2. **TaskDefinition** - Definiciones de tareas (plantillas)
3. **TaskAssignment** - Asignaciones de tareas a usuarios
4. **TaskLog** - Logs de actividad de las tareas

### Servicios

1. **TaskService** - Gestión de tareas
2. **KPIService** - Cálculo de métricas y KPIs
3. **ImportService** - Importación de tareas desde CSV

## 🚀 Configuración Inicial

### 1. Configurar MongoDB Local

Asegúrate de que MongoDB esté corriendo localmente:

```bash
# En Windows
net start MongoDB

# O ejecutar manualmente
mongod
```

### 2. Crear archivo .env

```bash
cp env.example .env
```

### 3. Poblar la base de datos con datos de prueba

```bash
# Limpiar datos existentes (opcional)
npm run clean-agenda

# Poblar con datos de prueba
npm run seed-agenda

# Verificar que los datos se crearon correctamente
npm run check-agenda

# Probar el sistema
npm run test-agenda
```

## 📊 Datos de Prueba

El script de seed crea:

- **6 usuarios falsos** con diferentes configuraciones
- **41 tareas** importadas desde el CSV
- **Asignaciones aleatorias** de tareas a usuarios
- **Logs de ejemplo** para los últimos 7 días

### Usuarios de Prueba

1. Alejandro Martínez (alejandro.martinez@tce.com)
2. María González (maria.gonzalez@tce.com)
3. Carlos Rodríguez (carlos.rodriguez@tce.com)
4. Ana López (ana.lopez@tce.com)
5. Roberto Silva (roberto.silva@tce.com)
6. Laura Fernández (laura.fernandez@tce.com)

### Tareas Importadas

Las 41 tareas del CSV incluyen:

- **Tareas diarias**: Reportarse en grupos, revisar choferes, etc.
- **Tareas semanales**: Participar en reuniones, emitir comunicados, etc.
- **Tareas mensuales**: Grabar videos, organizar eventos, etc.
- **Tareas quincenales**: Entrevistas con choferes

## 🔧 Scripts Disponibles

### Gestión de Datos

```bash
# Poblar base de datos con datos de prueba
npm run seed-agenda

# Verificar estado de los datos
npm run check-agenda

# Limpiar todos los datos de agenda
npm run clean-agenda

# Probar funcionalidad del sistema
npm run test-agenda
```

### Desarrollo

```bash
# Iniciar servidor en modo desarrollo
npm run dev

# Iniciar servidor en producción
npm start
```

## 📈 Funcionalidades del Sistema

### 1. Gestión de Usuarios
- Crear usuarios de agenda
- Vincular con usuarios del sistema principal
- Configurar notificaciones
- Asignar colores personalizados

### 2. Gestión de Tareas
- Crear definiciones de tareas
- Configurar periodicidad (diaria, semanal, mensual, etc.)
- Establecer SLA y requisitos de evidencia
- Organizar por tags

### 3. Asignación de Tareas
- Asignar tareas a usuarios específicos
- Configurar fechas de inicio y fin
- Notas adicionales

### 4. Seguimiento y Logs
- Registrar completado de tareas
- Incrementar contadores
- Agregar comentarios y evidencia
- Detectar tareas atrasadas

### 5. KPIs y Métricas
- Tasa de completado
- Tasa de retraso
- Tiempo promedio de SLA
- Distribución por tags

## 🗂️ Estructura de Archivos

```
src/
├── models/
│   ├── agenda.User.js           # Usuarios de agenda
│   ├── agenda.TaskDefinition.js # Definiciones de tareas
│   ├── agenda.TaskAssignment.js # Asignaciones
│   └── agenda.TaskLog.js        # Logs de actividad
├── controllers/agenda/
│   ├── configController.js      # Gestión de usuarios
│   ├── taskController.js        # Gestión de tareas
│   └── taskManagementController.js # Asignaciones
├── services/agenda/
│   ├── taskService.js           # Lógica de tareas
│   ├── kpiService.js            # Cálculo de KPIs
│   └── importService.js         # Importación CSV
└── views/agenda/
    ├── index.ejs                # Vista principal
    └── loading.ejs              # Vista de carga

scripts/
├── seed-agenda-data.js          # Poblar datos de prueba
├── check-agenda-data.js         # Verificar datos
├── clean-agenda-data.js         # Limpiar datos
└── test-agenda-system.js        # Probar sistema
```

## 🔍 Flujo del Sistema

1. **Configuración**: Crear usuarios y definir tareas
2. **Asignación**: Asignar tareas a usuarios específicos
3. **Ejecución**: Los usuarios completan tareas y registran logs
4. **Seguimiento**: Monitorear progreso y KPIs
5. **Reportes**: Generar métricas y análisis

## 🚨 Solución de Problemas

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté corriendo
netstat -an | findstr :27017

# Iniciar MongoDB
net start MongoDB
```

### Datos corruptos
```bash
# Limpiar y repoblar
npm run clean-agenda
npm run seed-agenda
```

### Verificar integridad
```bash
# Revisar estado de los datos
npm run check-agenda

# Probar funcionalidad
npm run test-agenda
```

## 📝 Próximos Pasos

1. **Integración con sistema principal**: Conectar con autenticación
2. **Notificaciones**: Implementar alertas por email/WhatsApp
3. **Dashboard**: Crear vista de métricas en tiempo real
4. **Reportes**: Generar reportes PDF/Excel
5. **API REST**: Exponer endpoints para integración

## 🤝 Contribución

Para agregar nuevas funcionalidades:

1. Crear modelos en `src/models/`
2. Implementar controladores en `src/controllers/agenda/`
3. Agregar servicios en `src/services/agenda/`
4. Crear vistas en `src/views/agenda/`
5. Actualizar rutas en `src/router/agenda.router.js`
6. Agregar tests en `scripts/`

