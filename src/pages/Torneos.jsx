import React, { useState } from 'react';

function Torneos({ juegos, torneos }) {
  
  const [busqueda, setBusqueda] = useState('');
  const [juegoSeleccionado, setJuegoSeleccionado] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [errorRango, setErrorRango] = useState('');

  const aplicarFiltros = () => {
    // Validar rango de fechas inválido
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setErrorRango("La fecha 'Inicio desde' no puede ser posterior a 'Inicio hasta'.");
      return [];
    }
    setErrorRango('');

    return torneos.filter((torneo) => {
      const coincideTexto = !busqueda || torneo.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideJuego = !juegoSeleccionado || torneo.juegoId === juegoSeleccionado;
      const coincideEstado = !estadoSeleccionado || torneo.estado === estadoSeleccionado;
      const coincideDesde = !fechaDesde || torneo.fechaInicio >= fechaDesde;
      const coincideHasta = !fechaHasta || torneo.fechaInicio <= fechaHasta;
      return coincideTexto && coincideJuego && coincideEstado && coincideDesde && coincideHasta;
    });
  };

  const torneosFiltrados = aplicarFiltros();

  const limpiarFiltros = () => {
    setBusqueda('');
    setJuegoSeleccionado('');
    setEstadoSeleccionado('');
    setFechaDesde('');
    setFechaHasta('');
    setErrorRango('');
  };

  const obtenerJuego = (juegoId) => juegos.find((j) => j.id === juegoId) || null;

  const nombreEstado = (estado) => {
    const mapa = { abierto: "Abierto", "en-curso": "En curso", finalizado: "Finalizado" };
    return mapa[estado] || estado;
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="container my-4">
      <h2>Listado de Torneos</h2>
      
      {/* Formulario de filtros */}
      <div className="card p-3 mb-4 bg-dark text-light">
        <form onSubmit={(e) => e.preventDefault()} id="formulario-filtros">
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="filtro-busqueda" className="form-label">Buscar</label>
              <input
                type="text"
                id="filtro-busqueda"
                className="form-control"
                placeholder="Nombre de torneo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="filtro-juego" className="form-label">Juego</label>
              <select
                id="filtro-juego"
                className="form-select"
                value={juegoSeleccionado}
                onChange={(e) => setJuegoSeleccionado(e.target.value)}
              >
                <option value="">Todos los juegos</option>
                {juegos.map((j) => (
                  <option key={j.id} value={j.id}>{j.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label htmlFor="filtro-estado" className="form-label">Estado</label>
              <select
                id="filtro-estado"
                className="form-select"
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="abierto">Abierto</option>
                <option value="en-curso">En curso</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <div className="col-md-2">
              <label htmlFor="filtro-fecha-desde" className="form-label">Desde</label>
              <input
                type="date"
                id="filtro-fecha-desde"
                className="form-control"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="filtro-fecha-hasta" className="form-label">Hasta</label>
              <input
                type="date"
                id="filtro-fecha-hasta"
                className="form-control"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
          </div>

          {errorRango && <div className="text-danger mt-2" id="error-rango-fechas">{errorRango}</div>}

          <div className="mt-3">
            <button type="button" id="boton-limpiar-filtros" className="btn btn-secondary btn-sm" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        </form>
      </div>

      {/* Resultados */}
      <div id="contador-resultados" className="mb-3 text-muted">
        {torneosFiltrados.length === 1 ? "1 torneo encontrado" : `${torneosFiltrados.length} torneos encontrados`}
      </div>

      {torneosFiltrados.length === 0 ? (
        <p className="estado-vacio alert alert-warning">
          Ningún torneo cumple con los filtros seleccionados. Prueba ajustando el juego, el estado o el rango de fechas.
        </p>
      ) : (
        <div className="row" id="lista-torneos">
          {torneosFiltrados.map((torneo) => {
            const juego = obtenerJuego(torneo.juegoId);
            const cupoOcupado = torneo.participantesInscritos.length;
            const claseInsignia =
              torneo.estado === "abierto" ? "bg-success" : torneo.estado === "en-curso" ? "bg-warning text-dark" : "bg-secondary";

            return (
              <div className="col-md-4 mb-3" key={torneo.id}>
                <div className="card h-100 p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{torneo.nombre}</h5>
                    <span className={`badge ${claseInsignia}`}>{nombreEstado(torneo.estado)}</span>
                  </div>
                  <p className="card-text text-muted small">
                    {juego ? `${juego.nombre} · ${juego.modalidad}` : "Juego no disponible"}
                  </p>
                  <p className="card-text mb-1"><strong>Cupos:</strong> {cupoOcupado} / {torneo.cupoMaximo}</p>
                  <p className="card-text mb-3"><strong>Cierre:</strong> {formatearFecha(torneo.fechaCierreInscripcion)}</p>
                  <div className="mt-auto d-flex gap-2">
                    <a href={`/torneo-detalle.html?id=${torneo.id}`} className="btn btn-outline-primary btn-sm">Ver detalle</a>
                    {torneo.estado === "abierto" && (
                      <a href={`/inscripcion.html?torneo=${torneo.id}`} className="btn btn-primary btn-sm">Inscribirme</a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Torneos;