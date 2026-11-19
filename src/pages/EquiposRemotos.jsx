import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { listarJuegos } from "../services/juegosService.js";
import { operaciones } from "../services/operacionesService.js";

export default function EquiposRemotos({ servicio = operaciones, cargarJuegos = listarJuegos }) {
  const { perfil, sesion, errorPerfil, cargandoPerfil, recargarPerfil } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [juego, setJuego] = useState("");
  const [editando, setEditando] = useState(null);
  const [integrantes, setIntegrantes] = useState({});
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);
  const [confirmacion, setConfirmacion] = useState(null);
  useEffect(() => {
    if (!perfil?.id) return;
    const c = new AbortController(); setCargando(true); setError("");
    Promise.all([servicio.equipos.listar({ signal: c.signal }), cargarJuegos(c.signal)])
      .then(([lista, catalogo]) => { if (!c.signal.aborted) { setEquipos(lista); setJuegos(catalogo); } })
      .catch((err) => { if (!c.signal.aborted) setError(err.message); })
      .finally(() => { if (!c.signal.aborted) setCargando(false); });
    return () => c.abort();
  }, [perfil?.id, servicio, cargarJuegos, intento]);
  const puedeEditar = (e) => sesion.rol === "administrador" || String(e.capitanId) === String(perfil?.id);
  const propios = equipos.filter((e) => puedeEditar(e) || e.miembros?.some((m) => String(m.usuarioId) === String(perfil?.id)));
  async function ejecutar(accion, texto) {
    if (ocupado) return;
    setOcupado(true); setError(""); setMensaje("");
    try { await accion(); setMensaje(texto); setIntento((n) => n + 1); setConfirmacion(null); }
    catch (err) { setError(err.message); }
    finally { setOcupado(false); }
  }
  function guardar(e) {
    e.preventDefault();
    const datos = { nombre: nombre.trim(), juegoPrincipalId: Number(juego), capitanId: editando?.capitanId ?? perfil.id };
    if (datos.nombre.length < 3 || !datos.juegoPrincipalId) { setError("Indica un nombre de al menos 3 caracteres y un juego."); return; }
    ejecutar(async () => {
      if (editando) await servicio.equipos.actualizar(editando.id, datos);
      else await servicio.equipos.crear(datos);
      setEditando(null); setNombre(""); setJuego("");
    }, "Equipo guardado en el servidor.");
  }
  return <main className="container py-5">
    <h1>Mis equipos</h1>
    {cargandoPerfil && <p role="status">Cargando perfil…</p>}
    {errorPerfil && <p role="alert">{errorPerfil} <button onClick={recargarPerfil}>Reintentar perfil</button></p>}
    {error && <p role="alert">{error} <button onClick={() => setIntento((n) => n + 1)}>Reintentar</button></p>}
    {mensaje && <p role="status">{mensaje}</p>}
    {perfil && <>
      <form onSubmit={guardar} className="card p-4 mb-4">
        <h2>{editando ? "Editar equipo" : "Crear equipo"}</h2>
        <label htmlFor="nombre-equipo">Nombre</label>
        <input id="nombre-equipo" className="form-control mb-3" value={nombre} required minLength={3} maxLength={60} onChange={(e) => setNombre(e.target.value)} />
        <label htmlFor="juego-equipo">Juego</label>
        <select id="juego-equipo" className="form-select mb-3" value={juego} required onChange={(e) => setJuego(e.target.value)}>
          <option value="">Selecciona un juego</option>{juegos.map((j) => <option key={j.id} value={j.id}>{j.nombre}</option>)}
        </select>
        <button className="btn btn-primary" disabled={ocupado || cargando}>Guardar equipo</button>
        {editando && <button type="button" onClick={() => { setEditando(null); setNombre(""); setJuego(""); }}>Cancelar edición</button>}
      </form>
      {cargando ? <p role="status">Cargando equipos…</p> : propios.length === 0 && !error ? <p>No perteneces a ningún equipo activo.</p> : propios.map((equipo) =>
        <section key={equipo.id} className="card p-4 mb-3">
          <h2>{equipo.nombre}</h2>
          <p>Capitán: usuario #{equipo.capitanId}</p>
          <ul>{equipo.miembros?.map((m) => <li key={m.id}>Usuario #{m.usuarioId} · {m.rolDentroEquipo}
            {puedeEditar(equipo) && String(m.usuarioId) !== String(equipo.capitanId) && <button disabled={ocupado} onClick={() => setConfirmacion({ texto: `Quitar al usuario #${m.usuarioId} de ${equipo.nombre}`, accion: () => servicio.equipos.quitarMiembro(equipo.id, m.id) })}>Quitar integrante</button>}
          </li>)}</ul>
          {puedeEditar(equipo) && <>
            <button disabled={ocupado} onClick={() => { setEditando(equipo); setNombre(equipo.nombre); setJuego(String(equipo.juegoPrincipalId)); }}>Editar {equipo.nombre}</button>
            <button disabled={ocupado} onClick={() => setConfirmacion({ texto: `Desactivar ${equipo.nombre}`, accion: () => servicio.equipos.desactivar(equipo.id) })}>Desactivar equipo</button>
            <form className="mt-3" onSubmit={(e) => { e.preventDefault(); ejecutar(() => servicio.equipos.agregarMiembro(equipo.id, { usuarioId: Number(integrantes[equipo.id]), rolDentroEquipo: "JUGADOR" }), "Integrante agregado."); }}>
              <label htmlFor={`integrante-${equipo.id}`}>ID del jugador a agregar</label>
              <input className="form-control" id={`integrante-${equipo.id}`} type="number" min="1" step="1" required value={integrantes[equipo.id] ?? ""} onChange={(e) => setIntegrantes({ ...integrantes, [equipo.id]: e.target.value })} />
              <button disabled={ocupado}>Agregar integrante</button>
            </form>
          </>}
        </section>)}
      {confirmacion && <section className="alert alert-warning" role="alert"><p>{confirmacion.texto}</p>
        <button disabled={ocupado} onClick={() => ejecutar(confirmacion.accion, "Cambio guardado.")}>Confirmar</button>
        <button disabled={ocupado} onClick={() => setConfirmacion(null)}>Conservar</button>
      </section>}
    </>}
  </main>;
}
