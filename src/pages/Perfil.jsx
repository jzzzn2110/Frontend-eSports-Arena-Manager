import { useState } from "react";
import { Link } from "react-router-dom";
import { useArena } from "../context/ArenaContext.jsx";
import { nombreEstado, tieneSancionActiva } from "../utils/logica.js";
export default function Perfil({ actor }) {
  const { datos, store } = useArena();
  const jugador = datos.JUGADORES.find((j) => j.id === actor.jugadorId);
  const [form, setForm] = useState(() => ({
    nombre: jugador.nombre,
    apodo: jugador.apodo,
    email: jugador.email,
  }));
  const [mensaje, setMensaje] = useState(null);
  if (actor.rol === "visitante")
    return (
      <main className="container py-4">
        <h1>Perfil del jugador</h1>
        <p className="alert alert-info">
          Selecciona un perfil de jugador para consultar y editar sus datos.
        </p>
      </main>
    );
  const equipos = datos.EQUIPOS.filter((e) =>
    e.integrantes.some((i) => i.jugadorId === jugador.id),
  );
  const historial = datos.TORNEOS.filter(
    (t) =>
      t.participantesInscritos.includes(jugador.id) ||
      equipos.some((e) => t.participantesInscritos.includes(e.id)),
  );
  function guardar(e) {
    e.preventDefault();
    try {
      store.actualizarPerfil(jugador.id, form, actor);
      setMensaje({
        tipo: "success",
        texto: "Perfil actualizado correctamente.",
      });
    } catch (error) {
      setMensaje({ tipo: "danger", texto: error.message });
    }
  }
  return (
    <main className="container py-4">
      <h1>Perfil de {jugador.apodo}</h1>
      <p>
        {jugador.nombre} · {jugador.email}
      </p>
      {tieneSancionActiva(jugador) && (
        <p className="alert alert-warning">
          Este jugador tiene una sanción vigente y no puede inscribirse.
        </p>
      )}
      <div className="row g-3 mb-4">
        {[
          ["Torneos inscritos", historial.length],
          ["Victorias registradas", jugador.victorias],
          ["Derrotas registradas", jugador.derrotas],
        ].map(([titulo, valor]) => (
          <div className="col-md-4" key={titulo}>
            <div className="card p-3">
              <span>{titulo}</span>
              <strong className="fs-2">{valor}</strong>
            </div>
          </div>
        ))}
      </div>
      <p className="small">
        Las victorias y derrotas son estadísticas de demostración; inscribirse
        no agrega resultados de partidas.
      </p>
      {mensaje && (
        <p className={`alert alert-${mensaje.tipo}`} role="alert">
          {mensaje.texto}
        </p>
      )}
      <form className="card p-4 mb-4" onSubmit={guardar} noValidate>
        <h2 className="h4">Datos personales</h2>
        <div className="row g-3">
          {[
            ["nombre", "Nombre", "text"],
            ["apodo", "Apodo", "text"],
            ["email", "Correo", "email"],
          ].map(([campo, label, tipo]) => (
            <div className="col-md-4" key={campo}>
              <label className="form-label" htmlFor={`perfil-${campo}`}>
                {label}
              </label>
              <input
                id={`perfil-${campo}`}
                className="form-control"
                type={tipo}
                value={form[campo]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [campo]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary mt-3 align-self-start">
          Guardar perfil
        </button>
      </form>
      <h2 className="h4">Mis torneos</h2>
      {!historial.length ? (
        <p className="alert alert-info">No tienes inscripciones registradas.</p>
      ) : (
        <div className="table-responsive" role="region" aria-label="Tabla desplazable" tabIndex={0}>
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th scope="col">Torneo</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((t) => (
                <tr key={t.id}>
                  <td>{t.nombre}</td>
                  <td>{nombreEstado(t.estado)}</td>
                  <td>
                    <Link to={`/torneo-detalle.html?id=${t.id}`}>
                      Ver detalle
                    </Link>
                    {t.estado === "abierto" && (
                      <>
                        {" "}
                        ·{" "}
                        <Link to={`/inscripcion.html?torneo=${t.id}`}>
                          Gestionar inscripción
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <h2 className="h4 mt-4">Mis equipos</h2>
      <p>
        {equipos.length
          ? equipos.map((e) => e.nombre).join(", ")
          : "No perteneces a ningún equipo."}
      </p>
      <Link to="/equipo.html">Gestionar equipos</Link>
    </main>
  );
}
