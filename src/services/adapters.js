export function adaptarJuego(juego) {
  return {
    ...juego,
    id: String(juego.id),
    integrantesPorEquipo: juego.jugadoresPorEquipo,
  };
}

export function adaptarTorneo(torneo) {
  // Los enlaces y filtros de React usan IDs de texto y estados como en-curso.
  return {
    ...torneo,
    id: String(torneo.id),
    juegoId: String(torneo.juegoId),
    estado: torneo.estado.toLowerCase().replaceAll("_", "-"),
  };
}
