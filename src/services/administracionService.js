import { adaptarJuego } from "./adapters.js";
import { request } from "./api.js";

export async function listarJuegosAdmin(signal) {
  const juegos = await request("/api/juegos/admin", { signal });
  return juegos.map(adaptarJuego);
}

export function guardarJuego(id, datos, signal) {
  return request(id ? `/api/juegos/${id}` : "/api/juegos", {
    method: id ? "PUT" : "POST",
    json: datos,
    signal,
  });
}

export function desactivarJuego(id, signal) {
  return request(`/api/juegos/${id}`, { method: "DELETE", signal });
}

export function guardarTorneo(id, datos, signal) {
  return request(id ? `/api/torneos/${id}` : "/api/torneos", {
    method: id ? "PUT" : "POST",
    json: datos,
    signal,
  });
}

export function cambiarEstadoTorneo(id, estado, signal) {
  return request(`/api/torneos/${id}/estado`, {
    method: "PATCH",
    json: { estado: estado.replaceAll("-", "_").toUpperCase() },
    signal,
  });
}
