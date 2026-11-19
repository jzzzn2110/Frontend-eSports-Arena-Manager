import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import EquiposRemotos from "../src/pages/EquiposRemotos.jsx";

describe("Equipos conectados a la API", () => {
  let host, root, servicio, perfil, juegos;
  beforeEach(() => {
    localStorage.setItem("rankforge-sesion-jwt", JSON.stringify({ token: `test.${btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000)+600 }))}.test`, rol: "jugador", email: "lucas@example.test" }));
    host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host);
    perfil = { asegurar: jasmine.createSpy().and.resolveTo({ id: 4, nombre: "Lucas" }) };
    juegos = jasmine.createSpy().and.resolveTo([{ id: "1", nombre: "Juego real" }]);
    servicio = { equipos: {
      listar: jasmine.createSpy().and.resolveTo([{ id: 1, nombre: "Mi equipo", capitanId: 4, juegoPrincipalId: 1, miembros: [{ id: 10, usuarioId: 4, rolDentroEquipo: "CAPITAN" }, { id: 11, usuarioId: 8, rolDentroEquipo: "JUGADOR" }] }]),
      quitarMiembro: jasmine.createSpy().and.resolveTo(null),
      desactivar: jasmine.createSpy().and.resolveTo(null),
    } };
  });
  afterEach(() => { act(() => root.unmount()); host.remove(); localStorage.removeItem("rankforge-sesion-jwt"); });
  async function montar() { await act(async () => root.render(<AuthProvider servicioPerfil={perfil}><EquiposRemotos servicio={servicio} cargarJuegos={juegos} /></AuthProvider>)); }
  async function clic(texto) { await act(async () => [...host.querySelectorAll("button")].find((b) => b.textContent === texto).click()); }
  it("muestra integrantes reales y nunca permite quitar al capitán", async () => {
    await montar();
    expect(host.textContent).toContain("Usuario #8");
    expect([...host.querySelectorAll("button")].filter((b) => b.textContent === "Quitar integrante").length).toBe(1);
  });
  it("exige confirmación y envía el ID del miembro, no el ID del usuario", async () => {
    await montar(); await clic("Quitar integrante");
    expect(servicio.equipos.quitarMiembro).not.toHaveBeenCalled();
    await clic("Confirmar");
    expect(servicio.equipos.quitarMiembro).toHaveBeenCalledWith(1, 11);
    expect(host.textContent).toContain("Cambio guardado");
  });
  it("un integrante no recibe controles de edición del capitán", async () => {
    perfil.asegurar.and.resolveTo({ id: 8 }); await montar();
    expect(host.textContent).toContain("Mi equipo");
    expect(host.textContent).not.toContain("Desactivar equipo");
    expect(host.textContent).not.toContain("Quitar integrante");
  });
  it("un rechazo del servidor no muestra éxito", async () => {
    servicio.equipos.quitarMiembro.and.rejectWith(new Error("Permiso denegado"));
    await montar(); await clic("Quitar integrante"); await clic("Confirmar");
    expect(host.textContent).toContain("Permiso denegado");
    expect(host.textContent).not.toContain("Cambio guardado");
  });
});
