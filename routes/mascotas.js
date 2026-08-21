import express from 'express';
import validator from 'validator';
import dayjs from "dayjs";
import 'dayjs/locale/es.js';

import { registrarActividad } from "../helpers/logger.js";
import { estaAutenticado } from "../middlewares/auth.js";
import { getDbClient } from "../helpers/conexion-bd.js";

dayjs.locale("es");

const router = express.Router();
router.use(estaAutenticado);

// =====================================
// Gestión del módulo de mascotas (CRUD)
// =====================================

// Ruta Inicial (/) - GET
// - CRUD: Solamente implementamos el READ (listado de mascotas = SELECT)
router.get('/', async (req, res) => {
    const conexion = getDbClient();
    try {
        registrarActividad(`🌐 GET / - Acceso autorizado a lista de mascotas para ${req.session.usuario.email}.`);

        // 1. Iniciar la conexión de forma explícita
        await conexion.connect();

        // 2. Creación de las consultas SQL para extraer las mascotas existentes
        // - CRUD: READ, es decir, ejecutaremos un SELECT
        const querySQL = "SELECT * FROM mascotas ORDER BY id ASC;";
        const resultSQL = await conexion.query(querySQL);

        const listaMascotas = resultSQL.rows.map((fila) => ({
            ...fila,
            nombreDueno: fila.nombre_dueno,
            fechaIngresoFormateada: dayjs(fila.fecha_ingreso).format('DD/MM/YYYY')
        }));

        res.render('mascotas', {
            titulo: 'Mis Mascotas | VetCare Pro',
            nombreClinica: 'VetCare Pro',
            listaMascotas: listaMascotas
        });

    } catch (error) {
        registrarActividad(`❌🌐 GET /mascotas - No se pudieron listar las mascotas desde la BD. ERROR CRÍTICO: ${error.message}`);
        res.status(500).render('error',{
            message: 'No pudimos cargar el listado de mascotas por problemas en el servidor en este momento.',
            error:{ status:500, stack:error.message },
            nombreClinica: 'VetCare Pro',
        });
    } finally {
        registrarActividad(`💾 BASE DE DATOS: Cerrando la conexión a BD PostgreSQL.`);
        await conexion.end();
        registrarActividad(`💾 BASE DE DATOS: Conexión a BD PostgreSQL cerrada exitosamente.`);
    }
});

// Ruta (/mascotas/crear) - GET
// - Mostrar (renderizar) la vista para crear una mascota (mascotas_create.ejs)

// Ruta (/mascotas/crear) - POST
// - CRUD: Implementamos el CREATE (insertar una mascota = INSERT)

// Ruta (/mascotas/id/editar) - GET
// - Mostrar (renderizar) la vista para editar una mascota (mascotas_update.ejs)

// Ruta (/mascotas/id/editar) - POST
// - CRUD: Implementamos el UPDATE (actualizar/editar una mascota = UPDATE)

// Ruta (/mascotas/id/eliminar) - POST
// - CRUD: Implementamos el DELETE (eliminar una mascota = DELETE)

export default router;