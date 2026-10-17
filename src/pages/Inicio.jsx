import { useEffect } from "react";
import { Link } from "react-router-dom";

import TarjetaTorneo from "../components/TarjetaTorneo.jsx";
import { useArena } from "../context/ArenaContext.jsx";
import { formatearFecha, inscripcionFueraDePlazo } from "../utils/logica.js";

function Inicio() {
  const { datos } = useArena();
  const torneos = datos.TORNEOS;
  const juegos = datos.JUEGOS;
  useEffect(() => {
    document.title = "eSports Arena Manager — Inicio";
  }, []);

  // Selecciona los torneos abiertos y en curso.
  const destacados = torneos.filter(
    (torneo) => torneo.estado === "abierto" || torneo.estado === "en-curso",
  );

  // Ordena los torneos abiertos por fecha de cierre.
  const abiertos = torneos
    .filter(
      (torneo) =>
        torneo.estado === "abierto" && !inscripcionFueraDePlazo(torneo),
    )
    .sort((a, b) =>
      a.fechaCierreInscripcion.localeCompare(b.fechaCierreInscripcion),
    );

  function juegoPorId(id) {
    return juegos.find((juego) => juego.id === id) || null;
  }

  // Suma los participantes registrados en los torneos.
  const participantes = torneos.reduce(
    (total, torneo) => total + (torneo.participantesInscritos?.length || 0),
    0,
  );

  return (
    <main id="contenido-principal">
      <section className="presentacion presentacion--inicio">
        <div className="contenedor presentacion__grid">
          <div className="presentacion__contenido">
            <h1>Organiza y sigue tus torneos favoritos</h1>

            <p>
              Gestiona juegos, equipos, inscripciones y resultados. Descubre
              torneos abiertos, revisa las llaves y consulta la tabla de
              posiciones. Todo en un solo lugar.
            </p>

            <div className="presentacion__acciones">
              <Link to="/torneos.html" className="boton boton-primario">
                Ver torneos
              </Link>

              <Link to="/perfil.html" className="boton boton-secundario">
                Mi perfil
              </Link>
            </div>

            <div
              className="resumen-inicio"
              aria-label="Resumen de la plataforma"
            >
              <div className="resumen-inicio__dato">
                <strong>{abiertos.length}</strong>
                <span>Torneos abiertos</span>
              </div>

              <div className="resumen-inicio__dato">
                <strong>{destacados.length}</strong>
                <span>Eventos activos</span>
              </div>

              <div className="resumen-inicio__dato">
                <strong>{juegos.length}</strong>
                <span>Juegos habilitados</span>
              </div>

              <div className="resumen-inicio__dato">
                <strong>{participantes}</strong>
                <span>Participantes registrados</span>
              </div>
            </div>
          </div>

          <aside className="agenda-inicio" aria-labelledby="titulo-agenda">
            <h2 id="titulo-agenda">Próximos cierres</h2>

            {abiertos.length === 0 ? (
              <p>No hay torneos abiertos por ahora.</p>
            ) : (
              <div className="agenda-inicio__lista">
                {abiertos.slice(0, 3).map((torneo) => (
                  <article key={torneo.id} className="agenda-inicio__item">
                    <Link to={`/torneo-detalle.html?id=${torneo.id}`}>
                      {torneo.nombre}
                    </Link>

                    <strong>
                      {formatearFecha(torneo.fechaCierreInscripcion)}
                    </strong>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="seccion" aria-labelledby="titulo-destacados">
        <div className="contenedor">
          <div className="titulo-seccion">
            <h2 id="titulo-destacados">Torneos destacados</h2>
            <Link to="/torneos.html">Ver todos los torneos →</Link>
          </div>

          {destacados.length === 0 ? (
            <p className="estado-vacio">
              No hay torneos destacados en este momento.
            </p>
          ) : (
            <div className="row g-4">
              {destacados.map((torneo) => (
                <div key={torneo.id} className="col-12 col-md-6 col-xl-4">
                  <TarjetaTorneo
                    torneo={torneo}
                    juego={juegoPorId(torneo.juegoId)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className="seccion seccion-franja"
        aria-labelledby="titulo-cierres"
      >
        <div className="contenedor">
          <div className="titulo-seccion">
            <h2 id="titulo-cierres">Próximos cierres de inscripción</h2>
          </div>

          {
            <div className="tabla-responsive">
              <table>
                <caption>
                  Torneos abiertos ordenados por fecha de cierre
                </caption>

                <thead>
                  <tr>
                    <th scope="col">Torneo</th>
                    <th scope="col">Juego</th>
                    <th scope="col">Cierre</th>
                    <th scope="col">Cupos</th>
                    <th scope="col">Inscripción</th>
                  </tr>
                </thead>

                <tbody>
                  {abiertos.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        No hay cierres de inscripción próximos.
                      </td>
                    </tr>
                  ) : (
                    abiertos.map((torneo) => (
                      <tr key={torneo.id}>
                        <td>{torneo.nombre}</td>

                        <td>{juegoPorId(torneo.juegoId)?.nombre || "—"}</td>

                        <td>{formatearFecha(torneo.fechaCierreInscripcion)}</td>

                        <td>
                          {torneo.participantesInscritos?.length || 0}
                          {" / "}
                          {torneo.cupoMaximo}
                        </td>

                        <td>
                          <Link
                            to={`/inscripcion.html?torneo=${torneo.id}`}
                            className="boton boton-primario boton-pequeno"
                          >
                            Inscribirme
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          }
        </div>
      </section>

      <section className="seccion" aria-labelledby="titulo-video">
        <div className="contenedor">
          <div className="titulo-seccion">
            <h2 id="titulo-video">Revive la última gran final</h2>
          </div>

          <div className="video-envoltorio">
            <iframe
              src="https://www.youtube-nocookie.com/embed/bqMIWavuksE"
              title="Final del torneo de Minecraft"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default Inicio;
