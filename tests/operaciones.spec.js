import { crearOperaciones, idApi } from "../src/services/operacionesService.js";

describe("Contratos REST de operaciones EP3", () => {
  let transporte, api;
  beforeEach(() => {
    transporte = jasmine.createSpy("request").and.returnValue(Promise.resolve(null));
    api = crearOperaciones(transporte);
  });
  it("rechaza IDs simulados, vacíos o inseguros antes de enviar", () => {
    for (const id of ["t1", "", null, 0, -1, 1.2, "1/miembros", "9007199254740993"]) {
      expect(() => api.equipos.obtener(id)).toThrowError();
    }
    expect(transporte).not.toHaveBeenCalled();
    expect(idApi(12)).toBe("12");
  });
  it("envía datos de miembro como JSON", async () => {
    const datos = { usuarioId: 3, rolDentroEquipo: "JUGADOR" };
    await api.equipos.agregarMiembro(2, datos);
    expect(transporte).toHaveBeenCalledWith("/api/equipos/2/miembros", { method: "POST", json: datos });
  });
  it("respeta PUT y parámetro estado de inscripción", async () => {
    await api.inscripciones.cambiarEstado(7, "APROBADA");
    expect(transporte).toHaveBeenCalledWith("/api/inscripciones/7/estado?estado=APROBADA", { method: "PUT" });
  });
  it("codifica la justificación sin añadir parámetros ajenos", async () => {
    await api.resultados.anular(9, "Error & revisión");
    const [ruta, opciones] = transporte.calls.mostRecent().args;
    const url = new URL(ruta, "http://localhost");
    expect([...url.searchParams.keys()]).toEqual(["justificacion"]);
    expect(url.searchParams.get("justificacion")).toBe("Error & revisión");
    expect(opciones.method).toBe("PATCH");
  });
  it("propaga fallos del servidor sin inventar éxito", async () => {
    transporte.and.returnValue(Promise.reject(new Error("Sin permiso")));
    await expectAsync(api.resultados.validar(1)).toBeRejectedWithError("Sin permiso");
  });
  it("permite cancelar una consulta al salir de la vista", async () => {
    const options = { signal: new AbortController().signal };
    await api.rankings.porTorneo(4, options);
    expect(transporte).toHaveBeenCalledWith("/api/rankings/torneo/4", options);
  });
});
