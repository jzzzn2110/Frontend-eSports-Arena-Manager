(function () {
  'use strict';

  const {
    TORNEOS, PARTIDAS, RANKINGS, PREMIOS, escaparHTML,
    obtenerTorneoPorId, obtenerJuegoPorId, obtenerNombreParticipante,
    nombreEstado, formatearFecha, formatearFechaHora, cuposDisponibles, ordenarRanking,
  } = window.ARENA.datos;

  const el = {
    noEncontrado: document.getElementById('torneo-no-encontrado'),
    contenido: document.getElementById('torneo-contenido'),
    nombre: document.getElementById('torneo-nombre'),
    juegoModalidad: document.getElementById('torneo-juego-modalidad'),
    insignia: document.getElementById('torneo-insignia'),
    cierre: document.getElementById('torneo-cierre'),
    inicio: document.getElementById('torneo-inicio'),
    cupos: document.getElementById('torneo-cupos'),
    participantes: document.getElementById('lista-participantes'),
    pestanasRonda: document.getElementById('pestanas-ronda'),
    partidas: document.getElementById('lista-partidas'),
    cuerpoRanking: document.getElementById('cuerpo-tabla-ranking'),
    seccionPremios: document.getElementById('seccion-premios'),
    listaPremios: document.getElementById('lista-premios'),
  };

  let rondaSeleccionada = 1;
  let torneoActual = null;

  document.addEventListener('DOMContentLoaded', iniciar);

  function iniciar() {
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get('id');
    torneoActual = id ? obtenerTorneoPorId(id) : null;

    if (!torneoActual) {
      mostrarNoEncontrado();
      return;
    }

    el.contenido.classList.remove('oculto');
    pintarDatosGenerales(torneoActual);
    pintarParticipantes(torneoActual);
    pintarPestanasRonda(torneoActual);
    pintarPartidas(torneoActual);
    pintarRanking(torneoActual);
    pintarPremios(torneoActual);

    el.pestanasRonda.addEventListener('click', manejarClicPestanaRonda);
  }

  function mostrarNoEncontrado() {
    el.noEncontrado?.classList.remove('oculto');
    el.contenido?.classList.add('oculto');
  }

  function pintarDatosGenerales(torneo) {
    const juego = obtenerJuegoPorId(torneo.juegoId);
    document.title = `eSports Arena Manager — ${torneo.nombre}`;

    el.nombre.textContent = torneo.nombre;
    el.juegoModalidad.textContent = juego
      ? `${juego.nombre} · ${juego.modalidad}`
      : 'Juego no disponible';

    el.insignia.className = `insignia ${claseInsigniaTorneo(torneo.estado)}`;
    el.insignia.textContent = nombreEstado(torneo.estado);

    el.cierre.textContent = formatearFecha(torneo.fechaCierreInscripcion);
    el.inicio.textContent = formatearFecha(torneo.fechaInicio);
    el.cupos.textContent =
      `${torneo.participantesInscritos.length} / ${torneo.cupoMaximo} ` +
      `(${cuposDisponibles(torneo)} disponibles)`;
  }

  function claseInsigniaTorneo(estado) {
    if (estado === 'abierto') return 'insignia--abierto';
    if (estado === 'en-curso') return 'insignia--en-curso';
    return 'insignia--finalizado';
  }

  function pintarParticipantes(torneo) {
    if (torneo.participantesInscritos.length === 0) {
      el.participantes.innerHTML = `<p class="estado-vacio">Todavía no hay participantes inscritos.</p>`;
      return;
    }

    el.participantes.innerHTML = torneo.participantesInscritos
      .map((id) => `<span class="chip">${escaparHTML(obtenerNombreParticipante(torneo, id))}</span>`)
      .join('');
  }

  function pintarPestanasRonda(torneo) {
    const rondas = [...new Set(
      PARTIDAS.filter((p) => p.torneoId === torneo.id).map((p) => p.ronda)
    )].sort((a, b) => a - b);

    if (rondas.length === 0) {
      el.pestanasRonda.innerHTML = '';
      return;
    }

    if (!rondas.includes(rondaSeleccionada)) {
      rondaSeleccionada = rondas[0];
    }

    el.pestanasRonda.innerHTML = rondas
      .map((ronda) => `
        <button type="button" class="pestana-ronda" role="tab"
          aria-pressed="${ronda === rondaSeleccionada}"
          data-ronda="${ronda}">
          Ronda ${ronda}
        </button>`)
      .join('');
  }

  function manejarClicPestanaRonda(evento) {
    const boton = evento.target.closest('.pestana-ronda');
    if (!boton) return;

    rondaSeleccionada = Number(boton.dataset.ronda);
    pintarPestanasRonda(torneoActual);
    pintarPartidas(torneoActual);
  }

  function pintarPartidas(torneo) {
    const partidas = PARTIDAS.filter(
      (p) => p.torneoId === torneo.id && p.ronda === rondaSeleccionada
    );

    if (partidas.length === 0) {
      el.partidas.innerHTML = `<p class="estado-vacio">Sin partidas programadas para esta ronda todavía.</p>`;
      return;
    }

    el.partidas.innerHTML = partidas.map((partida) => plantillaPartida(torneo, partida)).join('');
  }

  function plantillaPartida(torneo, partida) {
    const nombreA = escaparHTML(obtenerNombreParticipante(torneo, partida.participanteA));
    const nombreB = escaparHTML(obtenerNombreParticipante(torneo, partida.participanteB));

    return `
      <div class="partida">
        <span class="partida__rivales">${nombreA} vs ${nombreB}</span>
        <span class="partida__meta">${formatearFechaHora(partida.horario)}</span>
        <span class="insignia insignia--${claseInsigniaPartida(partida.estado)}">
          ${nombrePartidaEstado(partida.estado)}
        </span>
      </div>`;
  }

  function claseInsigniaPartida(estado) {
    if (estado === 'finalizada') return 'finalizado';
    if (estado === 'en-curso') return 'en-curso';
    return 'abierto';
  }

  function nombrePartidaEstado(estado) {
    const mapa = {
      programada: 'Programada',
      'en-curso': 'En curso',
      finalizada: 'Finalizada',
      cancelada: 'Cancelada',
    };
    return mapa[estado] ?? estado;
  }

  function pintarRanking(torneo) {
    const ranking = RANKINGS[torneo.id];

    if (!ranking || ranking.length === 0) {
      el.cuerpoRanking.innerHTML = `<tr><td colspan="4">Aún no hay resultados validados para este torneo.</td></tr>`;
      return;
    }

    const ordenado = ordenarRanking(ranking);
    el.cuerpoRanking.innerHTML = ordenado
      .map((fila, indice) => `
        <tr>
          <td>${indice + 1}</td>
          <td>${escaparHTML(obtenerNombreParticipante(torneo, fila.participanteId))}</td>
          <td>${fila.puntos}</td>
          <td>${fila.diferencia > 0 ? '+' : ''}${fila.diferencia}</td>
        </tr>`)
      .join('');
  }

  function pintarPremios(torneo) {
    const premios = PREMIOS[torneo.id];

    if (torneo.estado !== 'finalizado' || !premios || premios.length === 0) {
      el.seccionPremios.classList.add('oculto');
      return;
    }

    el.seccionPremios.classList.remove('oculto');
    el.listaPremios.innerHTML = premios
      .map((p) => `<li><span>Posición ${p.posicion}</span> <span>${escaparHTML(p.premio)}</span></li>`)
      .join('');
  }
})();