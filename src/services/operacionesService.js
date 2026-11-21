import { request } from "./api.js";

// Los IDs de la API son enteros positivos; nunca enviar IDs de la semilla EP2.
export function idApi(value) {
  const text = String(value ?? "");
  if (!/^[1-9]\d*$/.test(text) || !Number.isSafeInteger(Number(text))) {
    throw new Error("Selecciona un identificador válido del servidor.");
  }
  return text;
}

// Inyección del transporte para comprobar contratos sin solicitudes de red.
export function crearOperaciones(solicitar = request) {
  const base = (recurso, id) => `/api/${recurso}/${idApi(id)}`;
  return {
    notificaciones: {
      porTorneo: (id, options) => solicitar(`/api/torneos/${idApi(id)}/notificaciones`, options),
    },
    premios: {
      porTorneo: (id, options) => solicitar(`/api/torneos/${idApi(id)}/premios`, options),
      asignar: (id, datos) => solicitar(`/api/torneos/${idApi(id)}/premios`, { method: "POST", json: datos }),
    },
    equipos: {
      listar: (options) => solicitar("/api/equipos", options),
      obtener: (id, options) => solicitar(base("equipos", id), options),
      crear: (datos) => solicitar("/api/equipos", { method: "POST", json: datos }),
      actualizar: (id, datos) => solicitar(base("equipos", id), { method: "PUT", json: datos }),
      desactivar: (id) => solicitar(base("equipos", id), { method: "DELETE" }),
      agregarMiembro: (id, datos) => solicitar(`${base("equipos", id)}/miembros`, { method: "POST", json: datos }),
      quitarMiembro: (id, miembroId) => solicitar(`${base("equipos", id)}/miembros/${idApi(miembroId)}`, { method: "DELETE" }),
    },
    inscripciones: {
      porTorneo: (id, options) => solicitar(`/api/inscripciones/torneo/${idApi(id)}`, options),
      porJugador: (id, options) => solicitar(`/api/inscripciones/jugador/${idApi(id)}`, options),
      crear: (datos) => solicitar("/api/inscripciones", { method: "POST", json: datos }),
      cambiarEstado: (id, estado) => solicitar(`${base("inscripciones", id)}/estado?${new URLSearchParams({ estado })}`, { method: "PUT" }),
      cancelar: (id) => solicitar(base("inscripciones", id), { method: "DELETE" }),
    },
    partidas: {
      porTorneo: (id, options) => solicitar(`/api/partidas/torneo/${idApi(id)}`, options),
      crear: (datos) => solicitar("/api/partidas", { method: "POST", json: datos }),
      actualizar: (id, datos) => solicitar(base("partidas", id), { method: "PUT", json: datos }),
      cancelar: (id) => solicitar(base("partidas", id), { method: "DELETE" }),
    },
    resultados: {
      porPartida: (id, options) => solicitar(`/api/resultados/partida/${idApi(id)}`, options),
      crear: (datos) => solicitar("/api/resultados", { method: "POST", json: datos }),
      actualizar: (id, datos) => solicitar(base("resultados", id), { method: "PUT", json: datos }),
      validar: (id) => solicitar(`${base("resultados", id)}/validar`, { method: "PATCH" }),
      anular: (id, justificacion) => solicitar(`${base("resultados", id)}/anular?${new URLSearchParams({ justificacion })}`, { method: "PATCH" }),
    },
    sanciones: {
      porUsuario: (id, options) => solicitar(`/api/sanciones/usuario/${idApi(id)}`, options),
      porEquipo: (id, options) => solicitar(`/api/sanciones/equipo/${idApi(id)}`, options),
      crear: (datos) => solicitar("/api/sanciones", { method: "POST", json: datos }),
      cerrar: (id) => solicitar(`${base("sanciones", id)}/cerrar`, { method: "PATCH" }),
    },
    rankings: {
      recalcular: (id) => solicitar(`/api/rankings/torneo/${idApi(id)}/recalcular`, { method: "POST" }),
      porTorneo: (id, options) => solicitar(`/api/rankings/torneo/${idApi(id)}`, options),
      porParticipante: (id, options) => solicitar(`/api/rankings/participante/${idApi(id)}`, options),
    },
  };
}

export const operaciones = crearOperaciones();
