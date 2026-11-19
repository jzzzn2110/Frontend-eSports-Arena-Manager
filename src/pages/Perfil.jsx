import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { operaciones } from "../services/operacionesService.js";

export default function Perfil({ servicio = operaciones }) {
  const { sesion, autenticado, logout, perfil, cargandoPerfil, errorPerfil,
    guardarPerfil, recargarPerfil } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [apodo, setApodo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [historial, setHistorial] = useState(null);
  const [errorHistorial, setErrorHistorial] = useState("");
  useEffect(() => {
    setNombre(perfil?.nombre ?? ""); setApodo(perfil?.apodo ?? "");
  }, [perfil]);
  useEffect(() => {
    setHistorial(null); setErrorHistorial("");
    if (!perfil?.id) return;
    const controller = new AbortController();
    servicio.inscripciones.porJugador(perfil.id, { signal: controller.signal })
      .then((datos) => { if (!controller.signal.aborted) setHistorial(datos); })
      .catch((err) => { if (!controller.signal.aborted) setErrorHistorial(err.message); });
    return () => controller.abort();
  }, [perfil?.id, servicio]);
  if (!autenticado) return null;
  async function guardar(event) {
    event.preventDefault(); setMensaje(""); setError("");
    if (!nombre.trim() || apodo.trim().length < 3) {
      setError("Indica tu nombre y un apodo de al menos 3 caracteres."); return;
    }
    setGuardando(true);
    try { await guardarPerfil({ nombre: nombre.trim(), apodo: apodo.trim() }); setMensaje("Perfil actualizado"); }
    catch (err) { setError(err.status === 409 ? "Ese apodo ya está en uso." : err.message); }
    finally { setGuardando(false); }
  }
  return <main className="container py-5">
    <h1>Mi perfil{perfil ? ` · ${perfil.apodo}` : ""}</h1>
    {cargandoPerfil && <p role="status">Cargando perfil…</p>}
    {errorPerfil && <div role="alert">{errorPerfil} <button onClick={recargarPerfil}>Reintentar</button></div>}
    {perfil && <form className="card p-4 mb-4" onSubmit={guardar}>
      <label htmlFor="perfil-nombre">Nombre</label>
      <input className="form-control mb-3" id="perfil-nombre" value={nombre} maxLength={100} required onChange={(e) => setNombre(e.target.value)} />
      <label htmlFor="perfil-apodo">Apodo</label>
      <input className="form-control mb-3" id="perfil-apodo" value={apodo} minLength={3} maxLength={40} required onChange={(e) => setApodo(e.target.value)} />
      <label htmlFor="perfil-email">Correo electrónico</label>
      <input className="form-control mb-3" id="perfil-email" type="email" value={sesion.email ?? ""} readOnly />
      <p>El correo identifica tu cuenta y no se cambia desde este formulario.</p>
      <p>Rol: {sesion.rol}</p>
      {error && <p role="alert">{error}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
      <button className="btn btn-primary" disabled={guardando}>{guardando ? "Guardando…" : "Guardar perfil"}</button>
    </form>}
    {perfil && <section className="card p-4 mb-4">
      <h2>Mis inscripciones individuales</h2>
      {errorHistorial ? <p role="alert">{errorHistorial}</p> : historial === null ? <p role="status">Cargando inscripciones…</p>
        : historial.length === 0 ? <p>No tienes inscripciones registradas</p>
        : <ul>{historial.map((i) => <li key={i.id}><Link to={`/torneo-detalle.html?id=${encodeURIComponent(i.torneoId)}`}>Torneo #{i.torneoId}</Link> · {i.estado}</li>)}</ul>}
    </section>}
    <button className="btn btn-outline-danger" onClick={() => { logout(); navigate("/login.html", { replace: true }); }}>Cerrar sesión</button>
    <Link className="btn btn-link" to="/index.html">Volver al inicio</Link>
  </main>;
}
