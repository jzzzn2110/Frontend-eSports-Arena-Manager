import React, { act } from "react";
import { createRoot } from "react-dom/client";
import NotificacionesTorneo from "../src/components/NotificacionesTorneo.jsx";

describe("Notificaciones del torneo", () => {
  let host, root, servicios;
  beforeEach(() => {
    host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host);
    servicios = { notificaciones: { porTorneo: jasmine.createSpy().and.resolveTo([]) } };
  });
  afterEach(() => { act(() => root.unmount()); host.remove(); });
  async function montar(id = 1) { await act(async () => root.render(<NotificacionesTorneo torneoId={id} servicios={servicios} />)); }
  it("muestra el estado vacío sin generar avisos ficticios", async () => {
    await montar(); expect(host.textContent).toContain("Todavía no hay notificaciones");
  });
  it("muestra mensajes del servidor como texto seguro", async () => {
    servicios.notificaciones.porTorneo.and.resolveTo([{ id: 1, mensaje: "<img src=x onerror=alert(1)>", fecha: "2026-11-20T15:00:00Z" }]);
    await montar(); expect(host.textContent).toContain("<img src=x"); expect(host.querySelector("img")).toBeNull();
  });
  it("recupera una consulta fallida al reintentar", async () => {
    servicios.notificaciones.porTorneo.and.rejectWith(new Error("Sin conexión"));
    await montar(); expect(host.querySelector('[role="alert"]').textContent).toContain("Sin conexión");
    servicios.notificaciones.porTorneo.and.resolveTo([]);
    await act(async () => host.querySelector("button").click()); expect(host.querySelector('[role="alert"]')).toBeNull();
  });
  it("cancela la consulta anterior al cambiar de torneo", async () => {
    await montar(); const signal = servicios.notificaciones.porTorneo.calls.mostRecent().args[1].signal;
    await montar(2); expect(signal.aborted).toBeTrue(); expect(servicios.notificaciones.porTorneo.calls.mostRecent().args[0]).toBe(2);
  });
});
