// public/js/empresas.js

let listaEmpresas = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarEmpresas();
    configurarEventosFiltros();

    // Formulario de Empresa / Comercio (Crear o Actualizar)
    const formEmpresa = document.getElementById("formEmpresa") || document.getElementById("formComercio");
    if (formEmpresa) {
        formEmpresa.removeAttribute("data-demo");
        formEmpresa.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(formEmpresa);
            const data = Object.fromEntries(formData.entries());
            
            // Si estamos en redondeo.html, aseguramos que el tipo de alianza sea Redondeo
            if (document.body.dataset.pagina === "redondeo") {
                data.TipoAlianza = "Redondeo";
            }

            data.AlineacionEtica = document.getElementById("AlineacionEtica").checked ? 1 : 0;
            const id = document.getElementById("EmpresaID").value;

            try {
                if (id) {
                    await peticionAPI(`/empresas/${id}`, "PUT", data);
                    alert("Empresa actualizada correctamente");
                } else {
                    await peticionAPI("/empresas", "POST", data);
                    alert("Empresa registrada correctamente");
                }
                location.reload();
            } catch (err) {
                alert("Error: " + err.message);
            }
        });
    }

    // Formulario de Bitácora (Panel lateral)
    const formBitacora = document.getElementById("formBitacora");
    if (formBitacora) {
        formBitacora.removeAttribute("data-demo");
        formBitacora.addEventListener("submit", async (e) => {
            e.preventDefault();
            const usuarioSesion = JSON.parse(localStorage.getItem('usuario'));
            const empresaId = document.getElementById("EmpresaID_bitacora").value;
            const canal = document.getElementById("Canal").value;
            const detalleInteraccion = document.getElementById("DetalleInteraccion").value;

            const payload = {
                empresaId: Number(empresaId),
                usuarioId: usuarioSesion ? usuarioSesion.id : 1,
                canal: canal,
                detalleInteraccion: detalleInteraccion
            };

            try {
                await peticionAPI("/bitacora", "POST", payload);
                alert("Interacción registrada en la bitácora");
                await cargarBitacoraEmpresa(empresaId);
                formBitacora.reset();
                document.getElementById("EmpresaID_bitacora").value = empresaId; // Mantener ID
            } catch (err) {
                alert("Error al guardar interacción: " + err.message);
            }
        });
    }
});

// Configurar filtros en tiempo real
function configurarEventosFiltros() {
    const buscarEmpresa = document.getElementById("buscarEmpresa") || document.getElementById("buscarComercio");
    const filtroTipoAlianza = document.getElementById("filtroTipoAlianza");
    const filtroEstatus = document.getElementById("filtroEstatus");
    const filtroSoloAlineadas = document.getElementById("filtroSoloAlineadas");

    if (buscarEmpresa) buscarEmpresa.addEventListener("input", renderizarEmpresas);
    if (filtroTipoAlianza) filtroTipoAlianza.addEventListener("change", renderizarEmpresas);
    if (filtroEstatus) filtroEstatus.addEventListener("change", renderizarEmpresas);
    if (filtroSoloAlineadas) filtroSoloAlineadas.addEventListener("change", renderizarEmpresas);
}

// Cargar empresas desde la API
async function cargarEmpresas() {
    try {
        const res = await peticionAPI("/empresas");
        listaEmpresas = res.datos || [];

        const esRedondeo = document.body.dataset.pagina === "redondeo";
        const empresasContexto = esRedondeo 
            ? listaEmpresas.filter(e => e.TipoAlianza === 'Redondeo') 
            : listaEmpresas;

        // Calcular KPIs superiores
        const totalEmpresas = empresasContexto.length;
        const totalAlineadas = empresasContexto.filter(e => Number(e.AlineacionEtica) === 1).length;
        const totalAceptadas = empresasContexto.filter(e => e.Estatus === 'Aceptaron').length;

        const kpiValores = document.querySelectorAll(".kpi-valor");
        if (kpiValores.length >= 3) {
            kpiValores[0].textContent = totalEmpresas;
            kpiValores[1].textContent = totalAlineadas;
            kpiValores[2].textContent = totalAceptadas;
        }

        renderizarEmpresas();
    } catch (err) {
        console.error("Error al cargar empresas:", err);
    }
}

// Renderizar tablas o tableros según la página activa
function renderizarEmpresas() {
    const esRedondeo = document.body.dataset.pagina === "redondeo";

    if (esRedondeo) {
        renderizarTableroRedondeo();
    } else {
        renderizarTablaAlianzas();
    }
}

// Renderizar tabla estándar para alianzas.html
function renderizarTablaAlianzas() {
    const tbody = document.getElementById("tbodyEmpresas");
    if (!tbody) return;

    const textoBusqueda = (document.getElementById("buscarEmpresa")?.value || "").toLowerCase().trim();
    const tipoSeleccionado = document.getElementById("filtroTipoAlianza")?.value || "";
    const estatusSeleccionado = document.getElementById("filtroEstatus")?.value || "";
    const soloAlineadas = document.getElementById("filtroSoloAlineadas")?.checked || false;

    const filtradas = listaEmpresas.filter(e => {
        const nombre = (e.NombreEmpresa || "").toLowerCase();
        const coincideTexto = !textoBusqueda || nombre.includes(textoBusqueda);
        const coincideTipo = !tipoSeleccionado || (e.TipoAlianza === tipoSeleccionado);
        const coincideEstatus = !estatusSeleccionado || (e.Estatus === estatusSeleccionado);
        const coincideAlineada = !soloAlineadas || (Number(e.AlineacionEtica) === 1);

        return coincideTexto && coincideTipo && coincideEstatus && coincideAlineada;
    });

    tbody.innerHTML = "";

    if (filtradas.length === 0) {
        tbody.innerHTML = '<tr class="vacio"><td colspan="7">No se encontraron empresas registradas.</td></tr>';
    } else {
        filtradas.forEach(e => {
            const tr = document.createElement("tr");
            tr.setAttribute("data-id", e.EmpresaID);
            tr.innerHTML = `
                <td class="principal">${e.NombreEmpresa}</td>
                <td><span class="badge b-ok">${e.TipoAlianza}</span></td>
                <td><span class="badge ${Number(e.AlineacionEtica) === 1 ? 'b-ok' : 'b-err'}">${Number(e.AlineacionEtica) === 1 ? 'Alineada' : 'No alineada'}</span></td>
                <td><span class="badge b-celeste">${e.Estatus}</span></td>
                <td>${e.EnlaceContacto || '—'}</td>
                <td>0<span class="secundario">interacciones</span></td>
                <td>
                    <div class="acciones">
                        <button type="button" class="btn-icono btn-bitacora" onclick="abrirBitacora(${e.EmpresaID}, '${e.NombreEmpresa}')" aria-label="Bitácora"><span data-icon="message"></span></button>
                        <button type="button" class="btn-icono btn-editar" onclick="editarEmpresa(${e.EmpresaID})" aria-label="Editar"><span data-icon="edit"></span></button>
                        <button type="button" class="btn-icono peligro btn-eliminar" onclick="eliminarRegistro('empresas', ${e.EmpresaID})" aria-label="Eliminar"><span data-icon="trash"></span></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    const pie = document.querySelector(".tabla-pie span");
    if (pie) {
        pie.textContent = `Mostrando ${filtradas.length} de ${listaEmpresas.length} empresas`;
    }

    pintarIconos();
}

// Renderizar tablero Kanban para redondeo.html
function renderizarTableroRedondeo() {
    const colSinContacto = document.getElementById("colSinContacto");
    const colContactadas = document.getElementById("colContactadas");
    const colAceptaron = document.getElementById("colAceptaron");
    if (!colSinContacto || !colContactadas || !colAceptaron) return;

    const textoBusqueda = (document.getElementById("buscarComercio")?.value || "").toLowerCase().trim();
    const comerciosRedondeo = listaEmpresas.filter(e => e.TipoAlianza === 'Redondeo');

    const filtrados = comerciosRedondeo.filter(e => {
        const nombre = (e.NombreEmpresa || "").toLowerCase();
        return !textoBusqueda || nombre.includes(textoBusqueda);
    });

    // Limpiar columnas manteniendo las cabeceras
    colSinContacto.innerHTML = '<div class="columna-cab"><span>Sin contacto</span><span class="conteo">0</span></div>';
    colContactadas.innerHTML = '<div class="columna-cab"><span>Contactados</span><span class="conteo">0</span></div>';
    colAceptaron.innerHTML = '<div class="columna-cab"><span>Aceptaron</span><span class="conteo">0</span></div>';

    let listSin = [];
    let listCont = [];
    let listAcep = [];

    filtrados.forEach(e => {
        if (e.Estatus === 'SinContacto') listSin.push(e);
        else if (e.Estatus === 'Contactadas') listCont.push(e);
        else if (e.Estatus === 'Aceptaron') listAcep.push(e);
    });

    // Rellenar Sin Contacto
    if (listSin.length === 0) {
        colSinContacto.innerHTML += '<div class="estado-vacio">Aún no hay comercios en esta etapa.</div>';
    } else {
        listSin.forEach(e => colSinContacto.appendChild(crearTarjetaKanban(e)));
        colSinContacto.querySelector('.conteo').textContent = listSin.length;
    }

    // Rellenar Contactados
    if (listCont.length === 0) {
        colContactadas.innerHTML += '<div class="estado-vacio">Aún no hay comercios en esta etapa.</div>';
    } else {
        listCont.forEach(e => colContactadas.appendChild(crearTarjetaKanban(e)));
        colContactadas.querySelector('.conteo').textContent = listCont.length;
    }

    // Rellenar Aceptaron
    if (listAcep.length === 0) {
        colAceptaron.innerHTML += '<div class="estado-vacio">Aún no hay comercios en esta etapa.</div>';
    } else {
        listAcep.forEach(e => colAceptaron.appendChild(crearTarjetaKanban(e)));
        colAceptaron.querySelector('.conteo').textContent = listAcep.length;
    }

    pintarIconos();
}

function crearTarjetaKanban(e) {
    const article = document.createElement("article");
    article.className = "tarjeta";
    article.setAttribute("data-id", e.EmpresaID);
    article.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <h3>${e.NombreEmpresa}</h3>
            <span class="badge ${Number(e.AlineacionEtica) === 1 ? 'b-ok' : 'b-err'}">${Number(e.AlineacionEtica) === 1 ? 'Alineada' : 'No alineada'}</span>
        </div>
        <p class="dato"><span data-icon="user"></span> ${e.EnlaceContacto || 'Sin contacto'}</p>
        <div class="pie">
            <button type="button" class="btn btn-ghost btn-bitacora" onclick="abrirBitacora(${e.EmpresaID}, '${e.NombreEmpresa}')">
                <span data-icon="message"></span> Bitácora
            </button>
            <div class="acciones">
                <button type="button" class="btn-icono btn-editar" onclick="editarEmpresa(${e.EmpresaID})" aria-label="Editar"><span data-icon="edit"></span></button>
                <button type="button" class="btn-icono peligro btn-eliminar" onclick="eliminarRegistro('empresas', ${e.EmpresaID})" aria-label="Eliminar"><span data-icon="trash"></span></button>
            </div>
        </div>
    `;
    return article;
}

// Abrir Bitácora en el panel lateral
async function abrirBitacora(empresaId, nombreEmpresa) {
    document.getElementById("bitacoraEmpresa").textContent = nombreEmpresa;
    document.getElementById("EmpresaID_bitacora").value = empresaId;
    abrirVentana('panelBitacora');
    await cargarBitacoraEmpresa(empresaId);
}

async function cargarBitacoraEmpresa(empresaId) {
    try {
        const res = await peticionAPI(`/bitacora/empresa/${empresaId}`);
        const lista = document.getElementById("listaBitacora");
        if (!lista) return;
        lista.innerHTML = "";

        const registros = res.datos || [];
        if (registros.length === 0) {
            lista.innerHTML = '<p class="estado-vacio">No hay interacciones registradas.</p>';
            return;
        }

        registros.forEach(b => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="cuando">${new Date(b.FechaInteraccion).toLocaleDateString()} · <span class="badge b-azul">${b.Canal}</span></div>
                <div class="detalle">${b.DetalleInteraccion}</div>
                <div class="quien">Registró: ${b.Responsable}</div>
            `;
            lista.appendChild(li);
        });
    } catch (err) {
        console.error("Error al cargar bitácora:", err);
    }
}

// Cargar datos en el modal para editar empresa
async function editarEmpresa(id) {
    try {
        const res = await peticionAPI(`/empresas/${id}`);
        const e = res.datos;

        document.getElementById("EmpresaID").value = e.EmpresaID;
        document.getElementById("NombreEmpresa").value = e.NombreEmpresa;
        document.getElementById("TipoAlianza").value = e.TipoAlianza;
        document.getElementById("Estatus").value = e.Estatus;
        document.getElementById("EnlaceContacto").value = e.EnlaceContacto || "";
        document.getElementById("AlineacionEtica").checked = Number(e.AlineacionEtica) === 1;

        abrirVentana('modalEmpresa') || abrirVentana('modalComercio');
    } catch (err) {
        alert("Error al cargar datos de la empresa: " + err.message);
    }
}

// Eliminar registro general
async function eliminarRegistro(modulo, id) {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
        await peticionAPI(`/${modulo}/${id}`, "DELETE");
        alert("Registro eliminado con éxito");
        location.reload();
    } catch (err) {
        alert("No se pudo eliminar: " + err.message);
    }
}