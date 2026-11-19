import { useEffect, useState } from "react";
import { operaciones } from "../services/operacionesService.js";

export default function CompeticionRemota({ torneoId, servicios = operaciones }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setDatos(null);
    setError("");
    async function cargar() {
      try {
        const options = { signal: controller.signal };
        const [rankings, partidas] = await Promise.all([
          servicios.rankings.porTorneo(torneoId, options),
          servicios.partidas.porTorneo(torneoId, options),
        ]);
        if (!Array.isArray(rankings) || !Array.isArray(partidas)) {
          throw new Error("La API devolvió un formato de competición inesperado.");
        }
        if (!controller.signal.aborted) setDatos({ torneoId, rankings, partidas });
      } catch (e) {
        if (!controller.signal.aborted) setError(e.message);
      }
    }
    cargar();
    return () => controller.abort();
  }, [torneoId, servicios, intento]);
  if (error) return <section className="alert alert-danger" role="alert">
    <p>No se pudo cargar la competición: {error}</p>
    <button className="btn btn-outline-danger" onClick={() => setIntento(n => n + 1)}>Reintentar</button>
  </section>;
  if (!datos || datos.torneoId !== torneoId) return <p role="status">Cargando clasificación y partidas…</p>;
  const rankings = [...datos.rankings].sort((a, b) =>
    (a.posicion ?? Infinity) - (b.posicion ?? Infinity) || (b.puntos ?? 0) - (a.puntos ?? 0));
  return <section aria-label="Competición del torneo">
    <h2>Clasificación</h2>
    {rankings.length ? <div className="table-responsive"><table className="table">
      <caption>Clasificación publicada por el servidor</caption>
      <thead><tr>{["Posición", "Participante", "Puntos", "Victorias", "Derrotas", "Diferencia"].map(t => <th key={t} scope="col">{t}</th>)}</tr></thead>
      <tbody>{rankings.map(r => <tr key={r.id}><td>{r.posicion ?? "Sin asignar"}</td><td>Participante #{r.participanteId}</td><td>{r.puntos ?? 0}</td><td>{r.victorias ?? 0}</td><td>{r.derrotas ?? 0}</td><td>{r.diferencia ?? 0}</td></tr>)}</tbody>
    </table></div> : <p>No hay clasificación publicada para este torneo.</p>}
    <h2>Partidas y calendario</h2>
    {datos.partidas.length ? <ul className="list-group mb-4">{datos.partidas.map(p =>
      <li key={p.id} className="list-group-item">
        <strong>{p.ronda || "Ronda por definir"}</strong>: {p.participanteAId ? `Participante #${p.participanteAId}` : "Por definir"} contra {p.participanteBId ? `Participante #${p.participanteBId}` : "Por definir"}
        <div>{p.fechaHora ? <time dateTime={p.fechaHora}>{p.fechaHora.replace("T", " ")}</time> : "Horario por definir"} · {p.estado}</div>
      </li>)}</ul> : <p>No hay partidas programadas para este torneo.</p>}
  </section>;
}
