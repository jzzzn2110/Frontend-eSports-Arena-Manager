export function adaptarJuego(juego) {
  return {
    ...juego,
    id: String(juego.id),
    integrantesPorEquipo: juego.jugadoresPorEquipo,
  };
}

export function normalizarEstadoTorneo(estado) {
  return estado.trim().toLowerCase().replaceAll("_", "-");
}

export function adaptarTorneo(torneo) {
  // Los enlaces y filtros de React usan IDs de texto y estados como en-curso.
  return {
    ...torneo,
    id: String(torneo.id),
    juegoId: String(torneo.juegoId),
    estado: normalizarEstadoTorneo(torneo.estado),
  };
}
