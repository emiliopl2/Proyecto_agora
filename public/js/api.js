// public/js/api.js
const API_URL = "http://localhost:3000/api";

async function peticionAPI(endpoint, metodo = "GET", datos = null) {
    const opciones = {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (datos) {
        opciones.body = JSON.stringify(datos);
    }

    try {
        const respuesta = await fetch(`${API_URL}${endpoint}`, opciones);
        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje || resultado.error || "Error en la petición");
        }

        return resultado;
    } catch (err) {
        console.error("Error API:", err);
        throw err;
    }
}