import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ResultadosPartida from "../src/components/ResultadosPartida.jsx";

describe("Resultados de partida remotos", () => {
  let host, root, servicio;
  const partida = { id: 3, torneoId: 2, participanteAId: 7, participanteBId: 8 };
  beforeEach(() => {
    host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host);
    servicio = { resultados: { porPartida: jasmine.createSpy().and.resolveTo([]), crear: jasmine.createSpy().and.resolveTo({ id: 4 }), validar: jasmine.createSpy().and.resolveTo({}) } };
  });
  afterEach(() => { act(() => root.unmount()); host.remove(); });
  async function montar() { await act(async () => root.render(<ResultadosPartida partida={partida} servicio={servicio} />)); }
  async function clic(texto) { await act(async () => [...host.querySelectorAll("button")].find((b) => b.textContent === texto).click()); }
  function puntaje(nombre, valor) { act(() => {
    const el = host.querySelector(`[name="${nombre}"]`);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, valor);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }); }
  it("deriva el ganador del marcador y los participantes reales", async () => {
    await montar(); puntaje("puntajeA", "2"); puntaje("puntajeB", "1");
    await act(async () => host.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(servicio.resultados.crear).toHaveBeenCalledWith({ partidaId: 3, ganadorId: 7, puntajeA: 2, puntajeB: 1, evidenciaUrl: null });
    expect(host.textContent).toContain("Resultado guardado");
  });
  it("exige confirmación para validar", async () => {
    servicio.resultados.porPartida.and.resolveTo([{ id: 4, puntajeA: 2, puntajeB: 1, estadoValidacion: "PENDIENTE" }]);
    await montar(); await clic("Validar resultado #4");
    expect(servicio.resultados.validar).not.toHaveBeenCalled();
    await clic("Confirmar validación"); expect(servicio.resultados.validar).toHaveBeenCalledWith(4);
  });
  it("no ofrece edición de un resultado validado", async () => {
    servicio.resultados.porPartida.and.resolveTo([{ id: 4, puntajeA: 2, puntajeB: 1, estadoValidacion: "VALIDADO" }]);
    await montar(); expect(host.textContent).toContain("edición bloqueada");
    expect(host.querySelector("form")).toBeNull(); expect(host.textContent).not.toContain("Editar resultado #4");
  });
  it("un rechazo de validación no produce confirmación de éxito", async () => {
    servicio.resultados.porPartida.and.resolveTo([{ id: 4, puntajeA: 2, puntajeB: 1, estadoValidacion: "PENDIENTE" }]);
    servicio.resultados.validar.and.rejectWith(new Error("Permiso denegado"));
    await montar(); await clic("Validar resultado #4"); await clic("Confirmar validación");
    expect(host.textContent).toContain("Permiso denegado"); expect(host.textContent).not.toContain("Resultado validado.");
  });
  it("no anula sin justificación", async () => {
    servicio.resultados.porPartida.and.resolveTo([{ id: 4, puntajeA: 2, puntajeB: 1, estadoValidacion: "VALIDADO" }]);
    servicio.resultados.anular = jasmine.createSpy().and.resolveTo({});
    await montar(); await clic("Anular resultado #4");
    await act(async () => host.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(servicio.resultados.anular).not.toHaveBeenCalled(); expect(host.textContent).toContain("Debes justificar");
  });
  it("envía la justificación confirmada y el ID del resultado", async () => {
    servicio.resultados.porPartida.and.resolveTo([{ id: 4, puntajeA: 2, puntajeB: 1, estadoValidacion: "VALIDADO" }]);
    servicio.resultados.anular = jasmine.createSpy().and.resolveTo({});
    await montar(); await clic("Anular resultado #4");
    act(() => {
      const el = host.querySelector("textarea"); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(el, " Evidencia incorrecta ");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => host.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(servicio.resultados.anular).toHaveBeenCalledWith(4, "Evidencia incorrecta"); expect(host.textContent).toContain("Resultado anulado.");
  });
  it("permite recuperar la sincronización después de recargar un validado", async () => {
    servicio.resultados.porPartida.and.resolveTo([{ id: 4, estadoValidacion: "VALIDADO", puntajeA: 2, puntajeB: 1 }]);
    servicio.rankings = { recalcular: jasmine.createSpy().and.resolveTo([]) };
    await montar(); await clic("Sincronizar ranking del torneo");
    expect(servicio.rankings.recalcular).toHaveBeenCalledWith(2); expect(host.textContent).toContain("Ranking sincronizado.");
    expect(servicio.resultados.validar).not.toHaveBeenCalled();
  });
  it("distingue resultado guardado de ranking pendiente ante HTTP 503", async () => {
    servicio.resultados.porPartida.and.resolveTo([{ id: 4, estadoValidacion: "PENDIENTE", puntajeA: 2, puntajeB: 1 }]);
    servicio.resultados.validar.and.rejectWith({ status: 503, message: "HTTP 503", detalle: { error: "Resultado guardado; ranking pendiente." } });
    await montar(); await clic("Validar resultado #4"); await clic("Confirmar validación");
    expect(host.textContent).toContain("Resultado guardado; ranking pendiente.");
    expect(host.textContent).not.toContain("Resultado validado.");
  });
});
