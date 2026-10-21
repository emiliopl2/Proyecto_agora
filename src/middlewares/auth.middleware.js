const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens (en producción usa process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura_agora_2026';

// Middleware para verificar que el usuario envió un token válido
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ exito: false, mensaje: "Acceso denegado. No se proporcionó token de autenticación." });
    }

    const token = authHeader.split(' ')[1]; // Formato esperado: "Bearer <token>"
    if (!token) {
        return res.status(401).json({ exito: false, mensaje: "Formato de token inválido." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded; // Adjuntamos los datos del usuario decodificados a la petición
        next();
    } catch (err) {
        return res.status(403).json({ exito: false, mensaje: "Token inválido o expirado." });
    }
};

// Middleware para restringir acciones exclusivamente a rol Administrador
const verificarRolAdmin = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== 'Administrador') {
        return res.status(403).json({ exito: false, mensaje: "Acceso prohibido. Se requiere rol de Administrador." });
    }
    next();
};

module.exports = {
    verificarToken,
    verificarRolAdmin
};