import { useEffect, useState } from "react";
import { operaciones } from "../services/operacionesService.js";

export default function ResultadosPartida({ partida, servicio = operaciones }) {
  const [resultados, setResultados] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [form, setForm] = useState({ puntajeA: "", puntajeB: "", evidenciaUrl: "" });
  const [editando, setEditando] = useState(null);
  const [validando, setValidando] = useState(null);
  const [anulando, setAnulando] = useState(null);
  const [justificacion, setJustificacion] = useState("");
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const c = new AbortController(); setResultados(null); setError(""); setMensaje(""); setEditando(null); setValidando(null);
    setForm({ puntajeA: "", puntajeB: "", evidenciaUrl: "" });
    setAnulando(null); setJustificacion("");
    servicio.resultados.porPartida(partida.id, { signal: c.signal })
      .then((lista) => { if (!c.signal.aborted) setResultados(lista); })
      .catch((e) => { if (!c.signal.aborted) setError(e.message); });
    return () => c.abort();
  }, [partida.id, servicio, intento]);
  async function ejecutar(accion, texto) {
    if (ocupado) return;
    setOcupado(true); setError(""); setMensaje("");
    try {
      await accion();
      setResultados(await servicio.resultados.porPartida(partida.id));
      setMensaje(texto); setEditando(null); setValidando(null);
      setAnulando(null); setJustificacion("");
    } catch (e) {
      setError(e.status === 503 && typeof e.detalle?.error === "string" ? e.detalle.error : e.message);
    }
    finally { setOcupado(false); }
  }
  function guardar(event) {
    event.preventDefault();
    const a = Number(form.puntajeA), b = Number(form.puntajeB);
    if (form.puntajeA === "" || form.puntajeB === "" || !Number.isSafeInteger(a) || !Number.isSafeInteger(b) || a < 0 || b < 0) {
      setError("Los puntajes deben ser enteros no negativos."); return;
    }
    const datos = { partidaId: partida.id, puntajeA: a, puntajeB: b,
      ganadorId: a === b ? null : a > b ? partida.participanteAId : partida.participanteBId,
      evidenciaUrl: form.evidenciaUrl.trim() || null };
    ejecutar(() => editando ? servicio.resultados.actualizar(editando, datos) : servicio.resultados.crear(datos), "Resultado guardado; pendiente de validación.");
  }
  return <section className="card p-4 mt-4"><h2>Resultados de la partida #{partida.id}</h2>
    <p>Participante A #{partida.participanteAId} · Participante B #{partida.participanteBId}</p>
    {error && <p role="alert">{error} <button onClick={() => setIntento((n) => n + 1)}>Reintentar resultados</button></p>}
    {mensaje && <p role="status">{mensaje}</p>}
    {resultados === null && !error && <p role="status">Cargando resultados…</p>}
    {resultados && <>
      {partida.torneoId && resultados.some((r) => ["VALIDADO", "ANULADO"].includes(r.estadoValidacion)) &&
        <button disabled={ocupado} onClick={() => ejecutar(() => servicio.rankings.recalcular(partida.torneoId), "Ranking sincronizado.")}>Sincronizar ranking del torneo</button>}
      {resultados.length === 0 && <p>No hay resultados registrados.</p>}
      {resultados.map((r) => <div key={r.id} className="mb-3"><p>#{r.id}: {r.puntajeA} – {r.puntajeB} · {r.estadoValidacion}</p>
        {r.estadoValidacion === "PENDIENTE" && <>
          <button disabled={ocupado} onClick={() => { setEditando(r.id); setForm({ puntajeA: String(r.puntajeA), puntajeB: String(r.puntajeB), evidenciaUrl: r.evidenciaUrl ?? "" }); }}>Editar resultado #{r.id}</button>
          <button disabled={ocupado} onClick={() => setValidando(r.id)}>Validar resultado #{r.id}</button>
        </>}
        {r.estadoValidacion === "VALIDADO" && <p>Resultado validado: edición bloqueada.</p>}
        {r.estadoValidacion !== "ANULADO" && <button disabled={ocupado} onClick={() => { setAnulando(r.id); setJustificacion(""); setValidando(null); }}>Anular resultado #{r.id}</button>}
      </div>)}
      {(resultados.length === 0 || editando) && <form onSubmit={guardar}>
        {["puntajeA", "puntajeB"].map((campo) => <label key={campo}>Puntaje {campo === "puntajeA" ? "A" : "B"}
          <input className="form-control mb-3" name={campo} type="number" min="0" step="1" required value={form[campo]} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} /></label>)}
        <label htmlFor="evidencia-resultado">Enlace de evidencia (opcional)</label>
        <input id="evidencia-resultado" className="form-control mb-3" type="url" value={form.evidenciaUrl} onChange={(e) => setForm({ ...form, evidenciaUrl: e.target.value })} />
        <button disabled={ocupado}>Guardar resultado</button>
      </form>}
      {validando && <div className="alert alert-warning mt-3" role="alert"><p>La validación bloqueará la edición del resultado #{validando}.</p>
        <button disabled={ocupado} onClick={() => ejecutar(() => servicio.resultados.validar(validando), "Resultado validado.")}>Confirmar validación</button>
        <button disabled={ocupado} onClick={() => setValidando(null)}>Volver</button></div>}
      {anulando && <form className="alert alert-warning mt-3" onSubmit={(e) => {
        e.preventDefault();
        if (!justificacion.trim()) { setError("Debes justificar la anulación."); return; }
        ejecutar(() => servicio.resultados.anular(anulando, justificacion.trim()), "Resultado anulado.");
      }}><h3 className="h5">Anular resultado #{anulando}</h3>
        <label htmlFor="justificacion-anulacion">Justificación</label><textarea id="justificacion-anulacion" className="form-control mb-3" required value={justificacion} onChange={(e) => setJustificacion(e.target.value)} />
        <button disabled={ocupado}>Confirmar anulación</button><button type="button" disabled={ocupado} onClick={() => setAnulando(null)}>Conservar resultado</button>
      </form>}
    </>}
  </section>;
}
