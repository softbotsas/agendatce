# TCE Nómina Multinacional

Sistema de nómina multinacional desarrollado con Node.js, Express, Mongoose y EJS.

## 🚀 Características

- **Arquitectura modular**: Separación clara entre modelos, controladores, servicios y rutas
- **Multi-país**: Soporte para diferentes sectores por país con sus propias reglas
- **Multi-moneda**: Cada sector puede tener su moneda local
- **Gestión de horarios**: Configuración flexible de turnos y horarios de trabajo
- **Marcajes**: Sistema de registro de entrada y salida
- **Timesheets**: Cálculo automático de horas trabajadas, extras y nocturnas
- **Feriados**: Gestión de días festivos por sector
- **Cálculo de nómina**: Generación automática de recibos de pago
- **Reportes**: Visualización de períodos y recibos

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Base de datos**: MongoDB con Mongoose
- **Vistas**: EJS con componentes parciales
- **Sesiones**: Express-session con MongoDB Store
- **Tiempo**: Moment.js con timezone support
- **UI**: Bootstrap 5

## 📁 Estructura del Proyecto

```
src/
├── models/nomina/          # Esquemas de MongoDB
│   ├── Sector.js           # Sectores por país
│   ├── Empleado.js         # Empleados
│   ├── Contrato.js         # Contratos laborales
│   ├── Horario.js          # Horarios de trabajo
│   ├── Marcaje.js          # Registros de entrada/salida
│   ├── TimesheetDia.js     # Resumen diario de horas
│   ├── Feriado.js          # Días festivos
│   ├── NominaPeriodo.js    # Períodos de nómina
│   └── ReciboPago.js       # Recibos generados
├── controllers/             # Controladores (lógica de negocio)
├── services/nomina/         # Servicios (cálculos complejos)
└── router/                  # Rutas de la aplicación

views/
├── templantes/              # Componentes EJS reutilizables
└── nomina/                  # Vistas específicas de nómina
```

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/elbernstein/nominatce.git
   cd nominatce
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Configurar MongoDB**
   - Asegúrate de tener MongoDB ejecutándose
   - Configura la URL en el archivo `.env`

5. **Ejecutar la aplicación**
   ```bash
   node app.js
   ```

## 📋 Variables de Entorno

```env
PORT=3033
MONGODB_URI=mongodb://localhost:27017/nominatce
SECRET_KEY=tu-clave-secreta-aqui
NODE_ENV=development
```

## 🎯 Funcionalidades Principales

### Gestión de Sectores
- Crear sectores por país
- Configurar reglas de horas y penalizaciones
- Establecer moneda y zona horaria

### Empleados y Contratos
- Registro de empleados
- Gestión de contratos (por horas o mensual)
- Asignación de horarios

### Cálculo de Nómina
- Procesamiento automático de marcajes
- Cálculo de horas normales, extras y nocturnas
- Aplicación de penalizaciones (tardanzas, faltas)
- Generación de recibos de pago

### Reportes
- Visualización de períodos de nómina
- Consulta de recibos por empleado
- Exportación de datos

## 🔧 Desarrollo

El proyecto sigue una arquitectura modular con separación clara de responsabilidades:

- **Models**: Esquemas de MongoDB con validaciones
- **Controllers**: Lógica de negocio y manejo de requests
- **Services**: Cálculos complejos (como la calculadora de nómina)
- **Router**: Definición de rutas y middleware

## 📝 Notas de Implementación

- El cálculo de nocturnidad es simplificado (MVP)
- Los impuestos y seguridad social están preparados para implementación futura
- El sistema maneja múltiples zonas horarias correctamente
- Los timesheets se generan automáticamente al calcular períodos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Yorman Salazar**
- GitHub: [@elbernstein](https://github.com/elbernstein)

---

Desarrollado con ❤️ para la gestión de nóminas multinacionales.
