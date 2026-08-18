import express from "express";
import validator from 'validator';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';
import nodemailer from 'nodemailer';
import { registrarActividad } from "../helpers/logger.js";

dayjs.locale('es');

const router = express.Router();

// Configuración del enrutador (router) con el metodo HTPP Get (aunque existen Post, Put, Delete)
// RUTA DE INICIO (/)
router.get('/', (req, res, next) => {
    registrarActividad("GET / - El usuario visitó la página de Inicio.");
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
    registrarActividad("GET /servicios - El usuario visitó la página de Servicios.");
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
    registrarActividad("GET /contacto - El usuario visitó la página de Contacto.");
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

/**
 * POST: PROCESAR CONSULTA Y ENVIAR CORREO
 * Metodo Asincrónico para manejar la latencia de la red.
 */
router.post('/enviar-consulta', async (req, res) => {
    try {
        const { nombre, email, consulta } = req.body;

        // 1. Validación con la dependencia 'validator'
        if (!validator.isEmail(email)) {
            registrarActividad(`POST /enviar-consulta - RECHAZADO: Intento de formulario con email inválido (${email}).`);
            return res.status(400).render('error', {
                message: 'El correo electrónico ingresado no tiene un formato válido',
                error: { status: 400, stack: 'Reintenta con un email real.' },
                nombreClinica: 'VetCare Pro'
            });
        }

        registrarActividad(`POST /enviar-consulta - PROCESANDO: Iniciando envío de correo para ${email}...`);

        // 2. Configuración del transporte 'nodemailer'
        // - En producción, estos datos deben ir en variables de entorno (.env)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Puedes usar 'outlook', 'yahoo', etc.
            auth: {
                user: 'tu_correo_admin@gmail.com', // El correo que enviará el mensaje
                pass: '' // Contraseña de aplicación configurada en tu cuenta Google > Contraseñas de Aplicación
            }
        });

        // 3. Estructura del correo electrónico
        const mailOptions = {
            from: '"Sitio Web VetCare" <tu_correo_admin@gmail.com>',
            to: 'tu_correo_admin@gmail.com', // A quién le llega el mensaje (puede ser el mismo)
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

        // 4. Envío del correo electrónico configurado de forma asincrónica
        await transporter.sendMail(mailOptions);

        registrarActividad(`POST /enviar-consulta - ÉXITO: Correo enviado correctamente desde ${email}.`);

        // 5. Respuesta al cliente con una vista HTML
        res.render('confirmacion', {
            titulo: 'Mensaje Enviado',
            nombreClinica: 'VetCare Pro',
            nombreCliente: validator.escape(nombre)
        });

    } catch (error) {
        registrarActividad(`POST /enviar-consulta - ERROR CRÍTICO SMTP: ${error.message}`);
        res.status(500).render('error', {
            message: "No pudimos enviar tu mensaje en este momento.",
            error: { status: 500, stack: "Error de conexión SMTP: " + error.message },
            nombreClinica: 'VetCare Pro'
        });
    }
});

export default router;