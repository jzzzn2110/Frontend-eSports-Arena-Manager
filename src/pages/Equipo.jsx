import { useState } from "react";
import { useArena } from "../context/ArenaContext.jsx";
import Confirmacion from "../components/Confirmacion.jsx";
export default function Equipo({ actor }) {
  const { datos, store } = useArena();
  const inicial = () => ({
    nombre: "",
    juegoId: "g5",
    capitanId: actor.jugadorId,
    activo: true,
    integrantes: [actor.jugadorId],
  });
  const [form, setForm] = useState(inicial);
  const [id, setId] = useState(null);
  const [agregar, setAgregar] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [borrar, setBorrar] = useState(null);
  if (actor.rol === "visitante")
    return (
      <main className="container py-4">
        <h1>Equipos</h1>
        <p className="alert alert-info">
          Selecciona un perfil de jugador para gestionar tus equipos.
        </p>
      </main>
    );
  const equipos = datos.EQUIPOS.filter(
    (e) =>
      actor.rol === "administrador" ||
      e.integrantes.some((i) => i.jugadorId === actor.jugadorId),
  );
  const limpiar = () => {
    setId(null);
    setForm(inicial());
    setAgregar("");
  };
  const cambiar = (e) =>
    setForm((f) => ({
      ...f,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  function guardar(e) {
    e.preventDefault();
    try {
      store.guardarEquipo(form, actor, id);
      limpiar();
      setMensaje({ tipo: "success", texto: "Equipo guardado correctamente." });
    } catch (error) {
      setMensaje({ tipo: "danger", texto: error.message });
    }
  }
  function eliminar() {
    try {
      store.eliminarEquipo(borrar, actor);
      if (id === borrar) limpiar();
      setMensaje({ tipo: "success", texto: "Equipo eliminado." });
    } catch (error) {
      setMensaje({ tipo: "danger", texto: error.message });
    }
    setBorrar(null);
  }
  return (
    <main className="container py-4">
      <h1>Mis equipos</h1>
      <p>
        Crea tu equipo y organiza integrantes y capitán antes de inscribirte.
      </p>
      {mensaje && (
        <p className={`alert alert-${mensaje.tipo}`} role="alert">
          {mensaje.texto}
        </p>
      )}
      <div className="row g-4">
        <div className="col-lg-6">
          <form className="card p-4" onSubmit={guardar} noValidate>
            <h2 className="h4">{id ? "Editar equipo" : "Crear equipo"}</h2>
            <label htmlFor="nombre-equipo" className="form-label">
              Nombre del equipo
            </label>
            <input
              id="nombre-equipo"
              className="form-control mb-3"
              name="nombre"
              value={form.nombre}
              onChange={cambiar}
              maxLength={60}
            />
            <label htmlFor="juego-equipo" className="form-label">
              Juego
            </label>
            <select
              id="juego-equipo"
              className="form-select mb-3"
              name="juegoId"
              value={form.juegoId}
              onChange={cambiar}
            >
              {datos.JUEGOS.filter((j) => j.integrantesPorEquipo > 1).map(
                (j) => (
                  <option key={j.id} value={j.id}>
                    {j.nombre} ({j.integrantesPorEquipo} integrantes)
                  </option>
                ),
              )}
            </select>
            <label htmlFor="agregar-jugador" className="form-label">
              Agregar integrante
            </label>
            <div className="d-flex gap-2 mb-3">
              <select
                id="agregar-jugador"
                className="form-select"
                value={agregar}
                onChange={(e) => setAgregar(e.target.value)}
              >
                <option value="">Selecciona un jugador</option>
                {datos.JUGADORES.filter(
                  (j) => !form.integrantes.includes(j.id),
                ).map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.apodo}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline-light"
                disabled={!agregar}
                onClick={() => {
                  setForm((f) => ({
                    ...f,
                    integrantes: [...f.integrantes, agregar],
                  }));
                  setAgregar("");
                }}
              >
                Agregar
              </button>
            </div>
            <ul className="list-group mb-3">
              {form.integrantes.map((jugadorId) => (
                <li
                  className="list-group-item d-flex align-items-center justify-content-between gap-2"
                  key={jugadorId}
                >
                  <span>
                    {datos.JUGADORES.find((j) => j.id === jugadorId)?.apodo}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-warning"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        integrantes: f.integrantes.filter(
                          (i) => i !== jugadorId,
                        ),
                        capitanId: f.capitanId === jugadorId ? "" : f.capitanId,
                      }))
                    }
                  >
                    Quitar
                    <span className="visually-hidden">
                      {" "}
                      {datos.JUGADORES.find((j) => j.id === jugadorId)?.apodo}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <label htmlFor="capitan-equipo" className="form-label">
              Capitán
            </label>
            <select
              id="capitan-equipo"
              className="form-select mb-3"
              name="capitanId"
              value={form.capitanId}
              onChange={cambiar}
            >
              <option value="">Selecciona al capitán</option>
              {form.integrantes.map((jugadorId) => (
                <option key={jugadorId} value={jugadorId}>
                  {datos.JUGADORES.find((j) => j.id === jugadorId)?.apodo}
                </option>
              ))}
            </select>
            <div className="form-check mb-3">
              <input
                id="equipo-activo"
                className="form-check-input"
                type="checkbox"
                name="activo"
                checked={form.activo}
                onChange={cambiar}
              />
              <label htmlFor="equipo-activo" className="form-check-label">
                Equipo activo
              </label>
            </div>
            <p className="small">
              Puedes guardar una plantilla incompleta y completarla antes de
              inscribirte. Los equipos inscritos quedan protegidos para
              conservar su historial.
            </p>
            <div className="d-flex gap-2">
              <button className="btn btn-primary">Guardar equipo</button>
              {id && (
                <button
                  className="btn btn-outline-light"
                  type="button"
                  onClick={limpiar}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="col-lg-6">
          {!equipos.length && (
            <p className="alert alert-info">
              Todavía no perteneces a ningún equipo.
            </p>
          )}
          {equipos.map((e) => (
            <article className="card p-3 mb-3" key={e.id}>
              <h2 className="h4">{e.nombre}</h2>
              <p>
                {datos.JUEGOS.find((j) => j.id === e.juegoId)?.nombre} ·{" "}
                {e.activo ? "Activo" : "Inactivo"}
              </p>
              <p>
                Capitán:{" "}
                {datos.JUGADORES.find((j) => j.id === e.capitanId)?.apodo}
              </p>
              <ul>
                {e.integrantes.map((i) => (
                  <li key={i.jugadorId}>
                    {datos.JUGADORES.find((j) => j.id === i.jugadorId)?.apodo} ·{" "}
                    {i.rol}
                  </li>
                ))}
              </ul>
              {(actor.rol === "administrador" ||
                e.capitanId === actor.jugadorId) && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-light"
                    onClick={() => {
                      setId(e.id);
                      setForm({
                        ...e,
                        integrantes: e.integrantes.map((i) => i.jugadorId),
                      });
                      setMensaje(null);
                    }}
                  >
                    Editar<span className="visually-hidden"> {e.nombre}</span>
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => setBorrar(e.id)}
                  >
                    Eliminar<span className="visually-hidden"> {e.nombre}</span>
                  </button>
                </div>
              )}
            </article>
          ))}
          {borrar && (
            <Confirmacion
              texto={`Se eliminará el equipo ${datos.EQUIPOS.find((e) => e.id === borrar)?.nombre}.`}
              onConfirmar={eliminar}
              onCancelar={() => setBorrar(null)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
