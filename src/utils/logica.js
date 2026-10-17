// Funciones puras compartidas. Los datos vivos pertenecen a ArenaProvider.
export function nombreEstado(estado) {
  return (
    { abierto: "Abierto", "en-curso": "En curso", finalizado: "Finalizado" }[
      estado
    ] || estado
  );
}
export function formatearFecha(valor) {
  if (!valor) return "-";
  const fecha = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(String(valor)) ? `${valor}T12:00:00` : valor,
  );
  if (Number.isNaN(fecha.getTime())) return "-";
  return `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;
}
export function formatearFechaHora(valor) {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "-"
    : fecha.toLocaleString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}
export function cuposDisponibles(torneo) {
  if (!torneo) return 0;
  return Math.max(
    0,
    Number(torneo.cupoMaximo || 0) -
      (Array.isArray(torneo.participantesInscritos)
        ? torneo.participantesInscritos.length
        : 0),
  );
}
export function inscripcionFueraDePlazo(torneo, ahora = new Date()) {
  if (!torneo?.fechaCierreInscripcion) return true;
  const valor = String(torneo.fechaCierreInscripcion);
  const cierre = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(valor) ? `${valor}T23:59:59.999` : valor,
  );
  return Number.isNaN(cierre.getTime()) || ahora > cierre;
}
export function tieneSancionActiva(jugador) {
  return Boolean(
    jugador &&
      Array.isArray(jugador.sanciones) &&
      jugador.sanciones.some((s) => s.vigente === true),
  );
}
export function ordenarRanking(lista = []) {
  return [...lista].sort(
    (a, b) => b.puntos - a.puntos || b.diferencia - a.diferencia,
  );
}
export function calcularPuntos(
  resultados = [],
  participanteId,
  puntosVictoria = 3,
  puntosDerrota = 0,
) {
  return resultados.reduce((suma, r) => {
    if (
      !r.ganadorId ||
      ![r.participanteA, r.participanteB].includes(participanteId)
    )
      return suma;
    return (
      suma + (r.ganadorId === participanteId ? puntosVictoria : puntosDerrota)
    );
  }, 0);
}
export function claseInsigniaTorneo(estado) {
  return (
    { abierto: "insignia--abierto", "en-curso": "insignia--en-curso" }[
      estado
    ] || "insignia--finalizado"
  );
}
