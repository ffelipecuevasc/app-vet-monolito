// Importamos express y el enrutador
import express from "express";
import validator from 'validator'; // Librería para validaciones
import dayjs from 'dayjs'; // Librería para fechas
import 'dayjs/locale/es.js'; // Importamos el idioma español

dayjs.locale('es'); // Configuramos dayjs globalmente en español

const router = express.Router();

// Configuración del enrutador (router) con el metodo HTPP Get (aunque existen Post, Put, Delete)
// RUTA DE INICIO (/)
router.get('/', (req, res, next) => {
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

// RUTA NUEVA: Configurar el POST
// POST: PROCESAR CONSULTA (/enviar-consulta)
// Captura los datos del formulario y redirige a la confirmación.
router.post('/enviar-consulta', (req, res) => {
    const { nombre, email, consulta } = req.body;

    // 1. VALIDACIÓN: Verificamos si el email es real usando 'validator'
    const esEmailValido = validator.isEmail(email);

    if (!esEmailValido) {
        // Si el email no es válido, lanzamos un error (o podrías redirigir con un mensaje)
        return res.status(400).render('error', {
            message: 'El correo electrónico ingresado no es válido.',
            error: { status: 400, stack: 'Por favor, regresa e intenta con un email real.' },
            nombreClinica: "VetCare Pro"
        });
    }

    // 2. FECHAS: Generamos una fecha de recepción formateada con 'dayjs'
    // Formato: "lunes, 20 de mayo de 2024"
    const fechaRecepcion = dayjs().format('dddd, D [de] MMMM [de] YYYY');

    const data = {
        titulo: "Consulta Recibida | VetCare Pro",
        nombreClinica: "VetCare Pro",
        cliente: {
            nombre: validator.escape(nombre), // Limpiamos el texto para evitar XSS
            email,
            consulta: validator.escape(consulta)
        },
        fecha: fechaRecepcion
    };

    res.render('confirmacion', data);
});

export default router;