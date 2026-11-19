import { useState } from "react";
import { operaciones, idApi } from "../services/operacionesService.js";

export default function GestionSanciones({ servicio = operaciones }) {
  const [tipo, setTipo] = useState("usuario");
  const [id, setId] = useState("");
  const [consulta, setConsulta] = useState(null);
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ motivo: "", severidad: "LEVE", fechaInicio: "", fechaFin: "" });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [cerrarId, setCerrarId] = useState(null);
  const cargar = (destino) => destino.tipo === "usuario" ? servicio.sanciones.porUsuario(destino.id) : servicio.sanciones.porEquipo(destino.id);
  async function consultar(event) {
    event.preventDefault(); setError(""); setMensaje(""); setConsulta(null); setCerrarId(null);
    try {
      const destino = { tipo, id: Number(idApi(id)) }; setOcupado(true);
      setLista(await cargar(destino)); setConsulta(destino);
    } catch (e) { setError(e.message); }
    finally { setOcupado(false); }
  }
  async function ejecutar(accion, texto) {
    if (ocupado) return;
    setError(""); setMensaje(""); setOcupado(true);
    try { await accion(); setLista(await cargar(consulta)); setCerrarId(null); setMensaje(texto); }
    catch (e) { setError(e.message); }
    finally { setOcupado(false); }
  }
  function crear(event) {
    event.preventDefault();
    if (!form.motivo.trim() || !form.fechaInicio || !form.fechaFin || form.fechaFin < form.fechaInicio) {
      setError("Indica motivo y un intervalo de fechas válido."); return;
    }
    ejecutar(() => servicio.sanciones.crear({ ...form, motivo: form.motivo.trim(),
      ...(consulta.tipo === "usuario" ? { usuarioId: consulta.id } : { equipoId: consulta.id }) }), "Sanción registrada.");
  }
  return <section className="card p-4 mt-4"><h2>Sanciones</h2>
    <form onSubmit={consultar}>
      <label htmlFor="sancion-tipo">Participante</label><select id="sancion-tipo" className="form-select mb-3" disabled={ocupado} value={tipo} onChange={(e) => { setTipo(e.target.value); setConsulta(null); }}><option value="usuario">Jugador</option><option value="equipo">Equipo</option></select>
      <label htmlFor="sancion-id">ID del participante</label><input id="sancion-id" className="form-control mb-3" type="number" min="1" step="1" required disabled={ocupado} value={id} onChange={(e) => { setId(e.target.value); setConsulta(null); }} />
      <button disabled={ocupado}>Consultar sanciones</button>
    </form>
    {error && <p role="alert">{error}</p>}{mensaje && <p role="status">{mensaje}</p>}
    {consulta && <><h3 className="h5 mt-4">{consulta.tipo === "usuario" ? "Jugador" : "Equipo"} #{consulta.id}</h3>
      {lista.length === 0 ? <p>No hay sanciones registradas.</p> : <ul>{lista.map((s) => <li key={s.id}>#{s.id} · {s.motivo} · {s.severidad} · {s.fechaInicio} a {s.fechaFin} · {s.estado ? "Abierta" : "Cerrada"}
        {s.estado && <button disabled={ocupado} onClick={() => setCerrarId(s.id)}>Cerrar sanción #{s.id}</button>}
      </li>)}</ul>}
      <form onSubmit={crear} className="mt-4"><h3 className="h5">Registrar sanción</h3>
        <label htmlFor="sancion-motivo">Motivo</label><input id="sancion-motivo" className="form-control mb-3" required value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
        <label htmlFor="sancion-severidad">Severidad</label><select id="sancion-severidad" className="form-select mb-3" value={form.severidad} onChange={(e) => setForm({ ...form, severidad: e.target.value })}>{["LEVE", "MODERADA", "GRAVE"].map((s) => <option key={s}>{s}</option>)}</select>
        {["fechaInicio", "fechaFin"].map((campo) => <label key={campo}>{campo === "fechaInicio" ? "Inicio" : "Fin"}<input className="form-control mb-3" name={campo} type="date" required value={form[campo]} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} /></label>)}
        <button disabled={ocupado}>Registrar sanción</button>
      </form>
      {cerrarId && <div role="alert" className="alert alert-warning mt-3"><p>¿Cerrar la sanción #{cerrarId}?</p><button disabled={ocupado} onClick={() => ejecutar(() => servicio.sanciones.cerrar(cerrarId), "Sanción cerrada.")}>Confirmar cierre</button><button disabled={ocupado} onClick={() => setCerrarId(null)}>Conservar</button></div>}
    </>}
  </section>;
}
