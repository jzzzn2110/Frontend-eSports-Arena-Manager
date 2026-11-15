const urlApi = import.meta.env?.VITE_API_URL?.trim().replace(/\/+$/, "");

export const apiConfigurada = Boolean(urlApi);

const mensajesHttp = {
  400: "La API rechazó los datos de la solicitud.",
  401: "Inicia sesión para continuar.",
  403: "No tienes permiso para realizar esta acción.",
  404: "El recurso solicitado no existe.",
  500: "La API tuvo un error al procesar la solicitud.",
};

export class ApiError extends Error {
  constructor(status, detalle) {
    super(mensajesHttp[status] ?? `La API respondió con HTTP ${status}.`);
    this.name = "ApiError";
    this.status = status;
    this.detalle = detalle;
  }
}

export async function request(path, { token, json, headers, ...options } = {}) {
  if (!apiConfigurada) throw new Error("Falta configurar VITE_API_URL.");

  const encabezados = new Headers(headers);
  if (!encabezados.has("Accept")) encabezados.set("Accept", "application/json");
  if (token) encabezados.set("Authorization", `Bearer ${token}`);

  // La opción json prepara el cuerpo. El navegador puede gestionar FormData por su cuenta.
  if (json !== undefined) {
    encabezados.set("Content-Type", "application/json");
    options.body = JSON.stringify(json);
  }

  let respuesta;
  try {
    respuesta = await fetch(`${urlApi}${path}`, { ...options, headers: encabezados });
  } catch (error) {
    // La cancelación permite que React descarte una consulta al cambiar de vista.
    if (options.signal?.aborted) throw error;
    throw new Error("No se pudo conectar con la API de RankForge.", { cause: error });
  }

  if (!respuesta.ok) {
    let detalle;
    if (respuesta.headers.get("Content-Type")?.includes("json")) {
      try {
        detalle = await respuesta.json();
      } catch (error) {
        if (options.signal?.aborted) throw error;
      }
    }
    throw new ApiError(respuesta.status, detalle);
  }
  if (respuesta.status === 204 || respuesta.status === 205 || options.method?.toUpperCase() === "HEAD") {
    return null;
  }
  return respuesta.json();
}
