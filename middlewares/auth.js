/**
 * Middleware: estaAutenticado
 * Protege rutas que SOLO pueden ver usuarios logueados (ej: un panel privado).
 * Si no hay sesión activa, redirige al login.
 */
export const estaAutenticado = (req, res, next) => {
    if (req.session.usuario) {
        return next(); // Hay sesión → dejamos pasar el request
    }
    return res.redirect('/autenticacion/login');
};

/**
 * Middleware: esInvitado
 * Protege rutas que SOLO tienen sentido para quien NO ha iniciado sesión
 * (ej: no tiene sentido mostrarle el formulario de login a alguien ya logueado).
 */
export const esInvitado = (req, res, next) => {
    if (!req.session.usuario) {
        return next(); // No hay sesión → dejamos pasar el request
    }
    return res.redirect('/');
};