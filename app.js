// Importación de dependencias externas (módulos o librerías) según el éstandar ES6
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

// Importación de archivos de ruteo (locales) según el éstandar ES6
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";

// La creación del objeto que levanta el servidor
// El servidor podría ser levantado únicamente con Node.js, pero ocupamos Express.js
const app = express();

// Activación del motor de plantillas, o vistas (EJS - Embebed JavaScript)
app.set('views', path.join(import.meta.dirname, 'views'));
app.set('view engine', 'ejs');

// Configuración de Middlewares globales propios de Express.js
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(import.meta.dirname, 'public')));

// Acá están las rutas configuradas y existentes de mi proyecto
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Acá se configura el error más común en HTTP = 404 - No encontrado (not found)
app.use((req, res, next) => {
    next(createError(404));
});

// Acá se configura los errores en general
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Exportación por defecto según el estándar ES6
export default app;