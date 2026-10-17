import { useState } from "react";
import { useArena } from "../context/ArenaContext.jsx";
import { formatearFecha, nombreEstado } from "../utils/logica.js";
import Confirmacion from "../components/Confirmacion.jsx";

const vacio = {
  nombre: "",
  juegoId: "g3",
  estado: "abierto",
  cupoMaximo: 8,
  fechaCierreInscripcion: "",
  fechaInicio: "",
};
export default function Administracion({ actor }) {
  const { datos, store } = useArena();
  const [form, setForm] = useState(vacio);
  const [id, setId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [borrar, setBorrar] = useState(null);
  if (!["organizador", "administrador"].includes(actor.rol))
    return (
      <main className="container py-4">
        <h1>Administración</h1>
        <p className="alert alert-warning">
          Selecciona el perfil Organizador o Administrador para acceder.
        </p>
      </main>
    );
  const cambiar = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const limpiar = () => {
    setId(null);
    setForm(vacio);
  };
  function guardar(e) {
    e.preventDefault();
    try {
      store.guardarTorneo(form, actor, id);
      limpiar();
      setMensaje({ tipo: "success", texto: "Torneo guardado correctamente." });
    } catch (error) {
      setMensaje({ tipo: "danger", texto: error.message });
    }
  }
  function eliminar() {
    try {
      if (borrar === "demo") store.restablecer(actor);
      else store.eliminarTorneo(borrar, actor);
      limpiar();
      setMensaje({
        tipo: "success",
        texto:
          borrar === "demo"
            ? "Demostración restablecida."
            : "Torneo eliminado.",
      });
    } catch (error) {
      setMensaje({ tipo: "danger", texto: error.message });
    }
    setBorrar(null);
  }
  return (
    <main className="container py-4">
      <h1>Administración de torneos</h1>
      <p>
        Crea competencias, actualiza sus datos y consulta las inscripciones.
      </p>
      {mensaje && (
        <p role="alert" className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
        </p>
      )}
      <div className="row g-3 mb-4">
        {[
          ["Torneos", datos.TORNEOS.length],
          [
            "Inscripciones",
            datos.TORNEOS.reduce(
              (s, t) => s + t.participantesInscritos.length,
              0,
            ),
          ],
          ["Equipos", datos.EQUIPOS.length],
        ].map(([etiqueta, valor]) => (
          <div className="col-md-4" key={etiqueta}>
            <div className="card p-3">
              <span>{etiqueta}</span>
              <strong className="fs-2">{valor}</strong>
            </div>
          </div>
        ))}
      </div>
      <form className="card p-4 mb-4" onSubmit={guardar} noValidate>
        <h2 className="h4">{id ? "Editar torneo" : "Nuevo torneo"}</h2>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="torneo-nombre-input">
              Nombre del torneo
            </label>
            <input
              id="torneo-nombre-input"
              className="form-control"
              name="nombre"
              value={form.nombre}
              onChange={cambiar}
              maxLength={80}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="torneo-juego">
              Juego
            </label>
            <select
              id="torneo-juego"
              className="form-select"
              name="juegoId"
              value={form.juegoId}
              onChange={cambiar}
            >
              {datos.JUEGOS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="torneo-estado-input">
              Estado
            </label>
            <select
              id="torneo-estado-input"
              className="form-select"
              name="estado"
              value={form.estado}
              onChange={cambiar}
            >
              {["abierto", "en-curso", "finalizado"].map((e) => (
                <option key={e} value={e}>
                  {nombreEstado(e)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="torneo-cupo">
              Cupos
            </label>
            <input
              id="torneo-cupo"
              className="form-control"
              type="number"
              min="1"
              max="128"
              name="cupoMaximo"
              value={form.cupoMaximo}
              onChange={cambiar}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="torneo-cierre-input">
              Cierre de inscripción
            </label>
            <input
              id="torneo-cierre-input"
              type="date"
              className="form-control"
              name="fechaCierreInscripcion"
              value={form.fechaCierreInscripcion}
              onChange={cambiar}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="torneo-inicio-input">
              Inicio
            </label>
            <input
              id="torneo-inicio-input"
              type="date"
              className="form-control"
              name="fechaInicio"
              value={form.fechaInicio}
              onChange={cambiar}
            />
          </div>
        </div>
        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-primary">Guardar torneo</button>
          {id && (
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={limpiar}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>
      {borrar && (
        <Confirmacion
          texto={
            borrar === "demo"
              ? "Se eliminarán los cambios locales y se crearán datos de demostración nuevos."
              : `Se eliminará ${datos.TORNEOS.find((t) => t.id === borrar)?.nombre}.`
          }
          onConfirmar={eliminar}
          onCancelar={() => setBorrar(null)}
        />
      )}
      <div className="table-responsive" role="region" aria-label="Tabla desplazable" tabIndex={0}>
        <table className="table table-dark table-striped align-middle">
          <caption className="text-light">Torneos y cupos ocupados</caption>
          <thead>
            <tr>
              <th scope="col">Torneo</th>
              <th scope="col">Estado</th>
              <th scope="col">Cierre</th>
              <th scope="col">Inscritos</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.TORNEOS.map((t) => (
              <tr key={t.id}>
                <td>{t.nombre}</td>
                <td>{nombreEstado(t.estado)}</td>
                <td>{formatearFecha(t.fechaCierreInscripcion)}</td>
                <td>
                  {t.participantesInscritos.length}/{t.cupoMaximo}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={() => {
                        setId(t.id);
                        setForm({ ...t });
                        setMensaje(null);
                      }}
                    >
                      Editar<span className="visually-hidden"> {t.nombre}</span>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setBorrar(t.id)}
                    >
                      Eliminar
                      <span className="visually-hidden"> {t.nombre}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {actor.rol === "administrador" && (
        <button
          className="btn btn-outline-warning mt-3"
          onClick={() => setBorrar("demo")}
        >
          Restablecer demostración
        </button>
      )}
    </main>
  );
}
