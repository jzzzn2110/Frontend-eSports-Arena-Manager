import React, { useState, useEffect } from 'react';

function TorneoDetalle({ datos, torneoId }) {

  const {
    TORNEOS, PARTIDAS, RANKINGS, PREMIOS, JUEGOS,
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

      if (rondas.length > 0) {
        setRondaSeleccionada(rondas[0]);
      }
    }
  }, [torneoId]);

  if (!torneoActual) {
    return (
      <div className="container my-5" id="torneo-no-encontrado">
        <div className="alert alert-danger" role="alert">
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
    if (estado === 'abierto') return 'bg-success';
    if (estado === 'en-curso') return 'bg-warning text-dark';
    return 'bg-secondary';
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
    <div className="container my-4" id="torneo-contenido">
      {/* Datos Generales */}
      <div className="card mb-4 p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 id="torneo-nombre" className="mb-0">{torneoActual.nombre}</h2>
          <span id="torneo-insignia" className={`badge ${claseInsigniaTorneo(torneoActual.estado)} fs-6`}>
            {nombreEstado(torneoActual.estado)}
          </span>
        </div>
        <p id="torneo-juego-modalidad" className="text-muted mb-3">
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
      <div className="card mb-4 p-3 shadow-sm">
        <h4>Participantes</h4>
        <div id="lista-participantes" className="d-flex flex-wrap gap-2 mt-2">
          {torneoActual.participantesInscritos.length === 0 ? (
            <p className="estado-vacio text-muted mb-0">Todavía no hay participantes inscritos.</p>
          ) : (
            torneoActual.participantesInscritos.map((id) => (
              <span key={id} className="badge bg-secondary fs-6">
                {obtenerNombreParticipante(torneoActual, id)}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Calendario de Partidas / Llaves */}
      <div className="card mb-4 p-3 shadow-sm">
        <h4>Partidas</h4>
        <div id="pestanas-ronda" className="btn-group mb-3" role="tablist">
          {rondasDisponibles.map((ronda) => (
            <button
              key={ronda}
              type="button"
              className={`btn btn-outline-primary ${ronda === rondaSeleccionada ? 'active' : ''}`}
              onClick={() => setRondaSeleccionada(ronda)}
            >
              Ronda {ronda}
            </button>
          ))}
        </div>

        <div id="lista-partidas" className="list-group">
          {partidasRonda.length === 0 ? (
            <p className="estado-vacio text-muted mb-0">Sin partidas programadas para esta ronda todavía.</p>
          ) : (
            partidasRonda.map((partida) => {
              const nombreA = obtenerNombreParticipante(torneoActual, partida.participanteA);
              const nombreB = obtenerNombreParticipante(torneoActual, partida.participanteB);
              return (
                <div key={partida.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="partida__rivales">{nombreA} vs {nombreB}</strong>
                    <div className="small text-muted partida__meta">{formatearFechaHora(partida.horario)}</div>
                  </div>
                  <span className="badge bg-info text-dark">
                    {nombrePartidaEstado(partida.estado)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tabla de Ranking */}
      <div className="card mb-4 p-3 shadow-sm">
        <h4>Tabla de Posiciones</h4>
        <div className="table-responsive">
          <table className="table table-striped align-middle mb-0">
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
                  <td colSpan="4" className="text-center text-muted">
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
        <div className="card p-3 shadow-sm" id="seccion-premios">
          <h4>Premios</h4>
          <ul id="lista-premios" className="list-group list-group-flush">
            {premios.map((p) => (
              <li key={p.posicion} className="list-group-item d-flex justify-content-between">
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
