(function () {
  'use strict';

  const {
    TORNEOS, obtenerJuegoPorId, nombreEstado, formatearFecha,
  } = window.ARENA.datos;

document.addEventListener("DOMContentLoaded", () => {
  pintarTorneosDestacados();
  pintarProximosCierres();
});

function pintarTorneosDestacados() {
  const contenedor = document.getElementById("lista-torneos-destacados");
  const destacados = TORNEOS.filter((t) => t.estado === "abierto" || t.estado === "en-curso");

  if (destacados.length === 0) {
    contenedor.innerHTML = `<p class="estado-vacio">No hay torneos destacados en este momento.</p>`;
    return;
  }

  contenedor.innerHTML = "";
  destacados.forEach((torneo) => {
    contenedor.appendChild(crearTarjetaTorneo(torneo));
  });
}
function crearTarjetaTorneo(torneo) {
  const juego = obtenerJuegoPorId(torneo.juegoId);
  const cupoOcupado = torneo.participantesInscritos.length;

  const articulo = document.createElement("article");
  articulo.className = "tarjeta";

  const claseInsignia =
    torneo.estado === "abierto"
      ? "insignia--abierto"
      : torneo.estado === "en-curso"
      ? "insignia--en-curso"
      : "insignia--finalizado";

  articulo.innerHTML = `
    <div class="flex-entre">
      <h3>${torneo.nombre}</h3>
      <span class="insignia ${claseInsignia}">${nombreEstado(torneo.estado)}</span>
    </div>
    <p class="tarjeta__meta">${juego ? juego.nombre : "Juego no disponible"} · ${juego ? juego.modalidad : ""}</p>
    <p class="tarjeta__meta">Cupos: ${cupoOcupado} / ${torneo.cupoMaximo}</p>
    <p class="tarjeta__meta">Cierre de inscripción: ${formatearFecha(torneo.fechaCierreInscripcion)}</p>
    <div class="tarjeta__pie">
      <a href="torneo-detalle.html?id=${torneo.id}" class="boton boton-secundario boton-pequeno">Ver detalle</a>
    </div>
  `;

  return articulo;
}
function pintarProximosCierres() {
  const cuerpo = document.getElementById("cuerpo-tabla-cierres");
  const abiertos = TORNEOS.filter((t) => t.estado === "abierto").sort(
    (a, b) => new Date(a.fechaCierreInscripcion) - new Date(b.fechaCierreInscripcion)
  );

  if (abiertos.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="5">No hay cierres de inscripción próximos.</td></tr>`;
    return;
  }

  cuerpo.innerHTML = "";
  abiertos.forEach((torneo) => {
    const juego = obtenerJuegoPorId(torneo.juegoId);
    const cupoOcupado = torneo.participantesInscritos.length;
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${torneo.nombre}</td>
      <td>${juego ? juego.nombre : "—"}</td>
      <td>${formatearFecha(torneo.fechaCierreInscripcion)}</td>
      <td>${cupoOcupado} / ${torneo.cupoMaximo}</td>
      <td><a href="inscripcion.html?torneo=${torneo.id}" class="boton boton-primario boton-pequeno">Inscribirme</a></td>
    `;
    cuerpo.appendChild(fila);
  });
}

})();