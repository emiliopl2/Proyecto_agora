/* =====================================================
   Ágora - Utilidades de interfaz (SOLO apariencia, sin lógica de negocio)
   - Íconos en SVG
   - Abrir / cerrar ventanas y paneles laterales
   - Pestañas
   - Mostrar / ocultar contraseña
   ===================================================== */

const ICONOS = {
    home:     '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    heart:    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    file:     '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    building: '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/>',
    coin:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.5h-3a1.8 1.8 0 0 0 0 3.5h4"/>',
    plus:     '<path d="M12 5v14M5 12h14"/>',
    edit:     '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash:    '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
    search:   '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    x:        '<path d="M18 6L6 18M6 6l12 12"/>',
    logout:   '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    menu:     '<path d="M4 6h16M4 12h16M4 18h16"/>',
    alert:    '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    message:  '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    check:    '<path d="M5 12l5 5L20 7"/>',
    eye:      '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    mail:     '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    lock:     '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    user:     '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    clock:    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};

// El dibujo SVG suelto
function svgIcono(nombre) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + (ICONOS[nombre] || '') + '</svg>';
}

// El ícono ya envuelto con su tamaño (para usarlo dentro de textos HTML armados con JS)
function icono(nombre) {
    return '<span class="icon">' + svgIcono(nombre) + '</span>';
}

function pintarIconos(raiz) {
    (raiz || document).querySelectorAll('[data-icon]').forEach(function (el) {
        if (el.dataset.pintado) return;
        el.innerHTML = svgIcono(el.dataset.icon);
        el.classList.add('icon');
        el.dataset.pintado = '1';
    });
}

/* ---------- Ventanas y paneles ---------- */
function abrirVentana(id) {
    var v = document.getElementById(id);
    if (!v) return;
    v.classList.add('abierto');
    v.dataset.retorno = document.activeElement ? (document.activeElement.id || '') : '';
    var primero = v.querySelector('input:not([type=hidden]), select, textarea');
    if (primero) setTimeout(function () { primero.focus(); }, 30);
}

function cerrarVentana(v) {
    if (!v) return;
    v.classList.remove('abierto');
}

document.addEventListener('click', function (e) {
    var abrir = e.target.closest('[data-abrir]');
    if (abrir) {
        e.preventDefault();
        abrirVentana(abrir.dataset.abrir);
        return;
    }
    var cerrar = e.target.closest('[data-cerrar]');
    if (cerrar) {
        cerrarVentana(cerrar.closest('.overlay'));
        return;
    }
    // clic en el fondo oscuro
    if (e.target.classList && e.target.classList.contains('overlay')) {
        cerrarVentana(e.target);
    }
    // menú lateral en pantallas pequeñas
    if (e.target.closest('[data-menu]')) {
        document.body.classList.toggle('sb-open');
    } else if (e.target.closest('.sb-scrim')) {
        document.body.classList.remove('sb-open');
    }
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.overlay.abierto').forEach(cerrarVentana);
        document.body.classList.remove('sb-open');
    }
});

/* ---------- Pestañas ---------- */
function activarPestana(boton) {
    var grupo = boton.closest('.tabs');
    grupo.querySelectorAll('.tab').forEach(function (t) {
        t.classList.remove('activo');
        t.setAttribute('aria-selected', 'false');
        var p = document.getElementById(t.dataset.tab);
        if (p) p.hidden = true;
    });
    boton.classList.add('activo');
    boton.setAttribute('aria-selected', 'true');
    var panel = document.getElementById(boton.dataset.tab);
    if (panel) panel.hidden = false;
}

document.addEventListener('click', function (e) {
    var tab = e.target.closest('.tab[data-tab]');
    if (tab) activarPestana(tab);
});

/* ---------- Mostrar / ocultar contraseña ---------- */
document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ver-password]');
    if (!b) return;
    var campo = document.getElementById(b.dataset.verPassword);
    if (!campo) return;
    var visible = campo.type === 'text';
    campo.type = visible ? 'password' : 'text';
    b.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
});

/* ---------- Al cargar ---------- */
document.addEventListener('DOMContentLoaded', function () {
    pintarIconos();

    // Mientras estemos en fase de diseño, los formularios con data-demo no recargan la página.
    // Para conectarlos al backend: quitar el atributo data-demo y escuchar el evento 'submit'.
    document.querySelectorAll('form[data-demo]').forEach(function (f) {
        f.addEventListener('submit', function (e) { e.preventDefault(); });
    });
});
