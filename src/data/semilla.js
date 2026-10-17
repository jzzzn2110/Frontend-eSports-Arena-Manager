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
  // Conserva el torneo histórico como Rocket League 2v2.
const historico = datos.TORNEOS.find((t) => t.id === "t4");

historico.juegoId = "g4";
historico.nombre = "Copa Rocket League 2v2";
historico.participantesInscritos = ["e5", "e6"];

// Rocket League usa equipos de dos integrantes.
datos.EQUIPOS.push(
  {
    id: "e5",
    nombre: "Rocket Arena",
    juegoId: "g4",
    capitanId: "j3",
    activo: true,
    integrantes: [
      { jugadorId: "j3", rol: "Capitán" },
      { jugadorId: "j4", rol: "Miembro" },
    ],
  },
  {
    id: "e6",
    nombre: "Turbo Arena",
    juegoId: "g4",
    capitanId: "j7",
    activo: true,
    integrantes: [
      { jugadorId: "j7", rol: "Capitán" },
      { jugadorId: "j8", rol: "Miembro" },
    ],
  }
);

// Relaciona los participantes históricos con sus equipos.
const equiposRocket = {
  j3: "e5",
  j7: "e6",
};

// Actualiza los participantes de las partidas del torneo.
datos.PARTIDAS
  .filter((partida) => partida.torneoId === "t4")
  .forEach((partida) => {
    partida.participanteA =
      equiposRocket[partida.participanteA] || partida.participanteA;

    partida.participanteB =
      equiposRocket[partida.participanteB] || partida.participanteB;
  });

// Mantiene los puntos del ranking asociados a los equipos.
datos.RANKINGS.t4 = datos.RANKINGS.t4.map((fila) => ({
  ...fila,
  participanteId:
    equiposRocket[fila.participanteId] || fila.participanteId,
}));
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
