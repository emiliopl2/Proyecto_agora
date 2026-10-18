// Colores del logo disponibles como clases de Tailwind (bg-azul-600, text-rosa-600, etc.)
// Este archivo debe cargarse DESPUÉS del script de Tailwind CDN.
// El diseño de las pantallas vive en css/agora.css, así que esto es opcional
// y solo sirve si el equipo quiere seguir usando clases de Tailwind.
// (si el CDN no cargó, por ejemplo sin internet, simplemente no hace nada)
if (typeof tailwind !== 'undefined') tailwind.config = {
    theme: {
        extend: {
            colors: {
                azul:    { 50: '#f3f5fd', 100: '#e4e9fb', 500: '#4a66dd', 600: '#304ec7', 700: '#2740a8', 900: '#18227a', 950: '#0f1650' },
                rosa:    { 100: '#f8e8f1', 200: '#efd0e2', 500: '#c070a0', 600: '#a8487f' },
                celeste: { 100: '#dff1f9', 500: '#61b5da', 700: '#0f6a8f' },
                violeta: { 100: '#ebe6f5', 500: '#775eaa', 700: '#5a3f8f' },
                dorado:  { 100: '#f8efdc', 500: '#d6b473', 700: '#7a5b1c' },
                tinta:   '#1b2150'
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif']
            }
        }
    }
};
