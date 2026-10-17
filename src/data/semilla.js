import * as originales from "./datos.js";

export function crearSemilla(ahora = new Date()) {
  const datos = JSON.parse(JSON.stringify(originales));
  const fecha = (dias) => {
    const valor = new Date(ahora);
    valor.setDate(valor.getDate() + dias);
    return `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, "0")}-${String(valor.getDate()).padStart(2, "0")}`;
  };
  // Las fechas se fijan al crear la demostración, no cambian en cada lectura.
  datos.TORNEOS.filter((t) => t.estado === "abierto").forEach((t, i) => {
    t.fechaCierreInscripcion = fecha(14 + i * 7);
    t.fechaInicio = fecha(21 + i * 7);
  });
  const historico = datos.TORNEOS.find((t) => t.id === "t4");
  historico.juegoId = "g3";
  historico.nombre = "Copa de Ajedrez finalizada";
  datos.EQUIPOS.push({
    id: "e4",
    nombre: "Arena PvP",
    juegoId: "g5",
    capitanId: "j1",
    activo: true,
    integrantes: ["j1", "j2", "j4", "j6"].map((jugadorId) => ({
      jugadorId,
      rol: jugadorId === "j1" ? "Capitán" : "Miembro",
    })),
  });
  return datos;
}
