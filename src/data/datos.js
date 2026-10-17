// Datos originales de eSports Arena Manager
const JUEGOS = [
  {
    id: "g5",
    nombre: "Minecraft",
    modalidad: "4v4 PvP por equipos",
    integrantesPorEquipo: 4,
    icono: "/img/logo_mine.png",
  },
  {
    id: "g1",
    nombre: "League of Legends",
    modalidad: "5v5 MOBA",
    integrantesPorEquipo: 5,
    icono: "/img/logo_lol.png",
  },
  {
    id: "g2",
    nombre: "Valorant",
    modalidad: "5v5 Shooter táctico",
    integrantesPorEquipo: 5,
    icono: "/img/logo_valorant.png",
  },
  {
    id: "g3",
    nombre: "Ajedrez",
    modalidad: "1v1 Individual",
    integrantesPorEquipo: 1,
    icono: "/img/logo_chees.png",
  },
  {
    id: "g4",
    nombre: "Rocket League",
    modalidad: "2v2 Duelo",
    integrantesPorEquipo: 2,
    icono: "/img/logo_rocket.png",
  },
];
const JUGADORES = [
  {
    id: "j1",
    nombre: "Pablo Salas",
    apodo: "SadPablo666",
    email: "pablo.salas@example.com",
    victorias: 6,
    derrotas: 7,
    sanciones: [],
  },
  {
    id: "j2",
    nombre: "jhon olivares",
    apodo: "jhn_shooter",
    email: "jhon.olivares@example.com",
    victorias: 9,
    derrotas: 4,
    sanciones: [],
  },
  {
    id: "j3",
    nombre: "sergio morales",
    apodo: "ssmorale",
    email: "sergio.morales@example.com",
    victorias: 20,
    derrotas: 4,
    sanciones: [
      { motivo: "Conducta antideportiva", duracionDias: 7, vigente: true },
    ],
  },
  {
    id: "j4",
    nombre: "Diego Fuentes",
    apodo: "DFuentesGG",
    email: "diego.fuentes@example.com",
    victorias: 5,
    derrotas: 5,
    sanciones: [],
  },
  {
    id: "j5",
    nombre: "Javier Muñoz",
    apodo: "JaviTurbo",
    email: "javier.munoz@example.com",
    victorias: 11,
    derrotas: 3,
    sanciones: [
      { motivo: "Ausencia injustificada", duracionDias: 3, vigente: false },
    ],
  },
  {
    id: "j6",
    nombre: "Tomás Herrera",
    apodo: "tomaherreria",
    email: "tomas.herrera@example.com",
    victorias: 7,
    derrotas: 9,
    sanciones: [],
  },
  {
    id: "j7",
    nombre: "Fernanda Vidal",
    apodo: "FerVidal",
    email: "fernanda.vidal@example.com",
    victorias: 16,
    derrotas: 8,
    sanciones: [],
  },
  {
    id: "j8",
    nombre: "Ignacio Bravo",
    apodo: "nachotee",
    email: "ignacio.bravo@example.com",
    victorias: 3,
    derrotas: 2,
    sanciones: [],
  },
];
const EQUIPOS = [
  {
    id: "e1",
    nombre: "los gallos",
    juegoId: "g1",
    capitanId: "j1",
    activo: true,
    integrantes: [
      { jugadorId: "j1", rol: "Capitán" },
      { jugadorId: "j2", rol: "Soporte" },
      { jugadorId: "j3", rol: "Carril superior" },
      { jugadorId: "j4", rol: "Carril inferior" },
      { jugadorId: "j6", rol: "Jungla" },
    ],
  },
  {
    id: "e2",
    nombre: "los simples",
    juegoId: "g2",
    capitanId: "j5",
    activo: true,
    integrantes: [
      { jugadorId: "j5", rol: "Capitán" },
      { jugadorId: "j7", rol: "Entry fragger" },
      { jugadorId: "j8", rol: "Francotirador" },
    ],
  },
  {
    id: "e3",
    nombre: "los inactivos",
    juegoId: "g1",
    capitanId: "j6",
    activo: false,
    integrantes: [
      { jugadorId: "j6", rol: "Capitán" },
      { jugadorId: "j4", rol: "Soporte" },
    ],
  },
];
const TORNEOS = [
  {
    id: "t1",
    nombre: "Copa Arena Púrpura",
    juegoId: "g1",
    estado: "abierto",
    fechaCierreInscripcion: "2026-09-15",
    fechaInicio: "2026-09-20",
    cupoMaximo: 8,
    participantesInscritos: ["e1"],
  },
  {
    id: "t2",
    nombre: "Torneo Táctico Elite",
    juegoId: "g2",
    estado: "en-curso",
    fechaCierreInscripcion: "2026-08-10",
    fechaInicio: "2026-08-15",
    cupoMaximo: 4,
    participantesInscritos: ["e2"],
  },
  {
    id: "t3",
    nombre: "Torneo de Ajedrez",
    juegoId: "g3",
    estado: "abierto",
    fechaCierreInscripcion: "2026-09-05",
    fechaInicio: "2026-09-12",
    cupoMaximo: 16,
    participantesInscritos: ["j5", "j8"],
  },
  {
    id: "t4",
    nombre: "Duelo Rocket League 1v1",
    juegoId: "g4",
    estado: "finalizado",
    fechaCierreInscripcion: "2026-07-01",
    fechaInicio: "2026-07-05",
    cupoMaximo: 8,
    participantesInscritos: ["j3", "j7"],
  },
  {
    id: "t5",
    nombre: "copa Minecraft PvP",
    juegoId: "g5",
    estado: "abierto",
    fechaCierreInscripcion: "2026-09-25",
    fechaInicio: "2026-09-30",
    cupoMaximo: 8,
    participantesInscritos: [],
  },
];

const PARTIDAS = [
  {
    id: "p1",
    torneoId: "t2",
    ronda: 1,
    participanteA: "e2",
    participanteB: null,
    horario: "2026-08-16T18:00",
    estado: "programada",
  },
  {
    id: "p2",
    torneoId: "t4",
    ronda: 1,
    participanteA: "j3",
    participanteB: "j7",
    horario: "2026-07-06T18:00",
    estado: "finalizada",
  },
];

const RANKINGS = {
  t4: [
    { participanteId: "j3", puntos: 9, diferencia: 5 },
    { participanteId: "j7", puntos: 3, diferencia: -5 },
  ],
  t2: [{ participanteId: "e2", puntos: 3, diferencia: 2 }],
};

const PREMIOS = {
  t4: [
    { posicion: 1, premio: "Trofeo Arena Smash + $150.000" },
    { posicion: 2, premio: "Medalla de plata" },
  ],
};

//permite importar los datos desde las paginas y funciones
export { JUEGOS, JUGADORES, EQUIPOS, TORNEOS, PARTIDAS, RANKINGS, PREMIOS };
