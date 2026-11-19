import { request } from "./api.js";
export const perfilService = {
  asegurar: (options) => request("/api/usuarios/me", { ...options, method: "POST" }),
  guardar: ({ nombre, apodo }, options) => request("/api/usuarios/me", {
    ...options, method: "PUT", json: { nombre, apodo },
  }),
};
