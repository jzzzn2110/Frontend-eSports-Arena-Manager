import React, { useState, useEffect } from 'react';

function Inscripcion({ datos, torneoIdUrl }) {
  const {
    TORNEOS = [],
    JUEGOS = [],
    EQUIPOS = [],
    JUGADORES = [],
    formatearFecha,
    cuposDisponibles,
    inscripcionFueraDePlazo,
    tieneSancionActiva,
    equipoTieneSancionActiva,
    equipoCompleto,
    participanteYaInscrito
  } = datos;

  // Estados del formulario y selecciones
  const [torneoIdSeleccionado, setTorneoIdSeleccionado] = useState(torneoIdUrl || '');
  const [torneoActual, setTorneoActual] = useState(null);
  const [tipoParticipante, setTipoParticipante] = useState('equipo');
  const [equipoId, setEquipoId] = useState('');
  const [jugadorId, setJugadorId] = useState('');
  const [confirmacion, setConfirmacion] = useState(false);
  
  // Estados para manejo de éxito, errores y mensajes personalizados
  const [enviadoExito, setEnviadoExito] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [erroresCampos, setErroresCampos] = useState({
    torneo: '',
    participante: '',
    confirmacion: ''
  });

  // useeffect pa sincronizar el torneo actual al cambiar la selección o la URL
  useEffect(() => {
    if (torneoIdSeleccionado) {
      const t = TORNEOS.find(tr => String(tr.id) === String(torneoIdSeleccionado));
      setTorneoActual(t || null);
    } else {
      setTorneoActual(null);
    }
  }, [torneoIdSeleccionado, TORNEOS]);

  const torneosAbiertos = TORNEOS.filter(t => String(t.estado).toLowerCase() === 'abierto');

  // Lógica de validación del formulario controlado
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorGeneral('');
    const nuevosErrores = { torneo: '', participante: '', confirmacion: '' };
    let hayErrores = false;

    // Validar selección de torneo y estado abierto
    if (!torneoActual) {
      nuevosErrores.torneo = 'Debes seleccionar un torneo válido.';
      hayErrores = true;
    } else {
      if (String(torneoActual.estado).toLowerCase() !== 'abierto') {
        setErrorGeneral('Las inscripciones para este torneo ya están cerradas.');
        return;
      }
      // Validar plazo de inscripción
      if (inscripcionFueraDePlazo(torneoActual)) {
        setErrorGeneral('El plazo de inscripción para este torneo ya ha finalizado.');
        return;
      }
      // Validar cupos disponibles
      if (cuposDisponibles(torneoActual) <= 0) {
        setErrorGeneral('Lo sentimos, el torneo ya no cuenta con cupos disponibles.');
        return;
      }
    }

    // Validar selección de participante y reglas del dominio (sanciones, duplicados, equipos)
    if (tipoParticipante === 'equipo') {
      if (!equipoId) {
        nuevosErrores.participante = 'Debes seleccionar un equipo.';
        hayErrores = true;
      } else {
        const eq = EQUIPOS.find(e => String(e.id) === String(equipoId));
        const juego = JUEGOS.find(j => String(j.id) === String(torneoActual?.juegoId));

        if (eq && participanteYaInscrito(torneoActual, eq.id)) {
          nuevosErrores.participante = 'Este equipo ya se encuentra inscrito en el torneo.';
          hayErrores = true;
        } else if (eq && equipoTieneSancionActiva(eq)) {
          nuevosErrores.participante = 'El equipo cuenta con integrantes que poseen sanciones vigentes.';
          hayErrores = true;
        } else if (eq && juego && !equipoCompleto(eq, juego)) {
          nuevosErrores.participante = `El equipo no cumple con la cantidad mínima de integrantes exigida (${juego.integrantesPorEquipo}).`;
          hayErrores = true;
        }
      }
    } else {
      if (!jugadorId) {
        nuevosErrores.participante = 'Debes seleccionar tu perfil de jugador.';
        hayErrores = true;
      } else {
        const jug = JUGADORES.find(j => String(j.id) === String(jugadorId));

        if (jug && participanteYaInscrito(torneoActual, jug.id)) {
          nuevosErrores.participante = 'Este jugador ya se encuentra inscrito en el torneo.';
          hayErrores = true;
        } else if (jug && tieneSancionActiva(jug)) {
          nuevosErrores.participante = 'Tienes una sanción vigente que impide tu inscripción.';
          hayErrores = true;
        }
      }
    }

    // Validar confirmación de datos obligatorios
    if (!confirmacion) {
      nuevosErrores.confirmacion = 'Debes confirmar los datos para continuar.';
      hayErrores = true;
    }

    setErroresCampos(nuevosErrores);

    if (!hayErrores) {
      setEnviadoExito(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const juegoTorneo = torneoActual ? JUEGOS.find(j => String(j.id) === String(torneoActual.juegoId)) : null;

  return (
    <div className="container my-4">
      <h2>Inscripción a Torneo</h2>

      {/* Aviso de Éxito */}
      {enviadoExito && (
        <div className="alert alert-success" id="exito-inscripcion" role="alert">
          ¡Inscripción realizada con éxito! Tu participación ha sido registrada correctamente.
        </div>
      )}

      {/* Aviso de Error General */}
      {errorGeneral && (
        <div className="alert alert-danger" id="aviso-error-general" role="alert">
          {errorGeneral}
        </div>
      )}

      {!enviadoExito && (
        <form onSubmit={handleSubmit} id="formulario-inscripcion" className="card p-4 shadow-sm bg-dark text-light">
          
          {/* Selector de Torneo (si no viene por URL o hay múltiples) */}
          <div className="mb-3" id="fieldset-selector-torneo">
            <label htmlFor="selector-torneo" className="form-label">Seleccionar Torneo Abierto</label>
            <select
              id="selector-torneo"
              className="form-select"
              value={torneoIdSeleccionado}
              onChange={(e) => setTorneoIdSeleccionado(e.target.value)}
            >
              <option value="">-- Elige un torneo --</option>
              {torneosAbiertos.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nombre} - Cierre: {formatearFecha ? formatearFecha(t.fechaCierreInscripcion) : t.fechaCierreInscripcion}
                </option>
              ))}
            </select>
            {erroresCampos.torneo && <div className="text-danger small mt-1 mensaje-error" id="error-selector-torneo">{erroresCampos.torneo}</div>}
          </div>

          {/* Información del Torneo Seleccionado */}
          {torneoActual && (
            <div id="info-torneo" className="card p-3 mb-3 bg-secondary text-light">
              <h5 id="torneo-nombre">{torneoActual.nombre}</h5>
              <p className="mb-1 text-info" id="torneo-juego-modalidad">
                {juegoTorneo ? `${juegoTorneo.nombre} • ${juegoTorneo.modalidad}` : 'Juego del torneo'}
              </p>
              <p className="mb-1"><strong>Estado:</strong> <span id="torneo-estado" className="badge bg-success">{torneoActual.estado.toUpperCase()}</span></p>
              <p className="mb-1"><strong>Cierre de inscripción:</strong> <span id="torneo-cierre">{formatearFecha ? formatearFecha(torneoActual.fechaCierreInscripcion) : torneoActual.fechaCierreInscripcion}</span></p>
              <p className="mb-0"><strong>Cupos disponibles:</strong> <span id="torneo-cupos">{cuposDisponibles ? cuposDisponibles(torneoActual) : 0} disponibles</span></p>
            </div>
          )}

          {/* Selección de Tipo de Participante (Equipo / Individual) */}
          <div className="mb-3">
            <label className="form-label d-block">Tipo de Participante</label>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="tipo-participante"
                id="tipo-equipo"
                value="equipo"
                checked={tipoParticipante === 'equipo'}
                onChange={(e) => setTipoParticipante(e.target.value)}
              />
              <label className="form-check-label" htmlFor="tipo-equipo">Equipo</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="tipo-participante"
                id="tipo-individual"
                value="individual"
                checked={tipoParticipante === 'individual'}
                onChange={(e) => setTipoParticipante(e.target.value)}
              />
              <label className="form-check-label" htmlFor="tipo-individual">Individual</label>
            </div>
          </div>

          {/* Contenedor para Equipos */}
          {tipoParticipante === 'equipo' && (
            <div className="mb-3" id="contenedor-equipo">
              <label htmlFor="equipo-selector" className="form-label">Seleccionar Tu Equipo</label>
              <select
                id="equipo-selector"
                className="form-select"
                value={equipoId}
                onChange={(e) => setEquipoId(e.target.value)}
              >
                <option value="">-- Elige un equipo --</option>
                {EQUIPOS.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                ))}
              </select>
              {erroresCampos.participante && <div className="text-danger small mt-1 mensaje-error" id="error-equipo">{erroresCampos.participante}</div>}
            </div>
          )}

          {/* Contenedor Individual */}
          {tipoParticipante === 'individual' && (
            <div className="mb-3 oculto" id="contenedor-individual">
              <label htmlFor="participante-individual" className="form-label">Seleccionar Perfil de Jugador</label>
              <select
                id="participante-individual"
                className="form-select"
                value={jugadorId}
                onChange={(e) => setJugadorId(e.target.value)}
              >
                <option value="">-- Elige tu perfil --</option>
                {JUGADORES.map(jug => (
                  <option key={jug.id} value={jug.id}>{jug.apodo || jug.nombre}</option>
                ))}
              </select>
              {erroresCampos.participante && <div className="text-danger small mt-1 mensaje-error" id="error-individual">{erroresCampos.participante}</div>}
            </div>
          )}

          {/* Checkbox de Confirmación */}
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="confirmacion-datos"
              checked={confirmacion}
              onChange={(e) => setConfirmacion(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="confirmacion-datos">
              Confirmo que los datos ingresados son correctos y cumplo con los requisitos.
            </label>
            {erroresCampos.confirmacion && <div className="text-danger small mt-1 mensaje-error" id="error-confirmacion">{erroresCampos.confirmacion}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100">Completar Inscripción</button>
        </form>
      )}
    </div>
  );
}

export default Inscripcion;
