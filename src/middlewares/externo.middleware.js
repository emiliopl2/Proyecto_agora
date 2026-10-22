// src/middlewares/externo.middleware.js
const verificarApiKeyExterna = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    // Puedes validar contra una clave secreta definida en el .env del backend
    if (!apiKey || apiKey !== process.env.NODE_API_KEY) {
        return res.status(401).json({ 
            exito: false, 
            mensaje: "Acceso denegado. API Key de nodo inválida o ausente." 
        });
    }
    
    next();
};

module.exports = { verificarApiKeyExterna };