// src/utils/crypto.helper.js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// Convertimos la llave de hexadecimal (64 caracteres) a Buffer de 32 bytes
const SECRET_KEY = Buffer.from(process.env.AES_SECRET_KEY, 'hex');

/**
 * Cifra un texto o payload plano usando AES-256-CBC
 * @param {string} textoPlano - El texto o JSON stringificado que deseas proteger
 * @returns {object} Objeto que contiene el IV y el texto cifrado
 */

function cifrar(textoPlano) {

    if (!textoPlano) return null;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let cifrado = cipher.update(textoPlano, 'utf8', 'hex');
    cifrado += cipher.final('hex');

    // Retornamos ambos unidos por ':' en un solo string
    return `${iv.toString('hex')}:${cifrado}`;
}

/**
 * Descifra un texto previamente cifrado con AES-256-CBC
 * @param {string} datosCifrados - El texto cifrado en hexadecimal
 * @param {string} ivHex - El IV utilizado al momento de cifrar (en hexadecimal)
 * @returns {string} El texto original plano
 */

function descifrar(textoCifradoCompleto) {
    
    if (!textoCifradoCompleto) return null;
    try {

        const [ivHex, datosCifrados] = textoCifradoCompleto.split(':');
        if (!ivHex || !datosCifrados) return textoCifradoCompleto; // Si no tiene formato cifrado, regresa el original
        
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
        let descifrado = decipher.update(datosCifrados, 'hex', 'utf8');
        descifrado += decipher.final('utf8');
        return descifrado;

    } catch (err) {
        return textoCifradoCompleto; // Fallback por si hay datos antiguos sin cifrar en la BD
    }
}

module.exports = {
    cifrar,
    descifrar
};