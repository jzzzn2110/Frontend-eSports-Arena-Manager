import { useEffect, useState } from "react";
import { operaciones } from "../services/operacionesService.js";

export default function PremiosRemotos({ torneoId, estado, puedeAsignar = false, servicios = operaciones }) {
  const finalizado = String(estado).toUpperCase() === "FINALIZADO";
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [form, setForm] = useState({ posicion: "", participanteId: "", descripcion: "" });
  useEffect(() => {
    setDatos(null);
    setError("");
    if (!finalizado) return;
    const controller = new AbortController();
    servicios.premios.porTorneo(torneoId, { signal: controller.signal }).then(premios => {
      if (!Array.isArray(premios)) throw new Error("Formato de premios inesperado.");
      if (!controller.signal.aborted) setDatos({ torneoId, premios });
    }).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [torneoId, finalizado, servicios, intento]);
  async function asignar(event) {
    event.preventDefault();
    if (ocupado || !puedeAsignar || !finalizado) return;
    setOcupado(true); setErrorEnvio(""); setMensaje("");
    try {
      await servicios.premios.asignar(torneoId, {
        posicion: Number(form.posicion), participanteId: Number(form.participanteId), descripcion: form.descripcion.trim(),
      });
      setMensaje("Premio asignado.");
      setForm({ posicion: "", participanteId: "", descripcion: "" });
      setIntento(n => n + 1);
    } catch (e) { setErrorEnvio(e.message); }
    finally { setOcupado(false); }
  }
  if (!finalizado) return null;
  return <section aria-label="Premios del torneo" className="my-4">
    <h2>Premios</h2>
    {error ? <div role="alert"><p>No se pudieron cargar los premios: {error}</p>
      <button className="btn btn-outline-primary" onClick={() => setIntento(n => n + 1)}>Reintentar premios</button></div>
      : !datos || datos.torneoId !== torneoId ? <p role="status">Cargando premios…</p>
      : datos.premios.length ? <ul className="list-group">{datos.premios.map(p =>
        <li className="list-group-item" key={p.id}>Puesto {p.posicion} · Participante #{p.participanteId}: {p.descripcion}</li>)}</ul>
      : <p>Todavía no se han asignado premios a este torneo.</p>}
    {puedeAsignar && <form onSubmit={asignar} className="card p-3 mt-3">
      <h3>Asignar premio</h3>
      <p>Indica el participante y su puesto en la clasificación final. El servidor comprobará que coincidan.</p>
      <fieldset disabled={ocupado}>
        <label htmlFor="premio-posicion">Puesto</label>
        <input id="premio-posicion" className="form-control" type="number" min="1" step="1" required value={form.posicion} onChange={e => setForm({ ...form, posicion: e.target.value })} />
        <label htmlFor="premio-participante">ID del participante</label>
        <input id="premio-participante" className="form-control" type="number" min="1" step="1" required value={form.participanteId} onChange={e => setForm({ ...form, participanteId: e.target.value })} />
        <label htmlFor="premio-descripcion">Descripción del premio</label>
        <input id="premio-descripcion" className="form-control" required maxLength="500" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
        <button className="btn btn-primary mt-3" type="submit">{ocupado ? "Asignando…" : "Asignar premio"}</button>
      </fieldset>
      {errorEnvio && <p role="alert">{errorEnvio}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
    </form>}
  </section>;
}
