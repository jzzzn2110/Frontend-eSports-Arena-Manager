import React, { act } from "react";
import { createRoot } from "react-dom/client";
import GestionSanciones from "../src/components/GestionSanciones.jsx";

describe("Gestión remota de sanciones", () => {
  let host, root, servicio;
  beforeEach(() => {
    host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host);
    servicio = { sanciones: { porUsuario: jasmine.createSpy().and.resolveTo([]), porEquipo: jasmine.createSpy().and.resolveTo([]), crear: jasmine.createSpy().and.resolveTo({}), cerrar: jasmine.createSpy().and.resolveTo({}) } };
    act(() => root.render(<GestionSanciones servicio={servicio} />));
  });
  afterEach(() => { act(() => root.unmount()); host.remove(); });
  function cambiar(selector, valor) { act(() => { const el = host.querySelector(selector); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, valor); el.dispatchEvent(new Event("input", { bubbles: true })); }); }
  async function enviar(indice = 0) { await act(async () => host.querySelectorAll("form")[indice].dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))); }
  async function consultar() { cambiar("#sancion-id", "7"); await enviar(); }
  it("consulta únicamente el participante indicado", async () => {
    await consultar(); expect(servicio.sanciones.porUsuario).toHaveBeenCalledWith(7); expect(servicio.sanciones.porEquipo).not.toHaveBeenCalled();
    expect(host.textContent).toContain("No hay sanciones registradas");
  });
  it("crea una sanción sin enviar identidad de equipo simultánea", async () => {
    await consultar(); cambiar("#sancion-motivo", "Conducta antideportiva"); cambiar('[name="fechaInicio"]', "2030-01-01"); cambiar('[name="fechaFin"]', "2030-01-03");
    await enviar(1); expect(servicio.sanciones.crear).toHaveBeenCalledWith({ usuarioId: 7, motivo: "Conducta antideportiva", severidad: "LEVE", fechaInicio: "2030-01-01", fechaFin: "2030-01-03" });
    expect(host.textContent).toContain("Sanción registrada");
  });
  it("exige confirmación y conserva el error al rechazar un cierre", async () => {
    servicio.sanciones.porUsuario.and.resolveTo([{ id: 3, motivo: "Motivo", estado: true }]);
    servicio.sanciones.cerrar.and.rejectWith(new Error("Permiso denegado")); await consultar();
    act(() => [...host.querySelectorAll("button")].find((b) => b.textContent === "Cerrar sanción #3").click());
    expect(servicio.sanciones.cerrar).not.toHaveBeenCalled();
    await act(async () => [...host.querySelectorAll("button")].find((b) => b.textContent === "Confirmar cierre").click());
    expect(servicio.sanciones.cerrar).toHaveBeenCalledWith(3); expect(host.textContent).toContain("Permiso denegado"); expect(host.textContent).not.toContain("Sanción cerrada.");
  });
});
