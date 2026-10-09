import {
  JUEGOS,
  JUGADORES,
  EQUIPOS,
  TORNEOS,
  PARTIDAS,
  RANKINGS,
  PREMIOS,
} from '../data/datos.js';

// Servicio simulado: trabaja con los datos originales en memoria.
export const arenaService = {
  async listarJuegos() {
    return JUEGOS;
  },

  async listarJugadores() {
    return JUGADORES;
  },

  async listarEquipos() {
    return EQUIPOS;
  },

  async listarTorneos() {
    return TORNEOS;
  },

  async listarPartidas() {
    return PARTIDAS;
  },

  async obtenerRankings() {
    return RANKINGS;
  },

  async obtenerPremios() {
    return PREMIOS;
  },

  // Agrega el equipo durante la sesión actual.
  async crearEquipo(equipo) {
    EQUIPOS.push(equipo);
    return equipo;
  },
};