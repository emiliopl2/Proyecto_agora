// public/js/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
    await cargarResumenDashboard();
});

async function cargarResumenDashboard() {
    try {
        // Consultar los módulos necesarios en paralelo
        const [resDonaciones, resConvocatorias, resEmpresas, resExpediente] = await Promise.all([
            peticionAPI("/donaciones").catch(() => ({ datos: [] })),
            peticionAPI("/convocatorias").catch(() => ({ datos: [] })),
            peticionAPI("/empresas").catch(() => ({ datos: [] })),
            peticionAPI("/expediente").catch(() => ({ datos: [] }))
        ]);

        const donaciones = resDonaciones.datos || [];
        const convocatorias = resConvocatorias.datos || [];
        const empresas = resEmpresas.datos || [];
        const documentos = resExpediente.datos || [];

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // 1. KPI: Recibos pendientes de emitir (RequiereRecibo = 1 y ReciboEmitido = 0)
        const recibosPendientes = donaciones.filter(d => Number(d.RequiereRecibo) === 1 && Number(d.ReciboEmitido) === 0).length;

        // 2. KPI: Convocatorias abiertas (Estado diferente a Descartada / Postulada y con fecha vigente)
        const convocatoriasAbiertas = convocatorias.filter(c => {
            const esCerrada = c.Estado === "Descartada" || c.Estado === "Postulada";
            if (esCerrada) return false;
            if (c.FechaCierre) {
                const fCierre = new Date(c.FechaCierre);
                fCierre.setHours(0, 0, 0, 0);
                return fCierre >= hoy;
            }
            return true;
        }).length;

        // 3. KPI: Documentos vencidos o por vencer (en los próximos 30 días)
        let documentosVencidosOPorVencer = 0;
        documentos.forEach(doc => {
            if (doc.FechaVencimiento) {
                const fVenc = new Date(doc.FechaVencimiento);
                fVenc.setHours(0, 0, 0, 0);
                const diffDias = Math.ceil((fVenc - hoy) / (1000 * 60 * 60 * 24));
                if (diffDias <= 30) {
                    documentosVencidosOPorVencer++;
                }
            }
        });

        // 4. KPI: Alianzas aceptadas (Estatus === 'Aceptaron')
        const alianzasAceptadas = empresas.filter(e => e.Estatus === "Aceptaron").length;

        // Actualizar las tarjetas KPI superiores en la interfaz
        const kpiValores = document.querySelectorAll(".kpi-valor");
        if (kpiValores.length >= 4) {
            kpiValores[0].textContent = recibosPendientes;
            kpiValores[1].textContent = convocatoriasAbiertas;
            kpiValores[2].textContent = documentosVencidosOPorVencer;
            kpiValores[3].textContent = alianzasAceptadas;
        }

        // Construir dinámicamente la lista "Requiere atención"
        const listaAvisos = document.getElementById("listaAvisos");
        if (listaAvisos) {
            listaAvisos.innerHTML = "";
            let avisosHtml = "";

            // Avisos de documentos vencidos o por renovar
            documentos.forEach(doc => {
                if (doc.FechaVencimiento) {
                    const fVenc = new Date(doc.FechaVencimiento);
                    fVenc.setHours(0, 0, 0, 0);
                    const diffDias = Math.ceil((fVenc - hoy) / (1000 * 60 * 60 * 24));

                    if (diffDias < 0) {
                        avisosHtml += `
                            <li class="aviso">
                                <span class="icono t-rosa"><span data-icon="alert"></span></span>
                                <div class="info"><strong>${doc.NombreDocumento || doc.Nombre || 'Documento institucional'}</strong><span>Documento institucional · venció hace ${Math.abs(diffDias)} días</span></div>
                                <span class="badge b-err">Vencido</span>
                            </li>
                        `;
                    } else if (diffDias <= 30) {
                        avisosHtml += `
                            <li class="aviso">
                                <span class="icono t-dorado"><span data-icon="clock"></span></span>
                                <div class="info"><strong>${doc.NombreDocumento || doc.Nombre || 'Documento institucional'}</strong><span>Documento institucional · vence en ${diffDias} días</span></div>
                                <span class="badge b-dorado">Por renovar</span>
                            </li>
                        `;
                    }
                }
            });

            // Avisos de convocatorias cerrando próximamente
            convocatorias.forEach(c => {
                if (c.FechaCierre && c.Estado !== "Descartada" && c.Estado !== "Postulada") {
                    const fCierre = new Date(c.FechaCierre);
                    fCierre.setHours(0, 0, 0, 0);
                    const diffDias = Math.ceil((fCierre - hoy) / (1000 * 60 * 60 * 24));

                    if (diffDias >= 0 && diffDias <= 15) {
                        avisosHtml += `
                            <li class="aviso">
                                <span class="icono t-dorado"><span data-icon="clock"></span></span>
                                <div class="info"><strong>${c.NombreFondo}</strong><span>Convocatoria · cierra en ${diffDias === 0 ? 'hoy' : diffDias + ' días'}</span></div>
                                <span class="badge b-dorado">Cierra pronto</span>
                            </li>
                        `;
                    }
                }
            });

            if (avisosHtml === "") {
                avisosHtml = '<li class="aviso" style="justify-content:center; color: var(--texto-suave); padding: 20px;">No hay alertas pendientes en este momento.</li>';
            }

            listaAvisos.innerHTML = avisosHtml;
            pintarIconos();
        }

    } catch (err) {
        console.error("Error al cargar el resumen del dashboard:", err);
    }
}