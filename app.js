// Importación de dependencias externas (módulos o librerías) según el éstandar ES6
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// Importación de archivos de ruteo (locales) según el éstandar ES6
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import autenticacionRouter from "./routes/autenticacion.js";
import mascotasRouter from "./routes/mascotas.js";

// Importación de configuración y logger propios del proyecto
import { config } from "./config/config.js";
import { registrarActividad } from "./helpers/logger.js";

// La creación del objeto que levanta el servidor
// El servidor podría ser levantado únicamente con Node.js, pero ocupamos Express.js
const app = express();

// Activación del motor de plantillas, o vistas (EJS - Embebed JavaScript)
app.set('views', path.join(import.meta.dirname, 'views'));
app.set('view engine', 'ejs');

// Configuración de Middlewares globales propios de Express.js
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(import.meta.dirname, 'public')));

// --- INICIO: Configuración de sesión (express-session + connect-pg-simple) ---
const PgSession = connectPgSimple(session);

registrarActividad("⚙️ SISTEMA: Inicializando el middleware de sesión (express-session + PostgreSQL).");

app.use(session({
    store: new PgSession({
        conObject: {
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            database: config.db.database,
        },
        tableName: 'session',
        createTableIfMissing: false
    }),
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 2
    }
}));

// Middleware "inyector": copia el usuario de la sesión a res.locals para TODAS las vistas
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});
// --- FIN: Configuración de sesión ---

// Acá están las rutas configuradas y existentes de mi proyecto
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/autenticacion', autenticacionRouter);
app.use('/mascotas', mascotasRouter);

// Acá se configura el error más común en HTTP = 404 - No encontrado (not found)
app.use((req, res, next) => {
    next(createError(404));
});

// Acá se configura los errores en general
app.use((err, req, res, next)=> {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Exportación por defecto según el estándar ES6
export default app;