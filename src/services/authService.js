import { request } from "./api.js";

// Iniciar sesión
export async function iniciarSesion(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    json: {
      email,
      password,
    },
  });
}

// Registrar una nueva cuenta
export async function registrarCuenta(email, password) {
  return request("/api/auth/registro", {
    method: "POST",
    json: {
      email,
      password,
    },
  });
}

// Convertir los roles del backend al formato del frontend
export function normalizarRol(rol) {
  switch (rol?.toUpperCase()) {
    case "ADMIN":
      return "administrador";
    case "ORGANIZADOR":
      return "organizador";
    case "JUGADOR":
      return "jugador";
    default:
      return "visitante";
  }
}
