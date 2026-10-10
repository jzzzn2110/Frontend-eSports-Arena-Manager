import { Link } from 'react-router-dom';
import {
  claseInsigniaTorneo,
  formatearFecha,
  nombreEstado,
} from '../utils/logica.js';

// Recibe el torneo y su juego mediante props.
function TarjetaTorneo({ torneo, juego, mostrarInscripcion = false }) {
  if (!torneo) return null;

  // Calcula la ocupación a partir de los participantes inscritos.
  const cuposOcupados = torneo.participantesInscritos?.length || 0;
  const porcentajeCupos = torneo.cupoMaximo > 0
    ? Math.min(100, Math.round((cuposOcupados / torneo.cupoMaximo) * 100))
    : 0;

  return (
    <article className="tarjeta tarjeta-torneo">
      <div className="tarjeta-torneo__header">
        <div className="tarjeta-torneo__identidad">
          <div className="tarjeta-torneo__icono">
            {juego?.icono && (
              <img
                src={juego.icono}
                alt={juego.nombre}
                className="icono-juego"
              />
            )}
          </div>

          <div className="tarjeta-torneo__texto">
            <h3>{torneo.nombre}</h3>
            <p className="tarjeta__meta">
              {juego
                ? `${juego.nombre} · ${juego.modalidad}`
                : 'Juego no disponible'}
            </p>
          </div>
        </div>

        <span className={`insignia ${claseInsigniaTorneo(torneo.estado)}`}>
          {nombreEstado(torneo.estado)}
        </span>
      </div>

      <div className="tarjeta-torneo__grid">
        <div className="tarjeta-torneo__dato">
          <span>Cierre de inscripción</span>
          <strong>{formatearFecha(torneo.fechaCierreInscripcion)}</strong>
        </div>

        <div className="tarjeta-torneo__dato">
          <span>Cupos ocupados</span>
          <strong>{cuposOcupados} / {torneo.cupoMaximo}</strong>
        </div>
      </div>

      <div className="tarjeta-torneo__ocupacion">
        <div
          className="tarjeta-torneo__ocupacion-barra"
          role="progressbar"
          aria-label="Ocupación del torneo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={porcentajeCupos}
        >
          <span style={{ width: `${porcentajeCupos}%` }} />
        </div>

        <p className="tarjeta__meta">
          {porcentajeCupos}% de cupos ocupados
        </p>
      </div>

      <div className="tarjeta__pie">
        <Link
          to={`/torneo-detalle.html?id=${torneo.id}`}
          className="boton boton-secundario boton-pequeno"
        >
          Ver detalle
        </Link>

        {mostrarInscripcion && torneo.estado === 'abierto' && (
          <Link
            to={`/inscripcion.html?torneo=${torneo.id}`}
            className="boton boton-primario boton-pequeno"
          >
            Inscribirme
          </Link>
        )}
      </div>
    </article>
  );
}

export default TarjetaTorneo;