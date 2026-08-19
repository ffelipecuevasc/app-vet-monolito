import pg from 'pg';
import { config } from "../config/config.js";
import { registrarActividad } from "./logger.js";

const { Client } = pg;

export const getDbClient = () => {
    registrarActividad(`💾 BASE DE DATOS: Generando una nueva conexión (Client) de PostgreSQL.`);
    return new Client({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    });
};