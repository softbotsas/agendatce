const express = require('express');
const http = require('http');
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors');
const methodOverride = require('method-override');
const compression = require('compression');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET","POST"] } });

const puerto = process.env.PORT || 3000;
const sessionStore = require('./sessionStore');

// Vistas y estáticos (importante usando __dirname de raíz)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares
app.use(cors());
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Sesiones
app.use(session({
  secret: process.env.SECRET_KEY || 'tu-clave-secreta',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  }
}));

// Exponer sesión en vistas (como ya usas)
app.use((req, res, next) => {
  res.locals.session = req.session || {};
  next();
});

// Inyectar io
app.use((req, res, next) => { req.io = io; next(); });

// Rutas (ajusta si tus carpetas están en raíz)
app.use('/', require('./src/router/nomina.router')); 
app.get('/', (req,res)=> res.render('home', { titulo: 'Inicio' }));

// Socket.io
io.on('connection', (socket) => console.log('Nuevo cliente', socket.id));

// Arranque
server.listen(puerto, () => console.log('Entrando al Sistema en el puerto ' + puerto));
