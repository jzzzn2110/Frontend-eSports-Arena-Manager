import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCatalogo } from "../context/useCatalogo.js";
import { normalizarEstadoTorneo } from "../services/adapters.js";
import EstadoCatalogo from "../components/EstadoCatalogo.jsx";
import TarjetaTorneo from "../components/TarjetaTorneo.jsx";
import { nombreEstado } from "../utils/logica.js";

const filtrosIniciales = { texto: "", juego: "", desde: "", hasta: "" };
const estadosDemo = ["abierto", "en-curso", "finalizado"];
const estadosApi = ["borrador", "abierto", "cerrado", "en-curso", "finalizado", "cancelado"];

export default function Torneos() {
  const catalogo = useCatalogo();
  const [params, setParams] = useSearchParams();
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const cambiar = (e) =>
    setFiltros((f) => ({ ...f, [e.target.name]: e.target.value }));
  if (catalogo.estado !== "listo") {
    return (
      <main className="container py-4">
        <h1>Torneos</h1>
        <EstadoCatalogo {...catalogo} />
      </main>
    );
  }
  const { juegos, desdeApi } = catalogo;
  const estados = desdeApi ? estadosApi : estadosDemo;
  const estadoUrl = normalizarEstadoTorneo(params.get("estado") ?? "");
  const estado = estados.includes(estadoUrl) ? estadoUrl : "";
  const cambiarEstado = (valor) => {
    const siguiente = new URLSearchParams(params);
    if (valor) siguiente.set("estado", valor);
    else siguiente.delete("estado");
    setParams(siguiente, { replace: true });
  };

  const nombreBuscado = filtros.texto.trim().toLocaleLowerCase();
  const error = filtros.desde && filtros.hasta && filtros.desde > filtros.hasta;
  const torneos = error
    ? []
    : catalogo.torneos.filter((t) => {
        const fechaInicio = t.fechaInicio?.slice(0, 10);
        return (
          t.nombre.toLocaleLowerCase().includes(nombreBuscado) &&
          (!filtros.juego || t.juegoId === filtros.juego) &&
          (!estado || t.estado === estado) &&
          (!filtros.desde || (fechaInicio && fechaInicio >= filtros.desde)) &&
          (!filtros.hasta || (fechaInicio && fechaInicio <= filtros.hasta))
        );
      });
  return (
    <main className="container py-4">
      <h1>Torneos</h1>
      <p>Encuentra tu próxima competencia y revisa sus fechas y cupos.</p>
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
              {juegos.map((j) => (
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
              value={estado}
              onChange={(e) => cambiarEstado(e.target.value)}
            >
              <option value="">Todos</option>
              {estados.map((valor) => (
                <option key={valor} value={valor}>{nombreEstado(valor)}</option>
              ))}
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
              onClick={() => {
                setFiltros(filtrosIniciales);
                cambiarEstado("");
              }}
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
          {catalogo.torneos.length === 0
            ? "No hay torneos publicados."
            : "No hay torneos que coincidan con los filtros."}
        </p>
      )}
      <div className="row g-4">
        {torneos.map((t) => (
          <div className="col-md-6 col-xl-4" key={t.id}>
            <TarjetaTorneo
              torneo={t}
              juego={juegos.find((j) => j.id === t.juegoId)}
              mostrarInscripcion
            />
          </div>
        ))}
      </div>
    </main>
  );
}
