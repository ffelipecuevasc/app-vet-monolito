// Importamos express y el enrutador
import express from "express";
import validator from 'validator'; // Librería para validaciones
import dayjs from 'dayjs'; // Librería para fechas
import 'dayjs/locale/es.js'; // Importamos el idioma español
import { crearRegistroJSON, leerRegistroJSON } from '../helpers/crud_json.js';

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
    try{
        const { nombre, email, consulta } = req.body;

        if (!validator.isEmail(email)){
            return res.status(400).render('error', {
                error: {
                    status: 400,
                    stack: "Reintenta con un email real y válido."
                },
                nombreClinica: 'VetCare Pro'
            });
        }

        const datosParaGuardar = {
            nombre: validator.escape(nombre),
            email: email,
            consulta: validator.escape(consulta)
        };

        const nombreArchivo = crearRegistroJSON(datosParaGuardar);
        const datosRecuperados = leerRegistroJSON(nombreArchivo);

        const fechaRecepcion = dayjs().format('dddd, D [de] MMMM [de] YYYY');
        res.render('confirmacion', {
            titulo: 'Confirmacion de Persistencia JSON',
            nombreClinica: 'VetCare Pro',
            cliente: datosRecuperados,
            fecha: fechaRecepcion,
            archivoLocal: nombreArchivo,
            persistenciaExitosa: true
        });

    }catch(error){
        res.status(500).render('error', {
            message: "Fallo crítico en el sistema de archivos JSON.",
            error: {
                status: 500,
                stack: error.message
            },
            nombreClinica: 'VetCare Pro'
        });
    }
});

export default router;