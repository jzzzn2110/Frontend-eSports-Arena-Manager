import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import InscripcionRemota from "../src/pages/InscripcionRemota.jsx";

describe("Inscripción remota", () => {
  let host, root, servicio, perfil, torneo, juego;
  beforeEach(() => {
    localStorage.setItem("rankforge-sesion-jwt", JSON.stringify({ token: `test.${btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000)+600 }))}.test`, rol: "jugador", email: "lucas@example.test" }));
    host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host);
    perfil = { asegurar: jasmine.createSpy().and.resolveTo({ id: 7 }) };
    torneo = jasmine.createSpy().and.resolveTo({ id: "1", juegoId: "2", nombre: "Copa real", estado: "abierto", cupoMaximo: 8 });
    juego = jasmine.createSpy().and.resolveTo({ id: "2", integrantesPorEquipo: 1 });
    servicio = { equipos: { listar: jasmine.createSpy().and.resolveTo([]) }, inscripciones: {
      porTorneo: jasmine.createSpy().and.resolveTo([]), crear: jasmine.createSpy().and.resolveTo({ id: 9 }), cancelar: jasmine.createSpy().and.resolveTo(null),
    } };
  });
  afterEach(() => { act(() => root.unmount()); host.remove(); localStorage.removeItem("rankforge-sesion-jwt"); });
  async function montar(id = "1") { await act(async () => root.render(<MemoryRouter initialEntries={[`/inscripcion.html?torneo=${id}`]}><AuthProvider servicioPerfil={perfil}><InscripcionRemota servicio={servicio} cargarTorneo={torneo} cargarJuego={juego} /></AuthProvider></MemoryRouter>)); }
  it("un juego por equipos no ofrece inscripción individual", async () => {
    juego.and.resolveTo({ id: "2", integrantesPorEquipo: 5 }); await montar();
    expect(host.querySelector("#tipo-participante").value).toBe("EQUIPO");
    expect(host.querySelector('#tipo-participante option[value="JUGADOR"]')).toBeNull();
  });
  async function enviar() { await act(async () => host.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))); }
  it("exige confirmación antes de enviar", async () => {
    await montar(); await enviar();
    expect(servicio.inscripciones.crear).not.toHaveBeenCalled(); expect(host.textContent).toContain("Confirma los datos");
  });
  it("inscribe con ID real y muestra éxito después de respuesta", async () => {
    await montar(); act(() => host.querySelector('input[type="checkbox"]').click()); await enviar();
    expect(servicio.inscripciones.crear).toHaveBeenCalledWith({ torneoId: 1, tipoParticipante: "JUGADOR", jugadorId: 7 });
    expect(host.textContent).toContain("Inscripción registrada");
  });
  it("no muestra éxito cuando el servidor rechaza la inscripción", async () => {
    servicio.inscripciones.crear.and.rejectWith(new Error("Plazo terminado"));
    await montar(); act(() => host.querySelector('input[type="checkbox"]').click()); await enviar();
    expect(host.textContent).toContain("Plazo terminado"); expect(host.textContent).not.toContain("Inscripción registrada");
  });
  it("no envía IDs de demostración al servidor", async () => {
    await montar("t1"); expect(torneo).not.toHaveBeenCalled(); expect(host.textContent).toContain("torneo válido");
  });
  it("confirma la cancelación y usa el ID de inscripción", async () => {
    servicio.inscripciones.porTorneo.and.resolveTo([{ id: 9, jugadorId: 7, tipoParticipante: "JUGADOR", estado: "PENDIENTE" }]);
    await montar();
    act(() => [...host.querySelectorAll("button")].find((b) => b.textContent === "Cancelar inscripción #9").click());
    expect(servicio.inscripciones.cancelar).not.toHaveBeenCalled();
    await act(async () => [...host.querySelectorAll("button")].find((b) => b.textContent === "Confirmar cancelación").click());
    expect(servicio.inscripciones.cancelar).toHaveBeenCalledWith(9);
  });
});
