import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EstadoCatalogo from "../components/EstadoCatalogo.jsx";
import CompeticionRemota from "../components/CompeticionRemota.jsx";
import PremiosRemotos from "../components/PremiosRemotos.jsx";
import NotificacionesTorneo from "../components/NotificacionesTorneo.jsx";
import { useArena } from "../context/ArenaContext.jsx";
import { useCatalogo } from "../context/useCatalogo.js";
import { apiConfigurada } from "../services/api.js";
import {
  nombreEstado,
  formatearFecha,
  formatearFechaHora,
  cuposDisponibles,
  ordenarRanking,
} from "../utils/logica.js";
function TorneoDetalle() {
  const [params] = useSearchParams();
  const catalogo = useCatalogo(params.get("id"));
  if (catalogo.estado !== "listo") {
    return (
      <main className="container my-4">
        <h1>Detalle del torneo</h1>
        <EstadoCatalogo {...catalogo} />
        <Link to="/torneos.html">Volver a torneos</Link>
      </main>
    );
  }

  const { torneo: torneoActual, juego, desdeApi } = catalogo;
  if (!torneoActual) {
    return (
      <main className="container my-5" id="torneo-no-encontrado">
        <h1>Torneo no encontrado</h1>
        <div className="alert alert-danger" role="alert">
          El torneo solicitado no existe o no se encuentra disponible.
        </div>
        <Link to="/torneos.html">Volver a torneos</Link>
      </main>
    );
  }

  let claseEstado = "bg-secondary";
  if (torneoActual.estado === "abierto") claseEstado = "bg-success";
  if (torneoActual.estado === "en-curso") claseEstado = "bg-warning text-dark";

  return (
    <main className="container my-4" id="torneo-contenido">
      <div className="card mb-4 p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h1 id="torneo-nombre" className="h2 mb-0">
            {torneoActual.nombre}
          </h1>
          <span id="torneo-insignia" className={`badge ${claseEstado} fs-6`}>
            {nombreEstado(torneoActual.estado)}
          </span>
        </div>
        <p id="torneo-juego-modalidad" className="text-muted mb-3">
          {juego
            ? `${juego.nombre} · ${juego.modalidad}`
            : "Juego no disponible"}
        </p>
        {apiConfigurada && !desdeApi && <p className="text-muted">Torneo de demostración</p>}
        <div className="row g-2 text-center border-top pt-3">
          <div className="col-md-4">
            <strong>Cierre de inscripción:</strong>
            <div id="torneo-cierre">
              {formatearFecha(torneoActual.fechaCierreInscripcion)}
            </div>
          </div>
          <div className="col-md-4">
            <strong>Inicio:</strong>
            <div id="torneo-inicio">
              {formatearFecha(torneoActual.fechaInicio)}
            </div>
          </div>
          <div className="col-md-4">
            <strong>{desdeApi ? "Cupo máximo" : "Cupos"}:</strong>
            <div id="torneo-cupos">
              {desdeApi
                ? torneoActual.cupoMaximo
                : `${torneoActual.participantesInscritos.length} / ${torneoActual.cupoMaximo} (${cuposDisponibles(torneoActual)} disponibles)`}
            </div>
          </div>
        </div>
      </div>
      {desdeApi
        ? (
          <>
            <CompeticionRemota torneoId={torneoActual.id} />
            <PremiosRemotos torneoId={torneoActual.id} estado={torneoActual.estado} />
            <NotificacionesTorneo torneoId={torneoActual.id} />
            <Link to="/torneos.html">Volver a torneos</Link>
          </>
        )
        : <DetalleDemostracion torneoActual={torneoActual} juego={juego} />}
    </main>
  );
}

function DetalleDemostracion({ torneoActual, juego }) {
  const { datos } = useArena();
  const { PARTIDAS, RANKINGS, PREMIOS, JUGADORES, EQUIPOS } = datos;
  const [rondaSeleccionada, setRondaSeleccionada] = useState(1);

  const obtenerNombreParticipante = (id) => {
    if (!id) return "Por definir";
    return juego?.integrantesPorEquipo === 1
      ? JUGADORES.find((j) => j.id === id)?.apodo || "Participante no disponible"
      : EQUIPOS.find((e) => e.id === id)?.nombre || "Equipo no disponible";
  };

  const ranking = RANKINGS[torneoActual.id] || [];
  const rankingOrdenado = ordenarRanking(ranking);
  const premios = PREMIOS[torneoActual.id] || [];

  const rondasDisponibles = [
    ...new Set(
      PARTIDAS.filter((p) => p.torneoId === torneoActual.id).map(
        (p) => p.ronda,
      ),
    ),
  ].sort((a, b) => a - b);

  const partidasRonda = PARTIDAS.filter(
    (p) =>
      p.torneoId === torneoActual.id &&
      p.ronda ===
        (rondasDisponibles.includes(rondaSeleccionada)
          ? rondaSeleccionada
          : rondasDisponibles[0]),
  );

  const nombrePartidaEstado = (estado) => {
    const mapa = {
      programada: "Programada",
      "en-curso": "En curso",
      finalizada: "Finalizada",
      cancelada: "Cancelada",
    };
    return mapa[estado] ?? estado;
  };

  return (
    <>
      {/* Participantes */}
      <div className="card mb-4 p-3 shadow-sm">
        <h4>Participantes</h4>
        <div id="lista-participantes" className="d-flex flex-wrap gap-2 mt-2">
          {torneoActual.participantesInscritos.length === 0 ? (
            <p className="estado-vacio text-muted mb-0">
              Todavía no hay participantes inscritos.
            </p>
          ) : (
            torneoActual.participantesInscritos.map((id) => (
              <span key={id} className="badge bg-secondary fs-6">
                {obtenerNombreParticipante(id)}
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
              className={`btn btn-outline-primary ${ronda === rondaSeleccionada ? "active" : ""}`}
              onClick={() => setRondaSeleccionada(ronda)}
            >
              Ronda {ronda}
            </button>
          ))}
        </div>

        <div id="lista-partidas" className="list-group">
          {partidasRonda.length === 0 ? (
            <p className="estado-vacio text-muted mb-0">
              Sin partidas programadas para esta ronda todavía.
            </p>
          ) : (
            partidasRonda.map((partida) => {
              const nombreA = obtenerNombreParticipante(partida.participanteA);
              const nombreB = obtenerNombreParticipante(partida.participanteB);
              return (
                <div
                  key={partida.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong className="partida__rivales">
                      {nombreA} vs {nombreB}
                    </strong>
                    <div className="small text-muted partida__meta">
                      {formatearFechaHora(partida.horario)}
                    </div>
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
        <div className="table-responsive" role="region" aria-label="Tabla desplazable" tabIndex={0}>
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
                    <td>
                      {obtenerNombreParticipante(fila.participanteId)}
                    </td>
                    <td>{fila.puntos}</td>
                    <td>
                      {fila.diferencia > 0
                        ? `+${fila.diferencia}`
                        : fila.diferencia}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección de Premios */}
      {torneoActual.estado === "finalizado" && premios.length > 0 && (
        <div className="card p-3 shadow-sm" id="seccion-premios">
          <h4>Premios</h4>
          <ul id="lista-premios" className="list-group list-group-flush">
            {premios.map((p) => (
              <li
                key={p.posicion}
                className="list-group-item d-flex justify-content-between"
              >
                <span>
                  <strong>Posición {p.posicion}:</strong>
                </span>
                <span>{p.premio}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {torneoActual.estado === "abierto" && (
        <Link
          className="btn btn-primary mt-3"
          to={`/inscripcion.html?torneo=${torneoActual.id}`}
        >
          Gestionar inscripción
        </Link>
      )}
    </>
  );
}

export default TorneoDetalle;
