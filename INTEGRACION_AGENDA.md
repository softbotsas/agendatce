# Guía de Integración - Sistema de Agenda TCE

## 🎯 Objetivo
Integrar el sistema de agenda al sistema principal manteniendo el menú lateral y header existentes.

## 📁 Estructura de Archivos Renombrados

### Modelos (con prefijo `agenda.`)
```
src/models/
├── Users.js (mantenido)
├── agenda.TaskDefinition.js
├── agenda.TaskAssignment.js
└── agenda.TaskLog.js
```

### Vistas para Integración
```
src/views/agenda/
├── main.ejs              # Vista completa del sistema
├── navigation.ejs        # Solo navegación (para integrar)
├── partials/
│   ├── today.ejs        # Solo body de tareas de hoy
│   ├── dashboard.ejs    # Solo body de dashboard
│   └── history.ejs      # Solo body de historial
└── templantes/          # Componentes reutilizables
```

## 🔌 Opciones de Integración

### Opción 1: Vista Completa (Recomendada)
```html
<!-- En tu sistema principal -->
<iframe src="/agenda" width="100%" height="800px" frameborder="0"></iframe>
```

### Opción 2: Solo Navegación + Contenido Dinámico
```html
<!-- En tu sistema principal -->
<div id="agenda-container">
    <!-- Cargar navegación -->
    <div id="agenda-nav">
        <!-- Se carga via AJAX desde /agenda/nav -->
    </div>
    
    <!-- Contenedor para contenido dinámico -->
    <div id="agenda-content">
        <!-- Se carga dinámicamente desde /agenda/partials/* -->
    </div>
</div>
```

### Opción 3: Integración Manual
```html
<!-- En tu sistema principal -->
<div class="agenda-section">
    <!-- Copiar contenido de navigation.ejs -->
    <div class="agenda-navigation">
        <!-- Navegación del sistema -->
    </div>
    
    <!-- Contenedor dinámico -->
    <div id="agenda-content">
        <!-- Contenido se carga via JavaScript -->
    </div>
</div>
```

## 🚀 Implementación Recomendada

### 1. Agregar al Menú Lateral
```html
<!-- En tu menú lateral existente -->
<li class="nav-item">
    <a class="nav-link" href="#" onclick="loadAgendaModule()">
        <i class="fas fa-calendar-check"></i>
        <span>Agenda</span>
    </a>
</li>
```

### 2. JavaScript para Cargar Módulo
```javascript
function loadAgendaModule() {
    // Ocultar contenido actual
    document.getElementById('main-content').style.display = 'none';
    
    // Mostrar contenedor de agenda
    const agendaContainer = document.getElementById('agenda-container');
    agendaContainer.style.display = 'block';
    
    // Cargar navegación
    fetch('/agenda/nav')
        .then(response => response.text())
        .then(html => {
            document.getElementById('agenda-nav').innerHTML = html;
            
            // Cargar vista inicial (hoy)
            loadAgendaView('today');
        });
}

function loadAgendaView(view) {
    fetch(`/agenda/partials/${view}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('agenda-content').innerHTML = html;
            
            // Ejecutar scripts específicos de la vista
            if (typeof loadTodayTasks === 'function') {
                loadTodayTasks();
            }
        });
}
```

### 3. CSS para Integración
```css
/* Estilos para integración */
#agenda-container {
    display: none;
    padding: 20px;
}

.agenda-navigation {
    margin-bottom: 20px;
}

.agenda-content {
    min-height: 600px;
}

/* Ajustar estilos del sistema principal si es necesario */
.agenda-section .card {
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
```

## 📡 API Endpoints

### Vistas
- `GET /agenda` - Vista completa del sistema
- `GET /agenda/nav` - Solo navegación
- `GET /agenda/partials/today` - Body de tareas de hoy
- `GET /agenda/partials/dashboard` - Body de dashboard
- `GET /agenda/partials/history` - Body de historial

### API
- `GET /agenda/api/today` - Obtener tareas de hoy
- `POST /agenda/api/log` - Registrar actividad
- `GET /agenda/api/history` - Obtener historial
- `GET /agenda/api/dashboard` - Obtener KPIs
- `GET /agenda/api/export/csv` - Exportar CSV

## 🎨 Personalización

### Cambiar Estilos
Los estilos se pueden personalizar modificando las clases CSS en las vistas parciales.

### Agregar Funcionalidades
1. Modificar los servicios en `src/services/agenda/`
2. Actualizar los controladores en `src/controllers/agenda/`
3. Agregar nuevas vistas parciales en `src/views/agenda/partials/`

### Integrar con Autenticación
```javascript
// En el middleware de autenticación
const authenticateToken = (req, res, next) => {
    // Usar tu sistema de autenticación existente
    if (req.session && req.session.user) {
        req.user = req.session.user;
        next();
    } else {
        res.status(401).json({ success: false, message: 'No autorizado' });
    }
};
```

## 🔧 Configuración

### Variables de Entorno
```env
# Agregar a tu .env existente
AGENDA_PREFIX=agenda
AGENDA_AUTO_REFRESH=true
AGENDA_NOTIFICATIONS=true
```

### Rutas en app.js
```javascript
// Ya está configurado
app.use('/agenda', require('./src/router/agenda.router'));
```

## 📱 Responsive Design

El sistema está diseñado para ser responsive y se adapta a diferentes tamaños de pantalla:
- **Desktop**: Vista completa con sidebar
- **Tablet**: Vista compacta
- **Mobile**: Vista optimizada para móviles

## 🐛 Solución de Problemas

### Error de CORS
Si hay problemas de CORS, agregar en app.js:
```javascript
app.use('/agenda', cors(), require('./src/router/agenda.router'));
```

### Error de Rutas
Verificar que las rutas estén correctamente configuradas en el sistema principal.

### Error de JavaScript
Verificar que las funciones globales estén disponibles en el scope correcto.

## 📞 Soporte

Para problemas de integración, contactar al equipo de desarrollo con:
- Descripción del problema
- Captura de pantalla del error
- Logs de la consola del navegador
- Versión del sistema principal



