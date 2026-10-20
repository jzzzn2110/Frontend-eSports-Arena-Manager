import {
  inscripcionFueraDePlazo,
  formatearFecha,
  formatearFechaHora,
  calcularPuntos,
  cuposDisponibles,
  tieneSancionActiva,
  ordenarRanking,
  nombreEstado,
  claseInsigniaTorneo,
} from "../src/utils/logica.js";
describe("Fechas, límites y resultados", () => {
  it("mantiene abierto el último milisegundo del día de cierre local", () => {
    const t = { fechaCierreInscripcion: "2030-02-01" };
    expect(
      inscripcionFueraDePlazo(t, new Date("2030-02-01T23:59:59.999")),
    ).toBeFalse();
    expect(
      inscripcionFueraDePlazo(t, new Date("2030-02-02T00:00:00")),
    ).toBeTrue();
  });
  it("no permite fechas de cierre ausentes o inválidas", () => {
    expect(inscripcionFueraDePlazo(null)).toBeTrue();
    expect(
      inscripcionFueraDePlazo({ fechaCierreInscripcion: "no-fecha" }),
    ).toBeTrue();
  });
  it("respeta un cierre con hora explícita", () => {
    expect(
      inscripcionFueraDePlazo(
        { fechaCierreInscripcion: "2030-02-01T10:00:00" },
        new Date("2030-02-01T11:00:00"),
      ),
    ).toBeTrue();
  });
  it("formatea fechas sin desplazar el día", () => {
    expect(formatearFecha("2030-02-01")).toBe("01/02/2030");
    expect(formatearFecha("2030-02-01T12:00:00")).toBe("01/02/2030");
    expect(formatearFecha(null)).toBe("-");
    expect(formatearFecha("incorrecta")).toBe("-");
    expect(formatearFechaHora("incorrecta")).toBe("-");
  });
  it("maneja listas vacías y datos ausentes", () => {
    expect(cuposDisponibles(null)).toBe(0);
    expect(cuposDisponibles({})).toBe(0);
    expect(cuposDisponibles({ cupoMaximo: 4 })).toBe(4);
    expect(tieneSancionActiva(null)).toBeFalse();
    expect(tieneSancionActiva({})).toBeFalse();
    expect(ordenarRanking()).toEqual([]);
  });
  it("solo calcula puntos de partidas con resultado del participante", () => {
    const resultados = [
      { participanteA: "a", participanteB: "b", ganadorId: "a" },
      { participanteA: "a", participanteB: "b", ganadorId: "b" },
      { participanteA: "a", participanteB: "b", ganadorId: null },
      { participanteA: "c", participanteB: "d", ganadorId: "c" },
    ];
    expect(calcularPuntos(resultados, "a")).toBe(3);
    expect(calcularPuntos(resultados, "a", 5, 1)).toBe(6);
    expect(calcularPuntos()).toBe(0);
  });
  it("presenta estados conocidos y valores de respaldo", () => {
    expect(nombreEstado("abierto")).toBe("Abierto");
    expect(nombreEstado("otro")).toBe("otro");
    expect(claseInsigniaTorneo("abierto")).toBe("insignia--abierto");
    expect(claseInsigniaTorneo("finalizado")).toBe("insignia--finalizado");
  });
});
