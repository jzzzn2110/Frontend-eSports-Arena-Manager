import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useArena } from "../context/ArenaContext.jsx";
import {
  cuposDisponibles,
  formatearFecha,
  inscripcionFueraDePlazo,
} from "../utils/logica.js";
export default function Inscripcion({ actor }) {
  const { datos, store } = useArena();
  const [params, setParams] = useSearchParams();
  const id = params.get("torneo") || "";
  const torneo = datos.TORNEOS.find((t) => t.id === id);
  const juego = datos.JUEGOS.find((j) => j.id === torneo?.juegoId);
  const individual = juego?.integrantesPorEquipo === 1;
  const [equipoId, setEquipoId] = useState("");
  const [confirmacion, setConfirmacion] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const equipos = datos.EQUIPOS.filter(
    (e) =>
      e.juegoId === torneo?.juegoId &&
      e.activo &&
      (actor.rol === "administrador" || e.capitanId === actor.jugadorId),
  );
  const participanteId = individual ? actor.jugadorId : equipoId;
  const inscrito = torneo?.participantesInscritos.includes(participanteId);
  const cerrado =
    torneo && (torneo.estado !== "abierto" || inscripcionFueraDePlazo(torneo));
  function enviar(e) {
    e.preventDefault();
    try {
      if (!confirmacion)
        throw new Error("Confirma los datos antes de inscribirte.");
      store.inscribir(id, participanteId, actor);
      setMensaje({
        tipo: "success",
        texto:
          "Inscripción registrada. Los cupos y tu historial están actualizados.",
      });
      setConfirmacion(false);
    } catch (error) {
      setMensaje({ tipo: "danger", texto: error.message });
    }
  }
  function cancelar() {
    try {
      store.cancelarInscripcion(id, participanteId, actor);
      setMensaje({
        tipo: "success",
        texto: "Inscripción cancelada. El cupo está disponible nuevamente.",
      });
    } catch (error) {
      setMensaje({ tipo: "danger", texto: error.message });
    }
  }
  return (
    <main className="container py-4 pagina-formulario">
      <h1>Inscripción a torneo</h1>
      {actor.rol === "visitante" && (
        <p className="alert alert-info">
          Selecciona el perfil de prueba Jugador para inscribirte.
        </p>
      )}
      {mensaje && (
        <p role="alert" className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
        </p>
      )}
      <form className="card p-4" onSubmit={enviar}>
        <label className="form-label" htmlFor="selector-torneo">
          Torneo
        </label>
        <select
          className="form-select mb-3"
          id="selector-torneo"
          value={id}
          onChange={(e) => {
            setParams(e.target.value ? { torneo: e.target.value } : {});
            setEquipoId("");
            setConfirmacion(false);
            setMensaje(null);
          }}
        >
          <option value="">Selecciona un torneo</option>
          {datos.TORNEOS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        {id && !torneo && (
          <p className="alert alert-danger" role="alert">
            El torneo indicado no existe.
          </p>
        )}
        {torneo && (
          <>
            <div className="resumen-inscripcion mb-3">
              <h2 className="h4">{torneo.nombre}</h2>
              <p>
                {juego.nombre} · {juego.modalidad}
              </p>
              <p>
                Cierre: {formatearFecha(torneo.fechaCierreInscripcion)} ·{" "}
                <strong>{cuposDisponibles(torneo)} cupos disponibles</strong>
              </p>
            </div>
            {cerrado && (
              <p className="alert alert-warning">
                Las inscripciones de este torneo están cerradas.
              </p>
            )}
            {individual ? (
              <p>
                Participante individual:{" "}
                <strong>
                  {datos.JUGADORES.find((j) => j.id === actor.jugadorId)?.apodo}
                </strong>
              </p>
            ) : (
              <>
                <label className="form-label" htmlFor="equipo-selector">
                  Equipo del que eres capitán
                </label>
                <select
                  id="equipo-selector"
                  className="form-select mb-3"
                  value={equipoId}
                  onChange={(e) => {
                    setEquipoId(e.target.value);
                    setMensaje(null);
                  }}
                >
                  <option value="">Selecciona tu equipo</option>
                  {equipos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} ({e.integrantes.length}/
                      {juego.integrantesPorEquipo})
                    </option>
                  ))}
                </select>
                {!equipos.length && (
                  <p>
                    No tienes un equipo activo para este juego.{" "}
                    <Link to="/equipo.html">Gestionar equipos</Link>
                  </p>
                )}
              </>
            )}
            {inscrito ? (
              <div>
                <p className="alert alert-info">
                  Este participante ya está inscrito.
                </p>
                <button
                  type="button"
                  className="btn btn-outline-warning"
                  disabled={actor.rol === "visitante" || cerrado}
                  onClick={cancelar}
                >
                  Cancelar inscripción
                </button>
              </div>
            ) : (
              <>
                <div className="form-check my-3">
                  <input
                    className="form-check-input"
                    id="confirmacion"
                    type="checkbox"
                    checked={confirmacion}
                    onChange={(e) => setConfirmacion(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="confirmacion">
                    Confirmo los datos y los requisitos de participación.
                  </label>
                </div>
                <button
                  className="btn btn-primary"
                  disabled={
                    actor.rol === "visitante" ||
                    cerrado ||
                    !participanteId ||
                    !confirmacion ||
                    cuposDisponibles(torneo) === 0
                  }
                >
                  Completar inscripción
                </button>
              </>
            )}
            <Link className="mt-3 d-block" to={`/torneo-detalle.html?id=${id}`}>
              Ver detalle del torneo
            </Link>
          </>
        )}
      </form>
    </main>
  );
}
