(function () {
  'use strict';

  const {
    TORNEOS, JUEGOS, obtenerJuegoPorId, nombreEstado, formatearFecha,
  } = window.ARENA.datos;

document.addEventListener("DOMContentLoaded", () => {
  poblarSelectorJuegos();
  precargarFiltroDesdeUrl();
  aplicarFiltros();

  const formulario = document.getElementById("formulario-filtros");
  formulario.addEventListener("input", aplicarFiltros);
  formulario.addEventListener("change", aplicarFiltros);
  formulario.addEventListener("submit", (evento) => evento.preventDefault());

  document.getElementById("boton-limpiar-filtros").addEventListener("click", () => {
    formulario.reset();
    ocultarErrorRango();
    aplicarFiltros();
  });
});

function poblarSelectorJuegos() {
  const select = document.getElementById("filtro-juego");
  JUEGOS.forEach((juego) => {
    const opcion = document.createElement("option");
    opcion.value = juego.id;
    opcion.textContent = juego.nombre;
    select.appendChild(opcion);
  });
}

function precargarFiltroDesdeUrl() {
  const parametros = new URLSearchParams(window.location.search);
  const estado = parametros.get("estado");
  if (estado) {
    document.getElementById("filtro-estado").value = estado;
  }
}

function ocultarErrorRango() {
  const error = document.getElementById("error-rango-fechas");
  error.textContent = "";
}

function aplicarFiltros() {
  const texto = document.getElementById("filtro-busqueda").value.trim().toLowerCase();
  const juegoId = document.getElementById("filtro-juego").value;
  const estado = document.getElementById("filtro-estado").value;
  const fechaDesdeValor = document.getElementById("filtro-fecha-desde").value;
  const fechaHastaValor = document.getElementById("filtro-fecha-hasta").value;
  const error = document.getElementById("error-rango-fechas");


  if (fechaDesdeValor && fechaHastaValor && fechaDesdeValor > fechaHastaValor) {
    error.textContent = "La fecha 'Inicio desde' no puede ser posterior a 'Inicio hasta'.";
    document.getElementById("lista-torneos").innerHTML = "";
    document.getElementById("contador-resultados").textContent = "";
    return;
  }
  ocultarErrorRango();

  const resultado = TORNEOS.filter((torneo) => {
    const coincideTexto = !texto || torneo.nombre.toLowerCase().includes(texto);
    const coincideJuego = !juegoId || torneo.juegoId === juegoId;
    const coincideEstado = !estado || torneo.estado === estado;
    const coincideDesde = !fechaDesdeValor || torneo.fechaInicio >= fechaDesdeValor;
    const coincideHasta = !fechaHastaValor || torneo.fechaInicio <= fechaHastaValor;
    return coincideTexto && coincideJuego && coincideEstado && coincideDesde && coincideHasta;
  });

  pintarResultados(resultado);
}

function pintarResultados(torneos) {
  const contenedor = document.getElementById("lista-torneos");
  const contador = document.getElementById("contador-resultados");

  contador.textContent =
    torneos.length === 1 ? "1 torneo encontrado" : `${torneos.length} torneos encontrados`;

  if (torneos.length === 0) {
    contenedor.innerHTML = `
      <p class="estado-vacio">
        Ningún torneo cumple con los filtros seleccionados. Prueba ajustando el juego, el estado
        o el rango de fechas.
      </p>`;
    return;
  }

  contenedor.innerHTML = "";
  torneos.forEach((torneo) => contenedor.appendChild(crearTarjetaTorneoListado(torneo)));
}

function crearTarjetaTorneoListado(torneo) {
  const juego = obtenerJuegoPorId(torneo.juegoId);
  const cupoOcupado = torneo.participantesInscritos.length;

  const claseInsignia =
    torneo.estado === "abierto"
      ? "insignia--abierto"
      : torneo.estado === "en-curso"
      ? "insignia--en-curso"
      : "insignia--finalizado";

  const articulo = document.createElement("article");
  articulo.className = "tarjeta";
  articulo.innerHTML = `
    <div class="flex-entre">
      <h3>${torneo.nombre}</h3>
      <span class="insignia ${claseInsignia}">${nombreEstado(torneo.estado)}</span>
    </div>
        <p class="tarjeta__meta tarjeta__juego">
      ${juego && juego.icono ? `<img src="${juego.icono}" alt="${juego.nombre}" class="icono-juego">` : ""}
      ${juego ? juego.nombre : "Juego no disponible"} · ${juego ? juego.modalidad : ""}
    </p>
    <p class="tarjeta__meta">Cupos: ${cupoOcupado} / ${torneo.cupoMaximo}</p>
    <p class="tarjeta__meta">Cierre de inscripción: ${formatearFecha(torneo.fechaCierreInscripcion)}</p>
    <div class="tarjeta__pie">
      <a href="torneo-detalle.html?id=${torneo.id}" class="boton boton-secundario boton-pequeno">Ver detalle</a>
      ${
        torneo.estado === "abierto"
          ? `<a href="inscripcion.html?torneo=${torneo.id}" class="boton boton-primario boton-pequeno">Inscribirme</a>`
          : ""
      }
    </div>
  `;
  return articulo;
}

})();