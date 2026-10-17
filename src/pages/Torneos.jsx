import { useState } from 'react';
import TarjetaTorneo from '../components/TarjetaTorneo.jsx';

function Torneos({ juegos, torneos }) {
  
  const [busqueda, setBusqueda] = useState('');
  const [juegoSeleccionado, setJuegoSeleccionado] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  // Calcula el aviso sin cambiar el estado durante el render.
  const errorRango = fechaDesde && fechaHasta && fechaDesde > fechaHasta
    ? "La fecha 'Inicio desde' no puede ser posterior a 'Inicio hasta'."
    : '';

  const aplicarFiltros = () => {
    if (errorRango) return [];

    return torneos.filter((torneo) => {
      const coincideTexto = !busqueda || torneo.nombre.toLowerCase().includes(busqueda.trim().toLowerCase());
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
  };

  const obtenerJuego = (juegoId) => juegos.find((j) => j.id === juegoId) || null;

  return (
    <div className="contenedor seccion">
      <h1>Listado de torneos</h1>
      
      {/* Formulario de filtros */}
      <div className="panel-filtros">
        <form onSubmit={(e) => e.preventDefault()} id="formulario-filtros">
          <div className="row g-3">
            <div className="col-12 col-md-3 campo">
              <label htmlFor="filtro-busqueda">Buscar</label>
              <input
                type="text"
                id="filtro-busqueda"
                placeholder="Nombre de torneo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-3 campo">
              <label htmlFor="filtro-juego">Juego</label>
              <select
                id="filtro-juego"
                value={juegoSeleccionado}
                onChange={(e) => setJuegoSeleccionado(e.target.value)}
              >
                <option value="">Todos los juegos</option>
                {juegos.map((j) => (
                  <option key={j.id} value={j.id}>{j.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2 campo">
              <label htmlFor="filtro-estado">Estado</label>
              <select
                id="filtro-estado"
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="abierto">Abierto</option>
                <option value="en-curso">En curso</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <div className="col-12 col-md-2 campo">
              <label htmlFor="filtro-fecha-desde">Desde</label>
              <input
                type="date"
                id="filtro-fecha-desde"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-2 campo">
              <label htmlFor="filtro-fecha-hasta">Hasta</label>
              <input
                type="date"
                id="filtro-fecha-hasta"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
          </div>

          {errorRango && <div className="mensaje-error" role="alert" id="error-rango-fechas">{errorRango}</div>}

          <div className="mt-3">
            <button type="button" id="boton-limpiar-filtros" className="boton boton-secundario boton-pequeno" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        </form>
      </div>

      {/* Resultados */}
      <div id="contador-resultados" className="mb-3" role="status">
        {torneosFiltrados.length === 1 ? "1 torneo encontrado" : `${torneosFiltrados.length} torneos encontrados`}
      </div>

      {torneosFiltrados.length === 0 ? (
        <p className="estado-vacio">
          Ningún torneo cumple con los filtros seleccionados. Prueba ajustando el juego, el estado o el rango de fechas.
        </p>
      ) : (
        <div className="row g-4" id="lista-torneos">
          {torneosFiltrados.map((torneo) => (
            <div className="col-12 col-md-6 col-xl-4" key={torneo.id}>
              {/* Reutiliza la misma tarjeta que Inicio. */}
              <TarjetaTorneo
                torneo={torneo}
                juego={obtenerJuego(torneo.juegoId)}
                mostrarInscripcion
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Torneos;