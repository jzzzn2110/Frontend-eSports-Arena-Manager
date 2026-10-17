import { useState, useEffect } from 'react';

function Inscripcion({ datos, torneoIdUrl, onInscribir }) {
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
  
  // Estados para manejo de exito, errores y mensajes personalizados
  const [enviadoExito, setEnviadoExito] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [erroresCampos, setErroresCampos] = useState({
    torneo: '',
    participante: '',
    confirmacion: ''
  });

  // Sigue el torneo recibido desde la URL por App.
  useEffect(() => {
    setTorneoIdSeleccionado(torneoIdUrl || '');
  }, [torneoIdUrl]);

  useEffect(() => {
    const torneo = TORNEOS.find((item) => item.id === torneoIdSeleccionado) || null;
    const juego = JUEGOS.find((item) => item.id === torneo?.juegoId);
    setTorneoActual(torneo);
    setTipoParticipante(juego?.integrantesPorEquipo === 1 ? 'individual' : 'equipo');
  }, [torneoIdSeleccionado, TORNEOS, JUEGOS]);

  function cambiarTorneo(id) {
    setTorneoIdSeleccionado(id);
    setEquipoId('');
    setJugadorId('');
    setConfirmacion(false);
    setErroresCampos({});
    setErrorGeneral('');
    setEnviadoExito(false);
  }

  const torneosAbiertos = TORNEOS.filter(t => String(t.estado).toLowerCase() === 'abierto');

  // Logica de validacion del formulario controlado
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorGeneral('');
    setErroresCampos({});
    const nuevosErrores = { torneo: '', participante: '', confirmacion: '' };
    let hayErrores = false;

    // Validar selección de torneo y estado abierto
    if (!torneoActual) {
      setErroresCampos({ torneo: 'Debes seleccionar un torneo válido.' });
      return;
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

    const juego = JUEGOS.find((item) => item.id === torneoActual.juegoId);
    const esIndividual = juego?.integrantesPorEquipo === 1;
    const participanteId = tipoParticipante === 'equipo' ? equipoId : jugadorId;

    // Comprueba modalidad, juego, equipo activo y sanciones.
    if (!juego) {
      setErrorGeneral('El juego del torneo no está disponible.');
      return;
    }
    if ((esIndividual && tipoParticipante !== 'individual') || (!esIndividual && tipoParticipante !== 'equipo')) {
      nuevosErrores.participante = 'El tipo de participante no corresponde a este torneo.';
      hayErrores = true;
    } else if (tipoParticipante === 'equipo') {
      const equipo = EQUIPOS.find((item) => item.id === equipoId);
      if (!equipo) {
        nuevosErrores.participante = 'Debes seleccionar un equipo válido.';
      } else if (equipo.juegoId !== torneoActual.juegoId) {
        nuevosErrores.participante = 'El equipo pertenece a otro juego.';
      } else if (equipo.activo === false) {
        nuevosErrores.participante = 'El equipo seleccionado está inactivo.';
      } else if (equipoTieneSancionActiva(equipo)) {
        nuevosErrores.participante = 'El equipo tiene integrantes con sanciones vigentes.';
      } else if (!equipoCompleto(equipo, juego)) {
        nuevosErrores.participante = `El equipo necesita al menos ${juego.integrantesPorEquipo} integrantes.`;
      }
    } else {
      const jugador = JUGADORES.find((item) => item.id === jugadorId);
      if (!jugador) {
        nuevosErrores.participante = 'Debes seleccionar un jugador válido.';
      } else if (tieneSancionActiva(jugador)) {
        nuevosErrores.participante = 'El jugador tiene una sanción vigente.';
      }
    }

    if (participanteId && participanteYaInscrito(torneoActual, participanteId)) {
      nuevosErrores.participante = 'Este participante ya está inscrito en el torneo.';
    }
    if (nuevosErrores.participante) hayErrores = true;

    // Validar confirmación de datos obligatorios
    if (!confirmacion) {
      nuevosErrores.confirmacion = 'Debes confirmar los datos para continuar.';
      hayErrores = true;
    }

    setErroresCampos(nuevosErrores);

    if (!hayErrores) {
      try {
        // App registra la inscripción y actualiza los datos compartidos.
        onInscribir(torneoActual.id, participanteId);
        setEnviadoExito(true);
      } catch (error) {
        setErrorGeneral(error.message || 'No se pudo registrar la inscripción.');
      }
    }
  };

  const juegoTorneo = torneoActual ? JUEGOS.find(j => String(j.id) === String(torneoActual.juegoId)) : null;

  return (
    <div className="contenedor seccion">
      <h1>Inscripción a torneo</h1>

      {/* Aviso de Éxito */}
      {enviadoExito && (
        <div className="aviso aviso--exito" id="exito-inscripcion" role="alert">
          ¡Inscripción realizada con éxito! Queda guardada en memoria y se pierde al recargar la página.
        </div>
      )}

      {/* Aviso de Error General */}
      {errorGeneral && (
        <div className="aviso aviso--error" id="aviso-error-general" role="alert">
          {errorGeneral}
        </div>
      )}

      {!enviadoExito && (
        <form onSubmit={handleSubmit} id="formulario-inscripcion" className="formulario" noValidate>
          
          {/* Selector de Torneo (si no viene por URL o hay múltiples) */}
          <div className="campo" id="fieldset-selector-torneo">
            <label htmlFor="selector-torneo">Seleccionar Torneo Abierto</label>
            <select
              id="selector-torneo"
              
              value={torneoIdSeleccionado}
              onChange={(e) => cambiarTorneo(e.target.value)}
            >
              <option value="">-- Elige un torneo --</option>
              {torneoActual && torneoActual.estado !== 'abierto' && (
                <option value={torneoActual.id}>{torneoActual.nombre} — Inscripción cerrada</option>
              )}
              {torneosAbiertos.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nombre} - Cierre: {formatearFecha ? formatearFecha(t.fechaCierreInscripcion) : t.fechaCierreInscripcion}
                </option>
              ))}
            </select>
            {erroresCampos.torneo && <div className="mensaje-error" role="alert" id="error-selector-torneo">{erroresCampos.torneo}</div>}
          </div>

          {/* Información del Torneo Seleccionado */}
          {torneoActual && (
            <div id="info-torneo" className="tarjeta mb-3">
              <h5 id="torneo-nombre">{torneoActual.nombre}</h5>
              <p className="tarjeta__meta" id="torneo-juego-modalidad">
                {juegoTorneo ? `${juegoTorneo.nombre} • ${juegoTorneo.modalidad}` : 'Juego del torneo'}
              </p>
              <p className="mb-1"><strong>Estado:</strong> <span id="torneo-estado" className="chip">{torneoActual.estado.toUpperCase()}</span></p>
              <p className="mb-1"><strong>Cierre de inscripción:</strong> <span id="torneo-cierre">{formatearFecha ? formatearFecha(torneoActual.fechaCierreInscripcion) : torneoActual.fechaCierreInscripcion}</span></p>
              <p className="mb-0"><strong>Cupos disponibles:</strong> <span id="torneo-cupos">{cuposDisponibles ? cuposDisponibles(torneoActual) : 0} disponibles</span></p>
            </div>
          )}

          {/* Selección de Tipo de Participante (Equipo / Individual) */}
          <div className="mb-3">
            <label className="form-label d-block">Tipo de Participante</label>
            <div className="mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="tipo-participante"
                id="tipo-equipo"
                value="equipo"
                checked={tipoParticipante === 'equipo'}
                disabled={!juegoTorneo || juegoTorneo.integrantesPorEquipo === 1}
                onChange={(e) => setTipoParticipante(e.target.value)}
              />
              <label className="form-check-label" htmlFor="tipo-equipo">Equipo</label>
            </div>
            <div className="mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="tipo-participante"
                id="tipo-individual"
                value="individual"
                checked={tipoParticipante === 'individual'}
                disabled={!juegoTorneo || juegoTorneo.integrantesPorEquipo !== 1}
                onChange={(e) => setTipoParticipante(e.target.value)}
              />
              <label className="form-check-label" htmlFor="tipo-individual">Individual</label>
            </div>
          </div>

          {/* Contenedor para Equipos */}
          {tipoParticipante === 'equipo' && (
            <div className="campo" id="contenedor-equipo">
              <label htmlFor="equipo-selector">Seleccionar Tu Equipo</label>
              <select
                id="equipo-selector"
                
                value={equipoId}
                onChange={(e) => setEquipoId(e.target.value)}
              >
                <option value="">-- Elige un equipo --</option>
                {EQUIPOS.filter(eq => eq.juegoId === torneoActual?.juegoId).map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                ))}
              </select>
              {erroresCampos.participante && <div className="mensaje-error" role="alert" id="error-equipo">{erroresCampos.participante}</div>}
            </div>
          )}

          {/* Contenedor Individual */}
          {tipoParticipante === 'individual' && (
            <div className="campo" id="contenedor-individual">
              <label htmlFor="participante-individual">Seleccionar Perfil de Jugador</label>
              <select
                id="participante-individual"
                
                value={jugadorId}
                onChange={(e) => setJugadorId(e.target.value)}
              >
                <option value="">-- Elige tu perfil --</option>
                {JUGADORES.map(jug => (
                  <option key={jug.id} value={jug.id}>{jug.apodo || jug.nombre}</option>
                ))}
              </select>
              {erroresCampos.participante && <div className="mensaje-error" role="alert" id="error-individual">{erroresCampos.participante}</div>}
            </div>
          )}

          {/* Checkbox de Confirmación */}
          <div className="mb-3">
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
            {erroresCampos.confirmacion && <div className="mensaje-error" role="alert" id="error-confirmacion">{erroresCampos.confirmacion}</div>}
          </div>

          <button type="submit" className="boton boton-primario">Completar Inscripción</button>
        </form>
      )}
    </div>
  );
}

export default Inscripcion;
