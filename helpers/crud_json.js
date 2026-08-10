import fs from "fs";
import path from "path";
import dayjs from "dayjs";

// Crear constantes de UBICACIONES - Rutas para acceder a los datos y a los logs
const DATA_PATH = path.join(process.cwd(), 'public', 'data');
const LOG_PATH = path.join(process.cwd(), 'public', 'logs');

// Función interna que permite registrar en un LOG lo que va pasando en el servidor
const registrarActividad = (mensaje) => {
    const tiempo = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const logEntrada = `[${tiempo}] ${mensaje}\n`;
    fs.appendFileSync(LOG_PATH, logEntrada);
};

// CREATE del CRUD - Crear un registro en el archivo JSON
export const crearRegistroJSON = (data) => {
    try{
        const fileName = `${dayjs().format('YYYY-MM-DD HH:mm:ss')}.json`;
        const filePath = path.join(DATA_PATH, fileName);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

        registrarActividad(`✅ JSON - Creación del archivo ${fileName} realizada con éxito.`);
        return fileName;
    }catch(error){
        registrarActividad(`❌ JSON - Error al crear el archivo JSON: ${error.message}`);
        throw new Error("No se pudo persistir el archivo JSON en el disco.");
    }
};

// READ del CRUD - Leer registros del archivo JSON
export const leerRegistroJSON = (fileName) => {
    try{
        const filePath = path.join(DATA_PATH, fileName);
        const dataRaw = fs.readFileSync(filePath, 'utf-8');

        registrarActividad(`✅ JSON - Archivo ${fileName} leído con éxito.`);
        return JSON.parse(dataRaw);
    }catch(error){
        registrarActividad(`❌ JSON - Error al leer el archivo JSON: ${error.message}`);
        throw new Error("No se pudo leer el archivo JSON alojado en el disco.");
    }
};