import express from "express";
import validator from 'validator';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';
import nodemailer from 'nodemailer';

import { registrarActividad } from "../helpers/logger.js";
import { config } from '../config/config.js';
import { getDbClient } from "../helpers/conexion-bd.js";
import { estaAutenticado } from "../middlewares/auth.js";

dayjs.locale('es');

const router = express.Router();

// Configuración del enrutador (router) con el metodo HTPP Get (aunque existen Post, Put, Delete)
// RUTA DE INICIO (/)
router.get('/', (req, res, next) => {
    registrarActividad("🌐 GET / - El usuario visitó la página de Inicio.");
    const data = {
        titulo: "Inicio | VetCare Pro",
        nombreClinica: "VetCare Pro",
        descripcion: "Cuidamos de tus regalones con amor y profesionalismo.",
        tituloPrincipal: "Bienvenido a VetCare Pro, expertos en salud animal, comprometidos con tu mascota.",
    };
    res.render('index', data);
});

// RUTA NUEVA: SERVICIOS (/servicios)
router.get('/servicios', (req, res, next) => {
    registrarActividad("🌐 GET /servicios - El usuario visitó la página de Servicios.");
    const data = {
        titulo: "Servicios | VetCare Pro",
        nombreClinica: "VetCare Pro",
        descripcion: "Ofrecemos una amplia gama de servicios médicos especializados para asegurar la salud de tus regalones.",
        tituloPrincipal: "Nuestros Servicios",
        listaServicios: [
            "Consulta General y Preventiva",
            "Vacunación e Identificación por Microchip",
            "Cirugía de Alta Complejidad",
            "Laboratorio Clínico y Diagnóstico",
            "Peluquería Estética"
        ]
    };
    res.render('servicios', data);
});

// RUTA NUEVA: CONTACTO (/contacto)
router.get('/contacto', (req, res, next) => {
    registrarActividad("🌐 GET /contacto - El usuario visitó la página de Contacto.");
    const data = {
        titulo: "Contacto | VetCare Pro",
        nombreClinica: "VetCare Pro",
        descripcion: "¿Tienes alguna duda o necesitas agendar alguna cita? Nuestro equipo está listo para atenderte.",
        tituloPrincipal: "Ponte en Contacto",
        infoContacto: {
            telefono: "+569 99445522",
            email: "contacto@vetcarepro.cl",
            direccion: "Alameda 123, Santiago, Chile"
        }
    };
    res.render('contacto', data);
});

// RUTA NUEVA: Recepción del formulario de contacto
router.post('/enviar-consulta', async (req, res) => {
    const conexion = getDbClient();
    try {
        // 0. Acá extraemos los datos del formulario web que viajaron en el BODY de la request
        const { nombre, email, consulta } = req.body;

        // 1. Validación del email con la dependencia 'validator'
        if (!validator.isEmail(email)) {
            registrarActividad(`🌐❌ POST /enviar-consulta - RECHAZADO: Intento de formulario con email inválido (${email}).`);
            return res.status(400).render('error', {
                message: 'El correo electrónico ingresado no tiene un formato válido',
                error: { status: 400, stack: 'Reintenta con un email real.' },
                nombreClinica: 'VetCare Pro'
            });
        }

        // 1.1 Abrir la conexión a la base de datos (PASO CRÍTICO)
        registrarActividad(`💾 BASE DE DATOS: Intentando conectar a PostgreSQL en ${config.db.host}:${config.db.port}.`);
        await conexion.connect();
        registrarActividad(`💾 BASE DE DATOS: Conexión a PostgreSQL establecida con éxito.`);

        registrarActividad(`🌐 POST /enviar-consulta - PROCESANDO: Iniciando envío de correo para ${email}...`);

        // 2. Configuración del transporte | Dependendia 'nodemailer'
        // - En producción, estos datos deben ir en variables de entorno (.env)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Puedes usar 'outlook', 'yahoo', etc.
            auth: {
                user: config.email.user, // El correo que enviará el mensaje
                pass: config.email.password // Contraseña de aplicación configurada en tu cuenta Google > Contraseñas de Aplicación
            }
        });

        // 3. Estructura del correo electrónico | Dependendia 'nodemailer'
        const mailOptions = {
            from: `Sitio Web VetCare <${config.email.user}>`,
            to: config.email.user, // A quién le llega el mensaje (puede ser el mismo)
            subject: `Nueva Consulta de: ${validator.escape(nombre)}`,
            html: `
        <h2 style="color: #0d9488;">Nueva Consulta Web - VetCare Pro</h2>
        <p><strong>Cliente:</strong> ${validator.escape(nombre)}</p>
        <p><strong>Email de contacto:</strong> ${email}</p>
        <hr>
        <p><strong>Mensaje:</strong></p>
        <p><em>${validator.escape(consulta)}</em></p>
        <br>
        <p style="font-size: 12px; color: gray;">Generado el: ${dayjs().format('DD/MM/YYYY HH:mm')}</p>
      `
        };

        // 4. Envío del correo electrónico configurado de forma asincrónica | Dependendia 'nodemailer'
        await transporter.sendMail(mailOptions);
        registrarActividad(`🌐 POST /enviar-consulta - ÉXITO: Correo enviado correctamente desde ${email}.`);

        // 4.1 Inserción de datos en la BD - PostgreSQL a través de una Consulta SQL Parametrizada
        registrarActividad(`💾 BASE DE DATOS: Ejecutando un INSERT en la base de datos PostgreSQL.`);
        const consultaSql = 'INSERT INTO consultas (nombre, email, consulta, fecha) VALUES ($1, $2, $3, $4)';
        const valores = [
            validator.escape(nombre),
            email,
            validator.escape(consulta),
            dayjs().format('YYYY-MM-DD HH:mm:ss')
        ];
        await conexion.query(consultaSql, valores);
        registrarActividad(`💾 BASE DE DATOS: Registro insertado exitosamente en PostgreSQL.`);

        // 5. Respuesta al cliente con una vista HTML
        res.render('confirmacion', {
            titulo: 'Mensaje Enviado',
            nombreClinica: 'VetCare Pro',
            nombreCliente: validator.escape(nombre)
        });

    } catch (error) {
        registrarActividad(`❌🌐 POST /enviar-consulta - ERROR CRÍTICO: ${error.message}`);
        res.status(500).render('error', {
            message: "No pudimos enviar tu mensaje en este momento.",
            error: { status: 500, stack: "Error de conexión SMTP: " + error.message },
            nombreClinica: 'VetCare Pro'
        });
    } finally {
        // 6. Cerrar la conexión a la base de datos PostgreSQL
        registrarActividad(`💾 BASE DE DATOS: Cerrando la conexión a BD PostgreSQL.`);
        await conexion.end();
        registrarActividad(`💾 BASE DE DATOS: Conexión a BD PostgreSQL cerrada exitosamente.`);
    }
});

export default router;