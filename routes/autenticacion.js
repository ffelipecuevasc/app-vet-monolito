import express from "express";
import validator from 'validator';
import bcrypt from 'bcryptjs';

import { registrarActividad } from "../helpers/logger.js";
import { getDbClient } from "../helpers/conexion-bd.js";
import { estaAutenticado, esInvitado } from "../middlewares/auth.js";

const router = express.Router();

/**
 * GET /autenticacion/login
 * Muestra el formulario de inicio de sesión.
 * Protegida con 'esInvitado': si ya hay sesión activa, redirige a "/".
 */
router.get('/login', esInvitado, (req, res) => {
    registrarActividad("🌐 GET /autenticacion/login - El usuario visitó la página de Login.");
    res.render('login', {
        titulo: 'Iniciar Sesión | VetCare Pro',
        nombreClinica: 'VetCare Pro'
    });
});

/**
 * GET /autenticacion/registro
 * Muestra el formulario de registro.
 */
router.get('/registro', esInvitado, (req, res) => {
    registrarActividad("🌐 GET /autenticacion/registro - El usuario visitó la página de Registro.");
    res.render('registro', {
        titulo: 'Crear Cuenta | VetCare Pro',
        nombreClinica: 'VetCare Pro'
    });
});

/**
 * POST /autenticacion/registro
 * Valida los datos, hashea la contraseña y crea el nuevo usuario en PostgreSQL.
 */
router.post('/registro', esInvitado, async (req, res) => {
    const conexion = getDbClient();
    try {
        const { nombre, email, password } = req.body;

        // 1. Validaciones básicas de entrada
        if (!nombre || !validator.isEmail(email) || !password) {
            registrarActividad(`🔐❌ POST /autenticacion/registro - RECHAZADO: Datos incompletos o email inválido (${email}).`);
            return res.status(400).render('error', {
                message: 'Debes completar tu nombre, un email válido y una contraseña.',
                error: { status: 400, stack: 'Revisa el formulario e intenta nuevamente.' },
                nombreClinica: 'VetCare Pro'
            });
        }

        if (password.length < 8) {
            registrarActividad(`🔐❌ POST /autenticacion/registro - RECHAZADO: Contraseña demasiado corta (${email}).`);
            return res.status(400).render('error', {
                message: 'La contraseña debe tener al menos 8 caracteres.',
                error: { status: 400, stack: 'Elige una contraseña más larga.' },
                nombreClinica: 'VetCare Pro'
            });
        }

        // 2. Hasheo de la contraseña -- esto es lo único que llegará a la base de datos
        registrarActividad(`🔐 SEGURIDAD: Hasheando contraseña para nuevo registro (${email}).`);
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Inserción en PostgreSQL (mismo patrón que ya usas en routes/index.js)
        await conexion.connect();
        const insertSql = `INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, nombre, email`;
        const valores = [validator.escape(nombre), email, passwordHash];
        await conexion.query(insertSql, valores);

        registrarActividad(`🔐 POST /autenticacion/registro - ÉXITO: Usuario registrado correctamente (${email}).`);

        // 4. Redirigimos al login -- el usuario debe autenticarse con sus nuevas credenciales
        res.redirect('/autenticacion/login');

    } catch (error) {
        let mensajeError = `Error crítico: ${error.message}`;
        let statusCode = 500;

        if (error.code === '23505') {
            // Código de PostgreSQL para violación de restricción UNIQUE (el email ya existe)
            mensajeError = 'Ese correo electrónico ya está registrado. Intenta iniciar sesión.';
            statusCode = 409; // Conflict
            registrarActividad(`🔐❌ POST /autenticacion/registro - RECHAZADO: Email duplicado (${req.body.email}).`);
        } else {
            registrarActividad(`🔐❌ POST /autenticacion/registro - ERROR CRÍTICO: ${error.message}`);
        }

        res.status(statusCode).render('error', {
            message: mensajeError,
            error: { status: statusCode, stack: error.message },
            nombreClinica: 'VetCare Pro'
        });
    } finally {
        await conexion.end();
    }
});

/**
 * POST /autenticacion/login
 * Valida credenciales contra la base de datos y crea la sesión si son correctas.
 */
router.post('/login', esInvitado, async (req, res) => {
    const conexion = getDbClient();
    const mensajeCredencialesInvalidas = 'Email o contraseña incorrectos.';

    try {
        const { email, password } = req.body;

        if (!validator.isEmail(email) || !password) {
            return res.status(400).render('error', {
                message: mensajeCredencialesInvalidas,
                error: { status: 400, stack: 'Revisa el formulario e intenta nuevamente.' },
                nombreClinica: 'VetCare Pro'
            });
        }

        await conexion.connect();
        const selectSql = 'SELECT id, nombre, email, password_hash FROM usuarios WHERE email = $1';
        const resultado = await conexion.query(selectSql, [email]);

        // Caso 1: el email no existe en la base de datos
        if (resultado.rows.length === 0) {
            registrarActividad(`🔐❌ POST /autenticacion/login - RECHAZADO: Email no registrado (${email}).`);
            return res.status(401).render('error', {
                message: mensajeCredencialesInvalidas,
                error: { status: 401, stack: 'Verifica tus datos e intenta nuevamente.' },
                nombreClinica: 'VetCare Pro'
            });
        }

        const usuario = resultado.rows[0];
        const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);

        // Caso 2: el email existe, pero la contraseña no coincide
        if (!passwordCorrecta) {
            registrarActividad(`🔐❌ POST /autenticacion/login - RECHAZADO: Contraseña incorrecta (${email}).`);
            return res.status(401).render('error', {
                message: mensajeCredencialesInvalidas,
                error: { status: 401, stack: 'Verifica tus datos e intenta nuevamente.' },
                nombreClinica: 'VetCare Pro'
            });
        }

        // Login exitoso: creamos la sesión guardando solo datos NO sensibles
        req.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email
        };

        registrarActividad(`🔐 POST /autenticacion/login - ÉXITO: Sesión iniciada para ${email}.`);
        res.redirect('/');

    } catch (error) {
        registrarActividad(`🔐❌ POST /autenticacion/login - ERROR CRÍTICO: ${error.message}`);
        res.status(500).render('error', {
            message: 'No pudimos procesar tu inicio de sesión en este momento.',
            error: { status: 500, stack: error.message },
            nombreClinica: 'VetCare Pro'
        });
    } finally {
        await conexion.end();
    }
});

/**
 * POST /autenticacion/logout
 * Destruye la sesión activa del usuario.
 */
router.post('/logout', estaAutenticado, (req, res) => {
    const emailUsuario = req.session.usuario.email;

    req.session.destroy((error) => {
        if (error) {
            registrarActividad(`🔐❌ POST /autenticacion/logout - ERROR: ${error.message}`);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        registrarActividad(`🔐 POST /autenticacion/logout - ÉXITO: Sesión cerrada para ${emailUsuario}.`);
        res.redirect('/');
    });
});

export default router;