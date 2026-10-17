import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useArena } from "../context/ArenaContext.jsx";
import TarjetaTorneo from "../components/TarjetaTorneo.jsx";
export default function Torneos() {
  const { datos } = useArena();
  const [params] = useSearchParams();
  const [filtros, setFiltros] = useState({
    texto: "",
    juego: "",
    estado: params.get("estado") || "",
    desde: "",
    hasta: "",
  });
  const cambiar = (e) =>
    setFiltros((f) => ({ ...f, [e.target.name]: e.target.value }));
  const error = filtros.desde && filtros.hasta && filtros.desde > filtros.hasta;
  const torneos = error
    ? []
    : datos.TORNEOS.filter(
        (t) =>
          t.nombre
            .toLocaleLowerCase()
            .includes(filtros.texto.trim().toLocaleLowerCase()) &&
          (!filtros.juego || t.juegoId === filtros.juego) &&
          (!filtros.estado || t.estado === filtros.estado) &&
          (!filtros.desde || t.fechaInicio >= filtros.desde) &&
          (!filtros.hasta || t.fechaInicio <= filtros.hasta),
      );
  return (
    <main className="container py-4">
      <h1>Torneos</h1>
      <p>Encuentra tu próxima competencia y revisa los cupos disponibles.</p>
      <form
        className="card p-3 mb-4"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filtros de torneos"
      >
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="busqueda">
              Buscar por nombre
            </label>
            <input
              id="busqueda"
              className="form-control"
              name="texto"
              value={filtros.texto}
              onChange={cambiar}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="juego">
              Juego
            </label>
            <select
              id="juego"
              className="form-select"
              name="juego"
              value={filtros.juego}
              onChange={cambiar}
            >
              <option value="">Todos</option>
              {datos.JUEGOS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="estado">
              Estado
            </label>
            <select
              id="estado"
              className="form-select"
              name="estado"
              value={filtros.estado}
              onChange={cambiar}
            >
              <option value="">Todos</option>
              <option value="abierto">Abierto</option>
              <option value="en-curso">En curso</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="desde">
              Inicio desde
            </label>
            <input
              id="desde"
              className="form-control"
              type="date"
              name="desde"
              value={filtros.desde}
              onChange={cambiar}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="hasta">
              Inicio hasta
            </label>
            <input
              id="hasta"
              className="form-control"
              type="date"
              name="hasta"
              value={filtros.hasta}
              onChange={cambiar}
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button
              className="btn btn-outline-light"
              type="button"
              onClick={() =>
                setFiltros({
                  texto: "",
                  juego: "",
                  estado: "",
                  desde: "",
                  hasta: "",
                })
              }
            >
              Limpiar filtros
            </button>
          </div>
        </div>
        {error && (
          <p className="alert alert-danger mt-3 mb-0" role="alert">
            La fecha inicial no puede ser posterior a la final.
          </p>
        )}
      </form>
      <p role="status">
        {torneos.length}{" "}
        {torneos.length === 1 ? "torneo encontrado" : "torneos encontrados"}
      </p>
      {!error && !torneos.length && (
        <p className="alert alert-info">
          No hay torneos que coincidan con los filtros.
        </p>
      )}
      <div className="row g-4">
        {torneos.map((t) => (
          <div className="col-md-6 col-xl-4" key={t.id}>
            <TarjetaTorneo
              torneo={t}
              juego={datos.JUEGOS.find((j) => j.id === t.juegoId)}
              mostrarInscripcion
            />
          </div>
        ))}
      </div>
    </main>
  );
}
