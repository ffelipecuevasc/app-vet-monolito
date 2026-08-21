import dotenv from 'dotenv';
import {registrarActividad} from "../helpers/logger.js";

dotenv.config();

registrarActividad("🛡️ SERVIDOR: Cargando variables de entorno desde el archivo .env.");

const REQUIRED_ENV_VARS = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'SESSION_SECRET'
];

REQUIRED_ENV_VARS.forEach((envVar) => {
    if(!process.env[envVar]){
        console.error(`❌ ERROR: Falta la variable de entorno (es obligatoria) -> ${envVar}.`);
        registrarActividad(`❌ ERROR: No pudo arrancar el servidor. Falta la variable de entorno (es obligatoria) -> ${envVar}.`);
        process.exit(1);
    }
});

registrarActividad("🛡️ SERVIDOR: Todas las variables de entorno fueron validadas con éxito.");

export const config = {
    db: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    email: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
    },
    session: {
        secret: process.env.SESSION_SECRET,
    }
};