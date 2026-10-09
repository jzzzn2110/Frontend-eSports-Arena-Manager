//falta agregar : Partidas, Rankings, Premios
import {JUEGOS, JUGADORES, EQUIPOS, TORNEOS} from '../data/datos.js';

export function obtenerJugadorPorId(id) {
    return JUGADORES.find((jugador) => jugador.id === id) || null;
}

export function obtenerTorneoPorId(id) {
    return TORNEOS.find((torneo) => torneo.id === id) || null;
}

export function obtenerJuegoPorId(id) {
    return JUEGOS.find((juego) => juego.id === id) || null;
}

export function obtenerEquipoPorId(id) {
    return EQUIPOS.find((equipo) => equipo.id === id) || null;
}
//convierte el estado de un torneo a un nombre mas amigable para mostrar en la interfaz
export function nombreEstado(estado) {
    const nombres = {
        abierto: "Abierto",
        "en-curso": "En curso",
        finalizado: "Finalizado",
    };
    return nombres[estado] || estado;
}
// Muestra la fecha como dia/mes/año.
export function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";

    // Reconoce la fecha guardada como YYYY-MM-DD.
const esSoloFecha = /^\d{4}-\d{2}-\d{2}$/.test(String(fechaISO));
    const fecha = new Date(esSoloFecha ? `${fechaISO}T12:00:00` : fechaISO);

    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
}
export function formatearFechaHora(fechaISO) {
    const fecha = new Date(fechaISO);

    return fecha.toLocaleString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function esTorneoIndividual(torneo) {
    const juego = torneo ? obtenerJuegoPorId(torneo.juegoId) : null;
    return Boolean(juego && juego.integrantesPorEquipo === 1);
}

export function obtenerNombreParticipante(torneo, participanteId) {
  // Si todavía no hay participante asignado.
  if (!participanteId) return 'Por definir';

  if (esTorneoIndividual(torneo)) {
    const jugador = obtenerJugadorPorId(participanteId);
    return jugador ? jugador.apodo : participanteId;
  }

  const equipo = obtenerEquipoPorId(participanteId);
  return equipo ? equipo.nombre : participanteId;
}

// Calcula los cupos restantes sin devolver valores negativos.
export function cuposDisponibles(torneo) {
  if (!torneo) return 0;

  const ocupados = Array.isArray(torneo.participantesInscritos)
    ? torneo.participantesInscritos.length
    : 0;

  return Math.max(0, Number(torneo.cupoMaximo || 0) - ocupados);
}

// Permite inscribirse hasta el final del día de cierre.
export function inscripcionFueraDePlazo(torneo, fechaActual = new Date()) {
  if (!torneo?.fechaCierreInscripcion) return false;

  const valorCierre = String(torneo.fechaCierreInscripcion);
  const cierre = /^\d{4}-\d{2}-\d{2}$/.test(valorCierre)
    ? new Date(`${valorCierre}T23:59:59`)
    : new Date(valorCierre);

  return fechaActual > cierre;
}

// Comprueba si el participante ya está inscrito.
export function participanteYaInscrito(torneo, participanteId) {
  return Boolean(torneo?.participantesInscritos?.includes(participanteId));
}
// Comprueba si el jugador tiene una sanción vigente.
export function tieneSancionActiva(jugador) {
  if (!jugador || !Array.isArray(jugador.sanciones)) return false;

  return jugador.sanciones.some((sancion) => sancion.vigente === true);
}

// Comprueba si alguno de los integrantes está sancionado.
export function equipoTieneSancionActiva(equipo) {
  if (!equipo || !Array.isArray(equipo.integrantes)) return false;

  return equipo.integrantes.some((integrante) =>
    tieneSancionActiva(obtenerJugadorPorId(integrante.jugadorId))
  );
}

// Comprueba si el equipo reúne la cantidad requerida por el juego.
export function equipoCompleto(equipo, juego) {
  if (!equipo || !juego || !Array.isArray(equipo.integrantes)) {
    return false;
  }

  return equipo.integrantes.length >= juego.integrantesPorEquipo;
}
// Ordena por puntos y, en caso de empate, por diferencia.
export function ordenarRanking(lista = []) {
  return [...lista].sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;

    return b.diferencia - a.diferencia;
  });
}

// Obtiene los torneos donde participó el jugador o alguno de sus equipos.
export function obtenerHistorialTorneos(jugadorId) {
  const equiposDelJugador = EQUIPOS
    .filter((equipo) =>
      equipo.integrantes.some((integrante) => integrante.jugadorId === jugadorId)
    )
    .map((equipo) => equipo.id);

  return TORNEOS.filter((torneo) =>
    torneo.participantesInscritos.includes(jugadorId) ||
    torneo.participantesInscritos.some((id) => equiposDelJugador.includes(id))
  );
}
// Suma los puntos obtenidos por un participante.
export function calcularPuntos(
  resultados = [],
  participanteId,
  puntosVictoria = 3,
  puntosDerrota = 0
) {
  return resultados.reduce((total, resultado) => {
    const participa =
      resultado.participanteA === participanteId ||
      resultado.participanteB === participanteId;

    if (!participa) return total;

    return total + (
      resultado.ganadorId === participanteId
        ? puntosVictoria
        : puntosDerrota
    );
  }, 0);
}

// Selecciona el estilo de la insignia según el estado del torneo.
export function claseInsigniaTorneo(estado) {
  if (estado === 'abierto') return 'insignia--abierto';
  if (estado === 'en-curso') return 'insignia--en-curso';

  return 'insignia--finalizado';
}

// Selecciona el estilo de la insignia según el perfil del usuario.
export function claseSegunRol(rol) {
  switch (String(rol).toLowerCase()) {
    case 'administrador':
      return 'insignia--en-curso';
    case 'organizador':
    case 'jugador':
      return 'insignia--abierto';
    default:
      return 'insignia--finalizado';
  }
}