import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';

// Ruta absoluta al archivo de logs
const LOG_PATH = path.join(process.cwd(), 'logs', 'activity.log');

/**
 * MINISISTEMA DE LOGGING
 * Guarda historial de operaciones con fecha y hora en formato texto plano.
 * @param {String} mensaje - La descripción de la actividad a registrar.
 */
export const registrarActividad = (mensaje) => {
    try {
        const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const logEntry = `[${timestamp}] ${mensaje}\n`;

        // Añade la línea al final del archivo sin sobreescribir el resto
        fs.appendFileSync(LOG_PATH, logEntry, 'utf-8');
    } catch (error) {
        // Fallback en caso de que la carpeta /logs no exista
        console.error("Error crítico en el sistema de logs:", error.message);
    }
};