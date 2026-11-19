import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import Organizacion from "../src/pages/Organizacion.jsx";

describe("Panel de organización remoto", () => {
  let host, root, servicio, perfil, torneos;
  beforeEach(() => {
    host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host);
    perfil = { asegurar: jasmine.createSpy().and.resolveTo({ id: 7 }) };
    torneos = jasmine.createSpy().and.resolveTo([{ id: "1", nombre: "Copa real" }]);
    servicio = { inscripciones: { porTorneo: jasmine.createSpy().and.resolveTo([{ id: 9, jugadorId: 7, estado: "PENDIENTE", tipoParticipante: "JUGADOR" }]), cambiarEstado: jasmine.createSpy().and.resolveTo({}) }, partidas: { porTorneo: jasmine.createSpy().and.resolveTo([]) } };
  });
  afterEach(() => { act(() => root.unmount()); host.remove(); localStorage.removeItem("rankforge-sesion-jwt"); });
  async function montar(rol = "organizador") {
    localStorage.setItem("rankforge-sesion-jwt", JSON.stringify({ token: `test.${btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000)+600 }))}.test`, rol }));
    await act(async () => root.render(<AuthProvider servicioPerfil={perfil}><Organizacion servicio={servicio} cargarTorneos={torneos} /></AuthProvider>));
  }
  async function seleccionar() {
    await act(async () => {
      const select = host.querySelector("#torneo-organizacion");
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(select, "1");
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  it("bloquea al jugador sin consultar operaciones", async () => {
    await montar("jugador"); expect(host.textContent).toContain("No tienes permisos"); expect(torneos).not.toHaveBeenCalled();
  });
  it("aprueba una inscripción pendiente mediante la API", async () => {
    await montar(); await seleccionar();
    await act(async () => [...host.querySelectorAll("button")].find((b) => b.textContent === "Aprobar #9").click());
    expect(servicio.inscripciones.cambiarEstado).toHaveBeenCalledWith(9, "APROBADA");
    expect(host.textContent).toContain("Inscripción aprobada");
  });
  it("muestra error sin confirmar una aprobación rechazada", async () => {
    servicio.inscripciones.cambiarEstado.and.rejectWith(new Error("Sin permisos"));
    await montar(); await seleccionar();
    await act(async () => [...host.querySelectorAll("button")].find((b) => b.textContent === "Aprobar #9").click());
    expect(host.textContent).toContain("Sin permisos"); expect(host.textContent).not.toContain("Inscripción aprobada");
  });
  it("programa una partida con participantes aprobados y horario", async () => {
    servicio.inscripciones.porTorneo.and.resolveTo([
      { id: 9, jugadorId: 7, estado: "APROBADA", tipoParticipante: "JUGADOR" },
      { id: 10, jugadorId: 8, estado: "APROBADA", tipoParticipante: "JUGADOR" },
    ]);
    servicio.partidas.crear = jasmine.createSpy().and.resolveTo({ id: 3 });
    await montar(); await seleccionar();
    function cambiar(el, value) {
      act(() => {
        const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
        el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
      });
    }
    const selects = host.querySelectorAll("form select");
    cambiar(selects[0], "7"); cambiar(selects[1], "8");
    cambiar(host.querySelector("#ronda-partida"), "Final");
    cambiar(host.querySelector("#horario-partida"), "2030-01-01T12:00");
    await act(async () => host.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(servicio.partidas.crear).toHaveBeenCalledWith({ torneoId: 1, participanteAId: 7, participanteBId: 8, ronda: "Final", fechaHora: "2030-01-01T12:00" });
    expect(host.textContent).toContain("Partida guardada");
  });
});
