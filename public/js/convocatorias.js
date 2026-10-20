// public/js/convocatorias.js

let listaConvocatorias = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarConvocatorias();
    configurarEventosFiltros();

    // Formulario de Convocatoria (Crear / Actualizar)
    const formConvocatoria = document.getElementById("formConvocatoria");
    if (formConvocatoria) {
        formConvocatoria.removeAttribute("data-demo");
        formConvocatoria.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(formConvocatoria);
            const data = Object.fromEntries(formData.entries());
            
            data.AprobadaDireccion = document.getElementById("AprobadaDireccion").checked ? 1 : 0;
            const id = document.getElementById("ConvocatoriaID").value;

            try {
                if (id) {
                    await peticionAPI(`/convocatorias/${id}`, "PUT", data);
                    alert("Convocatoria actualizada correctamente");
                } else {
                    await peticionAPI("/convocatorias", "POST", data);
                    alert("Convocatoria registrada correctamente");
                }
                location.reload();
            } catch (err) {
                alert("Error: " + err.message);
            }
        });
    }
});

// Configurar eventos para buscador y filtros en tiempo real
function configurarEventosFiltros() {
    const buscarConvocatoria = document.getElementById("buscarConvocatoria");
    const filtroEstado = document.getElementById("filtroEstado");
    const filtroSoloAbiertas = document.getElementById("filtroSoloAbiertas");

    if (buscarConvocatoria) buscarConvocatoria.addEventListener("input", renderizarConvocatorias);
    if (filtroEstado) filtroEstado.addEventListener("change", renderizarConvocatorias);
    if (filtroSoloAbiertas) filtroSoloAbiertas.addEventListener("change", renderizarConvocatorias);
}

// Cargar convocatorias desde la API
async function cargarConvocatorias() {
    try {
        const res = await peticionAPI("/convocatorias");
        listaConvocatorias = res.datos || [];

        // Calcular contadores para las 4 tarjetas superiores (resumen por estado)
        let cValidar = 0;
        let cCompilar = 0;
        let cPostulada = 0;
        let cDescartada = 0;

        listaConvocatorias.forEach(c => {
            if (c.Estado === "ValidarRequisitos") cValidar++;
            else if (c.Estado === "CompilarExpediente") cCompilar++;
            else if (c.Estado === "Postulada") cPostulada++;
            else if (c.Estado === "Descartada") cDescartada++;
        });

        const etapasValores = document.querySelectorAll(".etapa .valor");
        if (etapasValores.length >= 4) {
            etapasValores[0].textContent = cValidar;
            etapasValores[1].textContent = cCompilar;
            etapasValores[2].textContent = cPostulada;
            etapasValores[3].textContent = cDescartada;
        }

        renderizarConvocatorias();
    } catch (err) {
        console.error("Error al cargar convocatorias:", err);
    }
}

// Dibujar tabla aplicando búsqueda y filtros
function renderizarConvocatorias() {
    const tbody = document.getElementById("tbodyConvocatorias");
    if (!tbody) return;

    const textoBusqueda = (document.getElementById("buscarConvocatoria")?.value || "").toLowerCase().trim();
    const estadoSeleccionado = document.getElementById("filtroEstado")?.value || "";
    const soloAbiertas = document.getElementById("filtroSoloAbiertas")?.checked || false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const filtradas = listaConvocatorias.filter(c => {
        const fondo = (c.NombreFondo || "").toLowerCase();
        const entidad = (c.EntidadFinanciera || "").toLowerCase();
        const coincideTexto = !textoBusqueda || fondo.includes(textoBusqueda) || entidad.includes(textoBusqueda);

        const coincideEstado = !estadoSeleccionado || (c.Estado === estadoSeleccionado);

        let coincideAbiertas = true;
        if (soloAbiertas) {
            const esDescartadaOPostulada = c.Estado === "Descartada" || c.Estado === "Postulada";
            let fechaValida = true;
            if (c.FechaCierre) {
                const fCierre = new Date(c.FechaCierre);
                fCierre.setHours(0, 0, 0, 0);
                if (fCierre < hoy) fechaValida = false;
            }
            coincideAbiertas = !esDescartadaOPostulada && fechaValida;
        }

        return coincideTexto && coincideEstado && coincideAbiertas;
    });

    tbody.innerHTML = "";

    if (filtradas.length === 0) {
        tbody.innerHTML = '<tr class="vacio"><td colspan="7">No se encontraron convocatorias registradas.</td></tr>';
    } else {
        filtradas.forEach(c => {
            // Calcular plazo restante
            let plazoHtml = "";
            if (c.FechaCierre) {
                const fCierre = new Date(c.FechaCierre);
                fCierre.setHours(0, 0, 0, 0);
                const diffTime = fCierre - hoy;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const fechaFormateada = new Date(c.FechaCierre).toLocaleDateString();

                if (diffDays > 0) {
                    const clasePlazo = diffDays <= 10 ? "plazo urgente" : "plazo pronto";
                    plazoHtml = `${fechaFormateada}<span class="${clasePlazo}">en ${diffDays} días</span>`;
                } else if (diffDays === 0) {
                    plazoHtml = `${fechaFormateada}<span class="plazo urgente">cierra hoy</span>`;
                } else {
                    const diasPasados = Math.abs(diffDays);
                    plazoHtml = `${fechaFormateada}<span class="plazo">hace ${diasPasados} días</span>`;
                }
            } else {
                plazoHtml = "Sin fecha";
            }

            // Clases de insignias según el estado
            let badgeClase = "b-violeta";
            if (c.Estado === "CompilarExpediente") badgeClase = "b-dorado";
            else if (c.Estado === "Postulada") badgeClase = "b-ok";
            else if (c.Estado === "Descartada") badgeClase = "b-gris";

            const tr = document.createElement("tr");
            tr.setAttribute("data-id", c.ConvocatoriaID);
            tr.innerHTML = `
                <td class="principal">${c.NombreFondo}</td>
                <td>${c.EntidadFinanciera}</td>
                <td><span class="badge ${badgeClase}">${c.Estado}</span></td>
                <td>${plazoHtml}</td>
                <td><span class="badge ${c.AprobadaDireccion ? 'b-ok' : 'b-gris'}">${c.AprobadaDireccion ? 'Sí' : 'No'}</span></td>
                <td>${c.Observaciones || '—'}</td>
                <td>
                    <div class="acciones">
                        <button type="button" class="btn-icono btn-editar" onclick="editarConvocatoria(${c.ConvocatoriaID})" aria-label="Editar"><span data-icon="edit"></span></button>
                        <button type="button" class="btn-icono peligro btn-eliminar" onclick="eliminarRegistro('convocatorias', ${c.ConvocatoriaID})" aria-label="Eliminar"><span data-icon="trash"></span></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Pie de tabla
    const pie = document.querySelector(".tabla-pie span");
    if (pie) {
        pie.textContent = `Mostrando ${filtradas.length} de ${listaConvocatorias.length} convocatorias · ordenadas por cierre más próximo`;
    }

    pintarIconos();
}

// Función global para eliminar convocatoria
async function eliminarRegistro(modulo, id) {
    if (!confirm("¿Estás seguro de eliminar esta convocatoria?")) return;
    try {
        await peticionAPI(`/${modulo}/${id}`, "DELETE");
        alert("Convocatoria eliminada con éxito");
        location.reload();
    } catch (err) {
        alert("No se pudo eliminar: " + err.message);
    }
}

// Cargar datos en el modal para editar
async function editarConvocatoria(id) {
    try {
        const res = await peticionAPI(`/convocatorias/${id}`);
        const c = res.datos;

        document.getElementById("ConvocatoriaID").value = c.ConvocatoriaID;
        document.getElementById("NombreFondo").value = c.NombreFondo;
        document.getElementById("EntidadFinanciera").value = c.EntidadFinanciera;
        document.getElementById("Estado").value = c.Estado;

        if (c.FechaCierre) {
            document.getElementById("FechaCierre").value = c.FechaCierre.split('T')[0];
        } else {
            document.getElementById("FechaCierre").value = "";
        }

        document.getElementById("AprobadaDireccion").checked = Number(c.AprobadaDireccion) === 1;
        document.getElementById("Observaciones").value = c.Observaciones || "";

        abrirVentana('modalConvocatoria');
    } catch (err) {
        alert("Error al cargar convocatoria: " + err.message);
    }
}