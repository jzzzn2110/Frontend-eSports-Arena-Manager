import { useEffect, useState } from "react";
import { operaciones } from "../services/operacionesService.js";

export default function NotificacionesTorneo({ torneoId, servicios = operaciones }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setDatos(null); setError("");
    servicios.notificaciones.porTorneo(torneoId, { signal: controller.signal }).then(avisos => {
      if (!Array.isArray(avisos)) throw new Error("Formato de notificaciones inesperado.");
      if (!controller.signal.aborted) setDatos({ torneoId, avisos });
    }).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [torneoId, servicios, intento]);
  const cargando = !error && (!datos || datos.torneoId !== torneoId);
  return <section aria-label="Notificaciones del torneo" className="my-4">
    <h2>Notificaciones</h2>
    <p>Avisos públicos del torneo, del más reciente al más antiguo (hasta 100).</p>
    {error ? <p role="alert">No se pudieron cargar los avisos: {error}</p>
      : cargando ? <p role="status">Cargando notificaciones…</p>
      : datos.avisos.length ? <ul className="list-group">{datos.avisos.map(n =>
        <li className="list-group-item" key={n.id}><p>{n.mensaje}</p><time dateTime={n.fecha}>{n.fecha}</time></li>)}</ul>
      : <p>Todavía no hay notificaciones para este torneo.</p>}
    <button className="btn btn-outline-primary mt-2" disabled={cargando} onClick={() => setIntento(n => n + 1)}>{error ? "Reintentar notificaciones" : "Actualizar notificaciones"}</button>
  </section>;
}
