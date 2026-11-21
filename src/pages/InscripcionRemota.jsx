import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { operaciones, idApi } from "../services/operacionesService.js";
import { obtenerTorneo } from "../services/torneosService.js";
import { obtenerJuego } from "../services/juegosService.js";

export default function InscripcionRemota({ servicio = operaciones, cargarTorneo = obtenerTorneo, cargarJuego = obtenerJuego }) {
  const [params] = useSearchParams();
  const torneoId = params.get("torneo");
  const { perfil, errorPerfil, cargandoPerfil, recargarPerfil } = useAuth();
  const [datos, setDatos] = useState(null);
  const [tipo, setTipo] = useState("JUGADOR");
  const [equipoId, setEquipoId] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [cancelarId, setCancelarId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    setDatos(null); setError(""); setMensaje(""); setConfirmado(false); setCancelarId(null);
    if (!perfil?.id) return;
    try { idApi(torneoId); } catch { setError("Selecciona un torneo válido desde el catálogo."); return; }
    const c = new AbortController();
    Promise.all([cargarTorneo(torneoId, c.signal).then(async (torneo) => ({ torneo, juego: torneo ? await cargarJuego(torneo.juegoId, c.signal) : null })), servicio.equipos.listar({ signal: c.signal }),
      servicio.inscripciones.porTorneo(torneoId, { signal: c.signal })])
      .then(([{ torneo, juego }, equipos, inscripciones]) => {
        if (!c.signal.aborted) {
          if (!torneo) { setError("El torneo no existe."); return; }
          const cantidad = juego?.integrantesPorEquipo ?? juego?.jugadoresPorEquipo;
          if (!Number.isInteger(cantidad) || cantidad < 1) { setError("El juego no tiene una configuración de participantes válida."); return; }
          const tipoEsperado = cantidad === 1 ? "JUGADOR" : "EQUIPO";
          setTipo(tipoEsperado);
          setDatos({ torneoId, torneo, equipos, inscripciones, tipoEsperado });
        }
      }).catch((err) => { if (!c.signal.aborted) setError(err.message); });
    return () => c.abort();
  }, [torneoId, perfil?.id, servicio, cargarTorneo, cargarJuego, intento]);
  const actual = datos?.torneoId === torneoId ? datos : null;
  const equipos = actual?.equipos.filter((e) => e.estado && String(e.capitanId) === String(perfil?.id) && String(e.juegoPrincipalId) === String(actual.torneo.juegoId)) ?? [];
  const propias = actual?.inscripciones.filter((i) => String(i.jugadorId) === String(perfil?.id) || equipos.some((e) => String(e.id) === String(i.equipoId))) ?? [];
  const ocupados = actual?.inscripciones.filter((i) => i.estado !== "CANCELADA").length ?? 0;
  async function ejecutar(accion, texto) {
    if (ocupado) return;
    setOcupado(true); setError(""); setMensaje("");
    try {
      await accion();
      const inscripciones = await servicio.inscripciones.porTorneo(torneoId);
      setDatos((prev) => prev?.torneoId === torneoId ? { ...prev, inscripciones } : prev);
      setMensaje(texto); setConfirmado(false); setCancelarId(null);
    } catch (err) { setError(err.message); }
    finally { setOcupado(false); }
  }
  function inscribir(event) {
    event.preventDefault();
    if (!confirmado) { setError("Confirma los datos antes de inscribirte."); return; }
    if (tipo === "EQUIPO" && !equipos.some((e) => String(e.id) === equipoId)) { setError("Selecciona uno de tus equipos compatibles."); return; }
    ejecutar(() => servicio.inscripciones.crear({ torneoId: Number(torneoId), tipoParticipante: tipo,
      ...(tipo === "JUGADOR" ? { jugadorId: perfil.id } : { equipoId: Number(equipoId) }) }), "Inscripción registrada; pendiente de aprobación.");
  }
  return <main className="container py-5"><h1>Inscripciones</h1>
    {cargandoPerfil && <p role="status">Cargando perfil…</p>}
    {errorPerfil && <p role="alert">{errorPerfil} <button onClick={recargarPerfil}>Reintentar perfil</button></p>}
    {error && <p role="alert">{error} <button onClick={() => setIntento((n) => n + 1)}>Reintentar</button></p>}
    {mensaje && <p role="status">{mensaje}</p>}
    {perfil && !actual && !error && <p role="status">Cargando inscripción…</p>}
    {actual && <><h2>{actual.torneo.nombre}</h2><p>Cupos ocupados: {ocupados} / {actual.torneo.cupoMaximo}</p>
      <form onSubmit={inscribir} className="card p-4 mb-4">
        <label htmlFor="tipo-participante">Participación</label>
        <select id="tipo-participante" value={tipo} onChange={(e) => { setTipo(e.target.value); setConfirmado(false); }} className="form-select mb-3">
          <option value={actual.tipoEsperado}>{actual.tipoEsperado === "JUGADOR" ? "Individual" : "Equipo"}</option>
        </select>
        {tipo === "EQUIPO" && <><label htmlFor="equipo-inscripcion">Equipo del que eres capitán</label>
          <select id="equipo-inscripcion" value={equipoId} onChange={(e) => setEquipoId(e.target.value)} required className="form-select mb-3">
            <option value="">Selecciona un equipo</option>{equipos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>{equipos.length === 0 && <p>No tienes equipos compatibles. <Link to="/equipo.html">Gestionar equipos</Link></p>}</>}
        <label><input type="checkbox" checked={confirmado} onChange={(e) => setConfirmado(e.target.checked)} /> Confirmo los datos de participación.</label>
        <p>El servidor verificará plazo, cupos, participantes y sanciones antes de aceptar.</p>
        <button className="btn btn-primary" disabled={ocupado || actual.torneo.estado !== "abierto" || ocupados >= actual.torneo.cupoMaximo}>Inscribirme</button>
      </form>
      <h2>Mis inscripciones en este torneo</h2>
      {propias.length === 0 ? <p>No tienes inscripciones registradas.</p> : <ul>{propias.map((i) => <li key={i.id}>#{i.id} · {i.tipoParticipante} · {i.estado}
        {i.estado !== "CANCELADA" && <button disabled={ocupado} onClick={() => setCancelarId(i.id)}>Cancelar inscripción #{i.id}</button>}
      </li>)}</ul>}
      {cancelarId && <div role="alert" className="alert alert-warning"><p>¿Cancelar la inscripción #{cancelarId}?</p>
        <button disabled={ocupado} onClick={() => ejecutar(() => servicio.inscripciones.cancelar(cancelarId), "Inscripción cancelada.")}>Confirmar cancelación</button>
        <button disabled={ocupado} onClick={() => setCancelarId(null)}>Conservar</button></div>}
    </>}
    <Link to="/torneos.html">Volver al catálogo</Link>
  </main>;
}
