// public/js/api.js
const API_URL = "/api";

async function peticionAPI(endpoint, metodo = "GET", datos = null) {
    // 1. Recuperar el token guardado en el navegador
    const token = localStorage.getItem('tokenAgora');

    const opciones = {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            // 2. Inyectar automáticamente la cabecera Authorization si el token existe
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    };

    if (datos) {
        opciones.body = JSON.stringify(datos);
    }

    try {
        const respuesta = await fetch(`${API_URL}${endpoint}`, opciones);

        // 3. Si el token expiró o no es válido, limpiar sesión y redirigir al login
        if (respuesta.status === 401 || respuesta.status === 403) {
            localStorage.removeItem('tokenAgora');
            window.location.href = 'index.html'; // Cambia por la ruta de tu vista de login
            throw new Error("Sesión expirada o no autorizada.");
        }

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