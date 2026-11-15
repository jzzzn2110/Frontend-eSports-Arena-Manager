import { ApiError, request } from "./api.js";
import { adaptarJuego } from "./adapters.js";

export async function listarJuegos(signal) {
  const juegos = await request("/api/juegos", { signal });
  return juegos.map(adaptarJuego);
}

export async function obtenerJuego(id, signal) {
  try {
    const juego = await request(`/api/juegos/${id}`, { signal });
    return adaptarJuego(juego);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
