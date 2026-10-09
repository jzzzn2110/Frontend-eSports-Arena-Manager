import {
  cuposDisponibles,
  ordenarRanking,
  tieneSancionActiva,
} from '../src/utils/logica.js';

// Pruebas de las reglas del proyecto.
describe('Lógica de eSports Arena Manager', () => {
  it('no devuelve cupos negativos', () => {
    const torneo = {
      cupoMaximo: 2,
      participantesInscritos: ['e1', 'e2', 'e3'],
    };

    expect(cuposDisponibles(torneo)).toBe(0);
  });

  it('ordena por puntos y diferencia sin modificar el original', () => {
    const ranking = [
      { participanteId: 'e1', puntos: 3, diferencia: 1 },
      { participanteId: 'e2', puntos: 6, diferencia: 2 },
      { participanteId: 'e3', puntos: 6, diferencia: 5 },
    ];

    const ordenado = ordenarRanking(ranking);

    expect(ordenado.map((fila) => fila.participanteId))
      .toEqual(['e3', 'e2', 'e1']);

    expect(ranking.map((fila) => fila.participanteId))
      .toEqual(['e1', 'e2', 'e3']);
  });

  it('distingue las sanciones vigentes de las terminadas', () => {
    expect(tieneSancionActiva({
      sanciones: [{ vigente: true }],
    })).toBeTrue();

    expect(tieneSancionActiva({
      sanciones: [{ vigente: false }],
    })).toBeFalse();
  });
});