// public/js/donadores.js
// Variables globales para mantener los datos originales en memoria
let listaDonantes = [];
let listaDonaciones = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarDonantes();
    cargarDonaciones();
    cargarSelectDonantes();
    configurarEventosFiltros();
    configurarEventosTablaDonantes(); // <--- Registramos el evento de la tabla una sola vez aquí

    // Evento Formulario Donante (Crear / Actualizar)
    const formDonante = document.getElementById("formDonante");
    if (formDonante) {
        formDonante.removeAttribute("data-demo");
        formDonante.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(formDonante);
            const data = Object.fromEntries(formData.entries());
            const id = document.getElementById("DonanteID").value;

            try {
                if (id) {
                    await peticionAPI(`/donantes/${id}`, "PUT", data);
                    alert("Donante actualizado correctamente");
                } else {
                    await peticionAPI("/donantes", "POST", data);
                    alert("Donante registrado correctamente");
                }
                location.reload();
            } catch (err) {
                alert("Error: " + err.message);
            }
        });
    }

    // Evento Formulario Donación (Crear / Actualizar)
    const formDonacion = document.getElementById("formDonacion");
    if (formDonacion) {
        formDonacion.removeAttribute("data-demo");
        formDonacion.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(formDonacion);
            const data = Object.fromEntries(formData.entries());
            
            data.RequiereRecibo = document.getElementById("RequiereRecibo").checked ? 1 : 0;
            data.ReciboEmitido = document.getElementById("ReciboEmitido").checked ? 1 : 0;

            const id = document.getElementById("DonacionID").value;

            try {
                if (id) {
                    await peticionAPI(`/donaciones/${id}`, "PUT", data);
                    alert("Donación actualizada correctamente");
                } else {
                    await peticionAPI("/donaciones", "POST", data);
                    alert("Donación registrada correctamente");
                }
                location.reload();
            } catch (err) {
                alert("Error: " + err.message);
            }
        });
    }
});

// Configurar clics en la tabla de donantes de forma segura
function configurarEventosTablaDonantes() {
    const tablaDonantes = document.getElementById('tablaDonantes');
    if (!tablaDonantes) return;

    tablaDonantes.addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.btn-editar');
        if (!btnEditar) return;

        const fila = e.target.closest('tr');
        if (!fila) return;

        const idDonante = fila.getAttribute('data-id');

        try {
            const respuesta = await peticionAPI(`/donantes/${idDonante}`, "GET");
            
            if (respuesta.exito) {
                const donante = respuesta.datos;

                // Corregido: Se usan los IDs exactos definidos en el HTML del modal
                document.getElementById('DonanteID').value = donante.DonanteID || '';
                document.getElementById('Nombre').value = donante.Nombre || '';
                document.getElementById('Apellido').value = donante.Apellido || '';
                document.getElementById('Correo').value = donante.Correo || '';
                document.getElementById('Telefono').value = donante.Telefono || '';
                document.getElementById('NivelContribuyente').value = donante.NivelContribuyente || 'Semilla';
                document.getElementById('RazonSocial').value = donante.RazonSocial || '';
                document.getElementById('RFC').value = donante.RFC || '';
                document.getElementById('RegimenFiscal').value = donante.RegimenFiscal || '';
                document.getElementById('CodigoPostal').value = donante.CodigoPostal || '';
                document.getElementById('UsoCFDI').value = donante.UsoCFDI || '';

                // Mostrar el modal de edición
                const modal = document.getElementById('modalDonante');
                if (modal) modal.classList.add('activo'); // O la clase correspondiente que maneje ui.js para mostrar la ventana
            }
        } catch (err) {
            console.error(err);
            alert("No se pudo cargar la información del donante para editar.");
        }
    });
}

// Registrar eventos en los campos de filtro
function configurarEventosFiltros() {
    const buscarDonante = document.getElementById("buscarDonante");
    const filtroNivel = document.getElementById("filtroNivel");

    if (buscarDonante) buscarDonante.addEventListener("input", renderizarDonantes);
    if (filtroNivel) filtroNivel.addEventListener("change", renderizarDonantes);

    const buscarDonacion = document.getElementById("buscarDonacion");
    const filtroEstadoProceso = document.getElementById("filtroEstadoProceso");
    const filtroReciboPendiente = document.getElementById("filtroReciboPendiente");

    if (buscarDonacion) buscarDonacion.addEventListener("input", renderizarDonaciones);
    if (filtroEstadoProceso) filtroEstadoProceso.addEventListener("change", renderizarDonaciones);
    if (filtroReciboPendiente) filtroReciboPendiente.addEventListener("change", renderizarDonaciones);
}

// Cargar Donantes desde API
async function cargarDonantes() {
    try {
        const res = await peticionAPI("/donantes");
        listaDonantes = res.datos || [];

        const kpiValores = document.querySelectorAll(".kpi-valor");
        if (kpiValores.length > 0) {
            kpiValores[0].textContent = listaDonantes.length;
        }

        renderizarDonantes();
    } catch (err) {
        console.error("Error al cargar donantes:", err);
    }
}

// Dibujar la tabla de Donantes aplicando filtros
function renderizarDonantes() {
    const tbody = document.getElementById("tbodyDonantes");
    if (!tbody) return;

    const textoBusqueda = (document.getElementById("buscarDonante")?.value || "").toLowerCase().trim();
    const nivelSeleccionado = document.getElementById("filtroNivel")?.value || "";

    const donantesFiltrados = listaDonantes.filter(d => {
        const nombreCompleto = `${d.Nombre || ''} ${d.Apellido || ''}`.toLowerCase();
        const correo = (d.Correo || '').toLowerCase();
        const coincideTexto = !textoBusqueda || nombreCompleto.includes(textoBusqueda) || correo.includes(textoBusqueda);
        const coincideNivel = !nivelSeleccionado || (d.NivelContribuyente === nivelSeleccionado);
        return coincideTexto && coincideNivel;
    });

    tbody.innerHTML = "";

    if (donantesFiltrados.length === 0) {
        tbody.innerHTML = '<tr class="vacio"><td colspan="7">No se encontraron donantes con los filtros seleccionados.</td></tr>';
    } else {
        donantesFiltrados.forEach(d => {
            const tr = document.createElement("tr");
            tr.setAttribute("data-id", d.DonanteID);
            tr.innerHTML = `
                <td class="principal">${d.Nombre} ${d.Apellido}</td>
                <td>${d.Correo}<span class="secundario">${d.Telefono || '—'}</span></td>
                <td><span class="badge b-dorado">${d.NivelContribuyente || 'Semilla'}</span></td>
                <td><span class="badge b-rosa">Calculado</span></td>
                <td class="num">$${Number(d.TotalDonado || 0).toFixed(2)}</td>
                <td>${d.RFC || '—'}</td>
                <td>
                    <div class="acciones">
                        <button type="button" class="btn-icono btn-editar" data-abrir="modalDonante" aria-label="Editar"><span data-icon="edit"></span></button>
                        <button type="button" class="btn-icono peligro btn-eliminar" onclick="eliminarRegistro('donantes', ${d.DonanteID})" aria-label="Eliminar"><span data-icon="trash"></span></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    const pieSpan = document.querySelector("#panelDonantes .tabla-pie span");
    if (pieSpan) {
        pieSpan.textContent = `Mostrando ${donantesFiltrados.length} de ${listaDonantes.length} donantes`;
    }

    pintarIconos();
}

// Cargar Donaciones desde API
async function cargarDonaciones() {
    try {
        const res = await peticionAPI("/donaciones");
        listaDonaciones = res.datos || [];

        let totalDonado = 0;
        let recibosPendientes = 0;

        listaDonaciones.forEach(d => {
            totalDonado += Number(d.Monto || 0);
            if (Number(d.RequiereRecibo) === 1 && Number(d.ReciboEmitido) === 0) {
                recibosPendientes++;
            }
        });

        const kpiValores = document.querySelectorAll(".kpi-valor");
        if (kpiValores.length > 1) {
            kpiValores[1].textContent = `$${totalDonado.toFixed(2)}`;
        }
        if (kpiValores.length > 2) {
            kpiValores[2].textContent = recibosPendientes;
        }

        renderizarDonaciones();
    } catch (err) {
        console.error("Error al cargar donaciones:", err);
    }
}

// Dibujar la tabla de Donaciones aplicando filtros
function renderizarDonaciones() {
    const tbody = document.getElementById("tbodyDonaciones");
    if (!tbody) return;

    const textoBusqueda = (document.getElementById("buscarDonacion")?.value || "").toLowerCase().trim();
    const estadoSeleccionado = document.getElementById("filtroEstadoProceso")?.value || "";
    const soloRecibosPendientes = document.getElementById("filtroReciboPendiente")?.checked || false;

    const donacionesFiltradas = listaDonaciones.filter(d => {
        const nombreDonante = (d.Donante || '').toLowerCase();
        const coincideTexto = !textoBusqueda || nombreDonante.includes(textoBusqueda);
        const coincideEstado = !estadoSeleccionado || (d.EstadoProceso === estadoSeleccionado);
        const coincideRecibo = !soloRecibosPendientes || (Number(d.RequiereRecibo) === 1 && Number(d.ReciboEmitido) === 0);
        return coincideTexto && coincideEstado && coincideRecibo;
    });

    tbody.innerHTML = "";

    if (donacionesFiltradas.length === 0) {
        tbody.innerHTML = '<tr class="vacio"><td colspan="9">No se encontraron donaciones con los filtros seleccionados.</td></tr>';
    } else {
        donacionesFiltradas.forEach((d, index) => {
            const tr = document.createElement("tr");
            tr.setAttribute("data-id", d.DonacionID);
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td class="principal">${d.Donante}</td>
                <td class="num">$${Number(d.Monto).toFixed(2)}</td>
                <td>${d.Canal}</td>
                <td><span class="badge b-ok">${d.EstadoProceso}</span></td>
                <td>${Number(d.RequiereRecibo) === 1 ? 'Sí' : 'No'}</td>
                <td>${Number(d.ReciboEmitido) === 1 ? 'Sí' : 'No'}</td>
                <td>${d.FechaDonacion ? new Date(d.FechaDonacion).toLocaleDateString() : '—'}</td>
                <td>
                    <div class="acciones">
                        <button type="button" class="btn-icono peligro btn-eliminar" onclick="eliminarRegistro('donaciones', ${d.DonacionID})" aria-label="Eliminar"><span data-icon="trash"></span></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    const paneles = document.querySelectorAll("[role='tabpanel']");
    if (paneles.length > 1) {
        const pieDonaciones = paneles[1].querySelector(".tabla-pie span");
        if (pieDonaciones) {
            pieDonaciones.textContent = `Mostrando ${donacionesFiltradas.length} de ${listaDonaciones.length} donaciones`;
        }
    }

    pintarIconos();
}

async function cargarSelectDonantes() {
    try {
        const res = await peticionAPI("/donantes");
        const select = document.getElementById("DonanteID_donacion");
        if (!select) return;
        select.innerHTML = '<option value="">Selecciona un donante</option>';
        const donantes = res.datos || [];
        donantes.forEach(d => {
            const opt = document.createElement("option");
            opt.value = d.DonanteID;
            opt.textContent = `${d.Nombre} ${d.Apellido}`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Error al cargar select de donantes:", err);
    }
}

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