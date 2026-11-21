import React, { act } from "react";
import { createRoot } from "react-dom/client";
import PremiosRemotos from "../src/components/PremiosRemotos.jsx";

describe("Premios remotos", () => {
  let host, root, servicios;
  beforeEach(() => {
    host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host);
    servicios = { premios: { porTorneo: jasmine.createSpy().and.resolveTo([]), asignar: jasmine.createSpy().and.resolveTo({ id: 1 }) } };
  });
  afterEach(() => { act(() => root.unmount()); host.remove(); });
  async function montar(estado = "finalizado", id = 1, puedeAsignar = false) {
    await act(async () => root.render(<PremiosRemotos torneoId={id} estado={estado} puedeAsignar={puedeAsignar} servicios={servicios} />));
  }
  it("no consulta ni muestra premios antes del cierre", async () => {
    await montar("en-curso");
    expect(servicios.premios.porTorneo).not.toHaveBeenCalled();
    expect(host.textContent).toBe("");
  });
  it("muestra los premios publicados por la API", async () => {
    servicios.premios.porTorneo.and.resolveTo([{ id: 7, posicion: 1, participanteId: 25, descripcion: "Trofeo" }]);
    await montar(); expect(host.textContent).toContain("Puesto 1 · Participante #25: Trofeo");
    expect(host.querySelector("form")).toBeNull();
  });
  async function completar() {
    for (const [id, value] of [["premio-posicion", "1"], ["premio-participante", "25"], ["premio-descripcion", "Trofeo"]]) {
      act(() => {
        const input = host.querySelector(`#${id}`);
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
    await act(async () => host.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
  }
  it("envía la asignación administrativa y actualiza la lista", async () => {
    await montar("finalizado", 1, true); await completar();
    expect(servicios.premios.asignar).toHaveBeenCalledWith(1, { posicion: 1, participanteId: 25, descripcion: "Trofeo" });
    expect(host.textContent).toContain("Premio asignado.");
    expect(servicios.premios.porTorneo.calls.count()).toBe(2);
  });
  it("conserva el formulario sin éxito cuando la API rechaza la posición", async () => {
    servicios.premios.asignar.and.rejectWith(new Error("El participante no ocupa esa posición"));
    await montar("finalizado", 1, true); await completar();
    expect(host.textContent).toContain("El participante no ocupa esa posición");
    expect(host.textContent).not.toContain("Premio asignado.");
    expect(host.querySelector("#premio-descripcion").value).toBe("Trofeo");
  });
  it("permite recuperar una consulta fallida sin inventar premios", async () => {
    servicios.premios.porTorneo.and.rejectWith(new Error("Sin conexión"));
    await montar(); expect(host.querySelector('[role="alert"]').textContent).toContain("Sin conexión");
    servicios.premios.porTorneo.and.resolveTo([]);
    await act(async () => host.querySelector("button").click());
    expect(host.textContent).toContain("Todavía no se han asignado");
  });
  it("oculta premios y cancela la consulta al cambiar a torneo abierto", async () => {
    await montar(); const signal = servicios.premios.porTorneo.calls.mostRecent().args[1].signal;
    await montar("abierto", 2); expect(signal.aborted).toBeTrue(); expect(host.textContent).toBe("");
  });
});
