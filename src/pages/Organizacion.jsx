import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { listarTorneos } from "../services/torneosService.js";
import { operaciones } from "../services/operacionesService.js";
import ResultadosPartida from "../components/ResultadosPartida.jsx";
import GestionSanciones from "../components/GestionSanciones.jsx";
import PremiosRemotos from "../components/PremiosRemotos.jsx";

export default function Organizacion({ servicio = operaciones, cargarTorneos = listarTorneos }) {
  const { tieneRol } = useAuth();
  const permitido = tieneRol("organizador", "administrador");
  const [torneos, setTorneos] = useState([]);
  const [torneoId, setTorneoId] = useState("");
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [intento, setIntento] = useState(0);
  const vacio = { participanteAId: "", participanteBId: "", ronda: "", fechaHora: "" };
  const [form, setForm] = useState(vacio);
  const [editando, setEditando] = useState(null);
  const [partidaResultados, setPartidaResultados] = useState(null);
  useEffect(() => {
    if (!permitido) return;
    const c = new AbortController();
    cargarTorneos(c.signal).then((lista) => { if (!c.signal.aborted) setTorneos(lista); })
      .catch((e) => { if (!c.signal.aborted) setError(e.message); });
    return () => c.abort();
  }, [permitido, cargarTorneos, intento]);
  useEffect(() => {
    setDatos(null); setError(""); setMensaje(""); setEditando(null); setForm(vacio);
    setPartidaResultados(null);
    if (!permitido || !torneoId) return;
    const c = new AbortController();
    Promise.all([servicio.inscripciones.porTorneo(torneoId, { signal: c.signal }), servicio.partidas.porTorneo(torneoId, { signal: c.signal })])
      .then(([inscripciones, partidas]) => { if (!c.signal.aborted) setDatos({ torneoId, inscripciones, partidas }); })
      .catch((e) => { if (!c.signal.aborted) setError(e.message); });
    return () => c.abort();
  }, [permitido, torneoId, servicio, intento]);
  if (!permitido) return <main className="container py-5"><h1>Organización</h1><p>No tienes permisos para este panel.</p></main>;
  const actual = datos?.torneoId === torneoId ? datos : null;
  const participantes = actual?.inscripciones.filter((i) => ["APROBADA", "ACEPTADA"].includes(i.estado)) ?? [];
  async function ejecutar(accion, texto) {
    if (ocupado) return;
    setOcupado(true); setError(""); setMensaje("");
    try {
      await accion();
      const [inscripciones, partidas] = await Promise.all([servicio.inscripciones.porTorneo(torneoId), servicio.partidas.porTorneo(torneoId)]);
      setDatos({ torneoId, inscripciones, partidas }); setMensaje(texto); setEditando(null); setForm(vacio);
    } catch (e) { setError(e.message); }
    finally { setOcupado(false); }
  }
  function guardar(event) {
    event.preventDefault();
    if (!form.participanteAId || !form.participanteBId || form.participanteAId === form.participanteBId || !form.ronda.trim() || !form.fechaHora) {
      setError("Selecciona dos participantes distintos, ronda y horario."); return;
    }
    const envio = { ...form, torneoId: Number(torneoId), participanteAId: Number(form.participanteAId), participanteBId: Number(form.participanteBId) };
    ejecutar(() => editando ? servicio.partidas.actualizar(editando, envio) : servicio.partidas.crear(envio), "Partida guardada.");
  }
  return <main className="container py-5"><h1>Organización de torneos</h1>
    <label htmlFor="torneo-organizacion">Torneo</label>
    <select id="torneo-organizacion" className="form-select mb-4" value={torneoId} disabled={ocupado} onChange={(e) => setTorneoId(e.target.value)}>
      <option value="">Selecciona un torneo</option>{torneos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
    </select>
    {error && <p role="alert">{error} <button onClick={() => setIntento((n) => n + 1)}>Reintentar</button></p>}
    {mensaje && <p role="status">{mensaje}</p>}
    {torneoId && !actual && !error && <p role="status">Cargando operaciones…</p>}
    {actual && <>
      <section className="card p-4 mb-4"><h2>Inscripciones</h2>
        {actual.inscripciones.length === 0 ? <p>No hay inscripciones.</p> : <ul>{actual.inscripciones.map((i) => <li key={i.id}>#{i.id} · {i.tipoParticipante} #{i.equipoId ?? i.jugadorId} · {i.estado}
          {i.estado === "PENDIENTE" && <button disabled={ocupado} onClick={() => ejecutar(() => servicio.inscripciones.cambiarEstado(i.id, "APROBADA"), "Inscripción aprobada.")}>Aprobar #{i.id}</button>}
        </li>)}</ul>}
      </section>
      <form className="card p-4 mb-4" onSubmit={guardar}><h2>{editando ? "Reprogramar partida" : "Programar partida"}</h2>
        {["participanteAId", "participanteBId"].map((campo, n) => <label key={campo}>Participante {n === 0 ? "A" : "B"}
          <select className="form-select mb-3" value={form[campo]} required onChange={(e) => setForm({ ...form, [campo]: e.target.value })}>
            <option value="">Selecciona participante aprobado</option>{participantes.map((i) => <option key={i.id} value={i.equipoId ?? i.jugadorId}>{i.tipoParticipante} #{i.equipoId ?? i.jugadorId}</option>)}
          </select></label>)}
        <label htmlFor="ronda-partida">Ronda</label><input id="ronda-partida" className="form-control mb-3" required value={form.ronda} onChange={(e) => setForm({ ...form, ronda: e.target.value })} />
        <label htmlFor="horario-partida">Horario local</label><input id="horario-partida" className="form-control mb-3" type="datetime-local" required value={form.fechaHora} onChange={(e) => setForm({ ...form, fechaHora: e.target.value })} />
        <button disabled={ocupado || participantes.length < 2}>Guardar partida</button>
      </form>
      <section><h2>Calendario</h2>{actual.partidas.length === 0 ? <p>No hay partidas programadas.</p> : <ul>{actual.partidas.map((p) => <li key={p.id}>#{p.id} · {p.ronda} · {p.fechaHora} · {p.estado}
        <button disabled={ocupado} onClick={() => setPartidaResultados(p)}>Resultados #{p.id}</button>
        {p.estado === "PROGRAMADA" && <button disabled={ocupado} onClick={() => { setEditando(p.id); setForm({ participanteAId: String(p.participanteAId), participanteBId: String(p.participanteBId), ronda: p.ronda, fechaHora: p.fechaHora }); }}>Reprogramar #{p.id}</button>}
      </li>)}</ul>}</section>
      {partidaResultados && <ResultadosPartida key={partidaResultados.id} partida={partidaResultados} servicio={servicio} />}
      <PremiosRemotos key={torneoId} torneoId={torneoId} estado={torneos.find(t => String(t.id) === torneoId)?.estado} puedeAsignar={tieneRol("administrador")} servicios={servicio} />
    </>}
    <GestionSanciones servicio={servicio} />
  </main>;
}
