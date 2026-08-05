// Importamos express y el enrutador
import express from "express";
const router = express.Router();

const CLINICA_NAME = "VetCare Pro";

// Configuración del enrutador (router) con el metodo HTPP Get (aunque existen Post, Put, Delete)
// RUTA DE INICIO (/) = http://localhost:3000/
router.get('/', (req, res) => {
    const datos = {
        title: `Inicio | ${CLINICA_NAME}`,
        nombreClinica: CLINICA_NAME,
        tituloPrincipal: "Expertos en Salud Animal, comprometidos con el bienestar de tu mascota.",
        descripcion: "Cuidamos a tus compañeros de vida con amor y profesionalismo médico."
    };
    res.render('index', datos);
});

// RUTA DE SERVICIOS (/servicios)
// Envía la información detallada con lo que ofrece la clínica
router.get('/servicios', (req, res) => {
    const datos = {
        title: `Servicios | ${CLINICA_NAME}`,
        nombreClinica: CLINICA_NAME,
        tituloPrincipal: "Amplia gama de servicios centrados en tus mascotas",
        descripcion: "Ofrecemos una gran variedad de servicios médicos especializados para asegurar la salud de tus regalones.",
        listaDeServicios: [
            "Consulta General y Preventiva",
            "Vacunación e Identificación (Microchip)",
            "Cirugía de Alta Complejidad",
            "Laboratorio Clínico y Diagnóstico por Imagen",
            "Peluquería y Estética Canina/Felina"
        ]
    };
    res.render('servicios', datos);
});

// RUTA DE CONTACTO (/contacto)
// Muestra la información de contacto de la clínica veterinaria
router.get('/contacto', (req, res) => {
    const datos = {
        title: `Contacto | ${CLINICA_NAME}`,
        nombreClinica: CLINICA_NAME,
        tituloPrincipal: "Contáctanos a través de esta info",
        descripcion: "¿Tienes alguna duda o necesitas agendar una cita? Nuestro equipo de especialistas está listo para atenderte.",
        infoContacto: {
            telefono: "+569 9988 4433",
            email: "contacto@vetcarepro.cl",
            direccion: "Av. Salud Animal 123, Santiago, Chile"
        }
    };
    res.render('contacto', datos);
});

export default router;