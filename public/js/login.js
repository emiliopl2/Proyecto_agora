// public/js/login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const NombreCompleto = document.getElementById('NombreCompleto').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('mensajeError');

    errorDiv.classList.add('hidden');

    try {
        // Usamos tu función centralizada peticionAPI
        const data = await peticionAPI("/auth/login", "POST", {
            NombreCompleto,
            password
        });

        if (data.exito) {
            // 1. Guardar el token para que el backend autorice las peticiones
            localStorage.setItem('tokenAgora', data.token);
            
            // 2. Guardar datos opcionales del usuario si los necesitas mostrar en la interfaz
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // 3. Redirigir al dashboard
            window.location.href = 'dashboard.html';
        }
    } catch (err) {
        // Como peticionAPI lanza un Error si falla, lo atrapamos aquí
        errorDiv.textContent = err.message || 'Error de conexión con el servidor.';
        errorDiv.classList.remove('hidden');
    }
});