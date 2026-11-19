import React, { act } from "react";
import { createRoot } from "react-dom/client";
import CompeticionRemota from "../src/components/CompeticionRemota.jsx";

describe("Competición remota", () => {
  let host, root, servicios;
  beforeEach(() => {
    host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host);
    servicios = { rankings: { porTorneo: jasmine.createSpy().and.resolveTo([]) }, partidas: { porTorneo: jasmine.createSpy().and.resolveTo([]) } };
  });
  afterEach(() => { act(() => root.unmount()); host.remove(); });
  async function montar(id = 1) { await act(async () => { root.render(<CompeticionRemota torneoId={id} servicios={servicios} />); }); }
  it("muestra vacíos reales sin datos de demostración", async () => {
    await montar();
    expect(host.textContent).toContain("No hay clasificación publicada");
    expect(host.textContent).toContain("No hay partidas programadas");
    expect(servicios.rankings.porTorneo.calls.mostRecent().args[0]).toBe(1);
  });
  it("representa ranking y calendario recibidos", async () => {
    servicios.rankings.porTorneo.and.resolveTo([{id: 1, participanteId: 25, posicion: 1, puntos: 9}]);
    servicios.partidas.porTorneo.and.resolveTo([{id: 2, ronda: "Final", participanteAId: 25, participanteBId: null, fechaHora: "2030-01-01T12:00:00", estado: "PROGRAMADA"}]);
    await montar();
    expect(host.querySelector("tbody").textContent).toContain("Participante #25");
    expect(host.textContent).toContain("Por definir");
    expect(host.querySelector("time").dateTime).toBe("2030-01-01T12:00:00");
  });
  it("informa error y permite reintentar", async () => {
    servicios.rankings.porTorneo.and.rejectWith(new Error("Sin conexión"));
    await montar(); expect(host.querySelector('[role="alert"]').textContent).toContain("Sin conexión");
    servicios.rankings.porTorneo.and.resolveTo([]);
    await act(async () => host.querySelector("button").click());
    expect(host.querySelector('[role="alert"]')).toBeNull();
  });
  it("cancela las consultas al cambiar de torneo", async () => {
    await montar(1);
    const signal = servicios.rankings.porTorneo.calls.mostRecent().args[1].signal;
    await montar(2);
    expect(signal.aborted).toBeTrue();
    expect(servicios.rankings.porTorneo.calls.mostRecent().args[0]).toBe(2);
  });
});
