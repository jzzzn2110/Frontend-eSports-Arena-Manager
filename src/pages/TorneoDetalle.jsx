import { useState, useEffect } from 'react';

function TorneoDetalle({ datos, torneoId }) {

  const {
    PARTIDAS, RANKINGS, PREMIOS,
    obtenerTorneoPorId, obtenerJuegoPorId, obtenerNombreParticipante,
    nombreEstado, formatearFecha, formatearFechaHora, cuposDisponibles, ordenarRanking
  } = datos;

  const [torneoActual, setTorneoActual] = useState(null);
  const [rondaSeleccionada, setRondaSeleccionada] = useState(1);

  useEffect(() => {
    const torneo = torneoId ? obtenerTorneoPorId(torneoId) : null;
    setTorneoActual(torneo);

    if (torneo) {
      const rondas = [...new Set(
        PARTIDAS.filter((p) => p.torneoId === torneo.id).map((p) => p.ronda)
      )].sort((a, b) => a - b);

      setRondaSeleccionada(rondas[0] || 1);
    }
  }, [torneoId, PARTIDAS, obtenerTorneoPorId]);

  if (!torneoActual) {
    return (
      <div className="contenedor seccion" id="torneo-no-encontrado">
        <div className="aviso aviso--error" role="alert">
          El torneo solicitado no existe o no se encuentra disponible.
        </div>
      </div>
    );
  }

  const juego = obtenerJuegoPorId(torneoActual.juegoId);
  const ranking = RANKINGS[torneoActual.id] || [];
  const rankingOrdenado = ordenarRanking(ranking);
  const premios = PREMIOS[torneoActual.id] || [];

  const rondasDisponibles = [...new Set(
    PARTIDAS.filter((p) => p.torneoId === torneoActual.id).map((p) => p.ronda)
  )].sort((a, b) => a - b);

  const partidasRonda = PARTIDAS.filter(
    (p) => p.torneoId === torneoActual.id && p.ronda === rondaSeleccionada
  );

  const claseInsigniaTorneo = (estado) => {
    if (estado === 'abierto') return 'insignia--abierto';
    if (estado === 'en-curso') return 'insignia--en-curso';
    return 'insignia--finalizado';
  };

  const nombrePartidaEstado = (estado) => {
    const mapa = {
      programada: 'Programada',
      'en-curso': 'En curso',
      finalizada: 'Finalizada',
      cancelada: 'Cancelada',
    };
    return mapa[estado] ?? estado;
  };

  return (
    <div className="contenedor seccion" id="torneo-contenido">
      {/* Datos Generales */}
      <div className="tarjeta mb-4">
        <div className="titulo-seccion">
          <h1 id="torneo-nombre" className="mb-0">{torneoActual.nombre}</h1>
          <span id="torneo-insignia" className={`insignia ${claseInsigniaTorneo(torneoActual.estado)}`}>
            {nombreEstado(torneoActual.estado)}
          </span>
        </div>
        <p id="torneo-juego-modalidad" className="tarjeta__meta mb-3">
          {juego ? `${juego.nombre} · ${juego.modalidad}` : 'Juego no disponible'}
        </p>
        <div className="row g-2 text-center border-top pt-3">
          <div className="col-md-4">
            <strong>Cierre de inscripción:</strong>
            <div id="torneo-cierre">{formatearFecha(torneoActual.fechaCierreInscripcion)}</div>
          </div>
          <div className="col-md-4">
            <strong>Inicio:</strong>
            <div id="torneo-inicio">{formatearFecha(torneoActual.fechaInicio)}</div>
          </div>
          <div className="col-md-4">
            <strong>Cupos:</strong>
            <div id="torneo-cupos">
              {`${torneoActual.participantesInscritos.length} / ${torneoActual.cupoMaximo} (${cuposDisponibles(torneoActual)} disponibles)`}
            </div>
          </div>
        </div>
      </div>

      {/* Participantes */}
      <div className="tarjeta mb-4">
        <h4>Participantes</h4>
        <div id="lista-participantes" className="d-flex flex-wrap gap-2 mt-2">
          {torneoActual.participantesInscritos.length === 0 ? (
            <p className="estado-vacio tarjeta__meta mb-0">Todavía no hay participantes inscritos.</p>
          ) : (
            torneoActual.participantesInscritos.map((id) => (
              <span key={id} className="chip">
                {obtenerNombreParticipante(torneoActual, id)}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Calendario de Partidas / Llaves */}
      <div className="tarjeta mb-4">
        <h4>Partidas</h4>
        <div id="pestanas-ronda" className="pestanas-ronda" aria-label="Seleccionar ronda">
          {rondasDisponibles.map((ronda) => (
            <button
              key={ronda}
              type="button"
              className="pestana-ronda"
              aria-pressed={ronda === rondaSeleccionada}
              onClick={() => setRondaSeleccionada(ronda)}
            >
              Ronda {ronda}
            </button>
          ))}
        </div>

        <div id="lista-partidas" className="lista-partidas">
          {partidasRonda.length === 0 ? (
            <p className="estado-vacio tarjeta__meta mb-0">Sin partidas programadas para esta ronda todavía.</p>
          ) : (
            partidasRonda.map((partida) => {
              const nombreA = obtenerNombreParticipante(torneoActual, partida.participanteA);
              const nombreB = obtenerNombreParticipante(torneoActual, partida.participanteB);
              return (
                <div key={partida.id} className="partida">
                  <div>
                    <strong className="partida__rivales">{nombreA} vs {nombreB}</strong>
                    <div className="small tarjeta__meta partida__meta">{formatearFechaHora(partida.horario)}</div>
                  </div>
                  <span className="chip">
                    {nombrePartidaEstado(partida.estado)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tabla de Ranking */}
      <div className="tarjeta mb-4">
        <h4>Tabla de Posiciones</h4>
        <div className="tabla-responsive">
          <table className="mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Participante</th>
                <th>Puntos</th>
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody id="cuerpo-tabla-ranking">
              {rankingOrdenado.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center tarjeta__meta">
                    Aún no hay resultados validados para este torneo.
                  </td>
                </tr>
              ) : (
                rankingOrdenado.map((fila, indice) => (
                  <tr key={fila.participanteId || indice}>
                    <td>{indice + 1}</td>
                    <td>{obtenerNombreParticipante(torneoActual, fila.participanteId)}</td>
                    <td>{fila.puntos}</td>
                    <td>{fila.diferencia > 0 ? `+${fila.diferencia}` : fila.diferencia}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección de Premios */}
      {torneoActual.estado === 'finalizado' && premios.length > 0 && (
        <div className="tarjeta" id="seccion-premios">
          <h4>Premios</h4>
          <ul id="lista-premios" className="lista-resumen">
            {premios.map((p) => (
              <li key={p.posicion} className="flex-entre flex-envolver">
                <span><strong>Posición {p.posicion}:</strong></span>
                <span>{p.premio}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TorneoDetalle;
