import { ApiError, request } from "./api.js";
import { adaptarTorneo } from "./adapters.js";

export function esIdTorneoApi(id) {
  return (typeof id === "string" || Number.isSafeInteger(id)) && /^[1-9][0-9]*$/.test(id);
}

export async function listarTorneos(signal) {
  const torneos = await request("/api/torneos", { signal });
  return torneos.map(adaptarTorneo);
}

export async function obtenerTorneo(id, signal) {
  if (!esIdTorneoApi(id)) return null;

  try {
    const torneo = await request(`/api/torneos/${id}`, { signal });
    return adaptarTorneo(torneo);
  } catch (error) {
    // El backend también usa 400 para otros errores, como una falla de MySQL.
    const idInexistente =
      error instanceof ApiError &&
      (error.status === 404 ||
        (error.status === 400 && error.detalle?.error === `Torneo no encontrado con ID: ${id}`));
    if (idInexistente) return null;
    throw error;
  }
}
