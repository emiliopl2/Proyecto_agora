/* =====================================================
   Ágora - Estructura común de las pantallas internas
   Dibuja la barra lateral (menú) y la barra superior,
   y revisa que haya una sesión iniciada (igual que hacía dashboard.html).

   Cada página solo necesita en <body>:
     data-pagina="donadores"           -> para marcar el menú activo
     data-titulo="Donadores"           -> título de la barra superior
     data-subtitulo="..."              -> texto pequeño debajo del título
   Requiere cargar antes js/ui.js
   ===================================================== */

/* EMI: pon esto en false cuando conectes el login real.
   En true se pueden ver las pantallas sin backend (usa un usuario de ejemplo). */
const MODO_DISENO = true;

const MENU = [
    { id: 'dashboard',     href: 'dashboard.html',     texto: 'Inicio',        icono: 'home' },
    { id: 'donadores',     href: 'donadores.html',     texto: 'Donadores',     icono: 'heart' },
    { id: 'convocatorias', href: 'convocatorias.html', texto: 'Convocatorias', icono: 'file' },
    { id: 'alianzas',      href: 'alianzas.html',      texto: 'Alianzas',      icono: 'building' },
    { id: 'redondeo',      href: 'redondeo.html',      texto: 'Redondeo',      icono: 'coin' }
];

// Los roles vienen de la BD sin acentos; aquí solo se muestran bonitos.
const ROLES = {
    Administracion: 'Administración',
    Contabilidad: 'Contabilidad',
    Vinculacion: 'Vinculación',
    Direccion: 'Dirección'
};

function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

(function () {
    // ---- 1. Sesión (misma idea que el dashboard original) ----
    var usuario = null;
    try { usuario = JSON.parse(localStorage.getItem('usuario')); } catch (e) { usuario = null; }

    if (!usuario) {
        if (MODO_DISENO) {
            usuario = { nombre: 'Laura Martínez', rol: 'Administracion', correo: 'laura@agora.org' };
        } else {
            window.location.href = 'index.html';
            return;
        }
    }

    var rolBonito = ROLES[usuario.rol] || usuario.rol || '';
    var iniciales = (usuario.nombre || '?').split(' ').slice(0, 2).map(function (p) { return p.charAt(0); }).join('').toUpperCase();

    // ---- 2. Barra lateral ----
    var actual = document.body.dataset.pagina;
    var enlaces = MENU.map(function (m) {
        var activo = m.id === actual ? ' aria-current="page"' : '';
        return '<a class="sb-link" href="' + m.href + '"' + activo + '>' + icono(m.icono) + '<span>' + m.texto + '</span></a>';
    }).join('');

    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.innerHTML =
            '<a class="sb-brand" href="dashboard.html">' +
                '<img class="sb-logo" src="img/logo.png" alt="Logo de Ágora A.C.">' +
                '<div><strong>Ágora</strong><span>Convivir para vivir</span></div>' +
            '</a>' +
            '<nav class="sb-nav" aria-label="Módulos">' +
                '<p class="sb-titulo">Módulos</p>' + enlaces +
            '</nav>' +
            '<div class="sb-pie">Ágora A.C. · Sistema de gestión</div>';
    }

    // ---- 3. Barra superior ----
    var topbar = document.getElementById('topbar');
    if (topbar) {
        var titulo = document.body.dataset.titulo || '';
        var sub = document.body.dataset.subtitulo || '';
        topbar.innerHTML =
            '<button class="btn-icono tb-menu" type="button" data-menu aria-label="Abrir menú">' + icono('menu') + '</button>' +
            '<div class="tb-titulo"><h1>' + titulo + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' +
            '<div class="usuario-chip">' +
                '<div class="avatar" aria-hidden="true">' + iniciales + '</div>' +
                '<div class="datos"><div class="nombre" id="topNombre"></div><div class="rol" id="topRol"></div></div>' +
            '</div>' +
            '<button class="btn btn-secundario" type="button" onclick="cerrarSesion()">' + icono('logout') + '<span>Cerrar sesión</span></button>';

        // textContent (no innerHTML) para que un nombre raro nunca se interprete como HTML
        document.getElementById('topNombre').textContent = usuario.nombre || '';
        document.getElementById('topRol').textContent = rolBonito;
    }

    // ---- 4. Fondo oscuro del menú en móvil ----
    if (!document.querySelector('.sb-scrim')) {
        var scrim = document.createElement('div');
        scrim.className = 'sb-scrim';
        document.querySelector('.app-shell').insertBefore(scrim, document.querySelector('.app-main'));
    }

    // ---- 5. Si la página tiene estos ids (como el dashboard original), se llenan ----
    var n = document.getElementById('nombreUsuario');
    var r = document.getElementById('rolUsuario');
    if (n) n.textContent = usuario.nombre || '';
    if (r) r.textContent = 'Rol: ' + rolBonito + (usuario.NombreCompleto ? ' (' + usuario.NombreCompleto + ')' : '');
})();
