import { useEffect, useRef, useState } from "react";
import Confirmacion from "../components/Confirmacion.jsx";
import { ApiError } from "../services/api.js";
import {
  cambiarEstadoTorneo,
  desactivarJuego,
  guardarJuego,
  guardarTorneo,
  listarJuegosAdmin,
} from "../services/administracionService.js";
import { listarTorneos } from "../services/torneosService.js";
import { formatearFecha, nombreEstado } from "../utils/logica.js";

const transiciones = {
  borrador: ["abierto", "cancelado"],
  abierto: ["cerrado", "cancelado"],
  cerrado: ["en-curso", "cancelado"],
  "en-curso": ["finalizado", "cancelado"],
};

function mensajeError(error) {
  if (error instanceof ApiError && [400, 409, 503].includes(error.status) && error.detalle) {
    const mensajes = Object.values(error.detalle).filter((valor) => typeof valor === "string");
    if (mensajes.length) return mensajes.join(" ");
  }
  return error.message;
}

function Campo({ id, etiqueta, ...props }) {
  return (
    <div className="col-sm-6">
      <label className="form-label" htmlFor={id}>{etiqueta}</label>
      <input className="form-control" id={id} required {...props} />
    </div>
  );
}

export default function AdministracionApi({ actor }) {
  if (actor.rol !== "administrador") {
    return (
      <main className="container py-4">
        <h1>Administración</h1>
        <p className="alert alert-warning">Selecciona el perfil Administrador para gestionar juegos y torneos.</p>
      </main>
    );
  }
  return <PanelAdministracion />;
}

function PanelAdministracion() {
  const [catalogo, setCatalogo] = useState(null);
  const [revision, setRevision] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const enviando = useRef(false);

  useEffect(() => {
    const solicitud = new AbortController();
    const signal = AbortSignal.any([solicitud.signal, AbortSignal.timeout(12000)]);
    Promise.all([listarJuegosAdmin(signal), listarTorneos(signal)])
      .then(
        ([juegos, torneos]) => {
          if (!solicitud.signal.aborted) setCatalogo({ juegos, torneos });
        },
        (error) => {
          if (solicitud.signal.aborted) return;
          const perfilInactivo = error instanceof ApiError && [403, 404, 405].includes(error.status);
          setErrorCarga(perfilInactivo
            ? "Inicia el Gateway y los servicios con el perfil local-admin para usar este panel."
            : "No se pudo cargar la administración.");
        },
      )
      .finally(() => {
        if (!solicitud.signal.aborted) setCargando(false);
        solicitud.abort();
      });
    return () => solicitud.abort();
  }, [revision]);

  function recargar() {
    setCargando(true);
    setErrorCarga("");
    setRevision((actual) => actual + 1);
  }

  async function ejecutar(accion, textoExito) {
    if (enviando.current) return false;
    enviando.current = true;
    setOcupado(true);
    setMensaje(null);
    const signal = AbortSignal.timeout(15000);
    try {
      await accion(signal);
      setMensaje({ tipo: "success", texto: textoExito });
      recargar();
      return true;
    } catch (error) {
      const sinConfirmacion = signal.aborted || error.cause instanceof TypeError ||
        (error instanceof ApiError && error.status >= 500);
      setMensaje({
        tipo: "danger",
        texto: sinConfirmacion
          ? "No se confirmó el cambio. Revisa la lista antes de volver a intentarlo."
          : mensajeError(error),
      });
      if (sinConfirmacion) recargar();
      return false;
    } finally {
      enviando.current = false;
      setOcupado(false);
    }
  }

  return (
    <main className="container py-4">
      <h1>Administración</h1>
      <p className="text-muted">Panel local de juegos y torneos.</p>
      {mensaje && <p role="alert" className={`alert alert-${mensaje.tipo}`}>{mensaje.texto}</p>}
      {cargando && <p role="status">Cargando el catálogo…</p>}
      {errorCarga && (
        <div className="alert alert-danger">
          <p role="alert">{errorCarga}</p>
          <button type="button" className="btn btn-outline-danger" onClick={recargar}>Reintentar</button>
        </div>
      )}
      {catalogo && (
        <fieldset disabled={ocupado || cargando || Boolean(errorCarga)}>
          <GestionJuegos juegos={catalogo.juegos} ejecutar={ejecutar} />
          <GestionTorneos juegos={catalogo.juegos} torneos={catalogo.torneos} ejecutar={ejecutar} />
        </fieldset>
      )}
    </main>
  );
}

function GestionJuegos({ juegos, ejecutar }) {
  const [edicion, setEdicion] = useState(null);
  const [porDesactivar, setPorDesactivar] = useState(null);

  async function guardar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);
    const juego = {
      nombre: datos.get("nombre").trim(),
      genero: datos.get("genero").trim(),
      modalidad: datos.get("modalidad").trim(),
      jugadoresPorEquipo: Number(datos.get("jugadoresPorEquipo")),
    };
    if (await ejecutar((signal) => guardarJuego(edicion?.id, juego, signal), "Juego guardado.")) {
      formulario.reset();
      setEdicion(null);
    }
  }

  async function confirmarDesactivacion() {
    const id = porDesactivar.id;
    if (await ejecutar((signal) => desactivarJuego(id, signal), "Juego desactivado.")) {
      if (edicion?.id === id) setEdicion(null);
      setPorDesactivar(null);
    }
  }

  return (
    <section className="mb-5" aria-labelledby="titulo-admin-juegos">
      <h2 id="titulo-admin-juegos">Juegos</h2>
      <form key={edicion?.id ?? "nuevo"} className="card p-4 mb-3" onSubmit={guardar}>
        <h3 className="h5">{edicion ? "Editar juego" : "Nuevo juego"}</h3>
        <div className="row g-3">
          <Campo id="admin-juego-nombre" etiqueta="Nombre del juego" name="nombre" maxLength={255} defaultValue={edicion?.nombre} />
          <Campo id="admin-juego-genero" etiqueta="Género" name="genero" maxLength={255} defaultValue={edicion?.genero} />
          <Campo id="admin-juego-modalidad" etiqueta="Modalidad del juego" name="modalidad" maxLength={255} defaultValue={edicion?.modalidad} />
          <Campo id="admin-juego-cupo" etiqueta="Jugadores por equipo" name="jugadoresPorEquipo" type="number"
            min="1" max="2147483647" defaultValue={edicion?.integrantesPorEquipo ?? 5} />
        </div>
        <div className="d-flex flex-wrap gap-2 mt-3">
          <button className="btn btn-primary">Guardar juego</button>
          {edicion && <button type="button" className="btn btn-outline-secondary" onClick={() => setEdicion(null)}>Cancelar edición de juego</button>}
        </div>
      </form>
      {porDesactivar && (
        <Confirmacion
          texto={`Se ocultará ${porDesactivar.nombre} del catálogo de juegos activos.`}
          etiquetaConfirmar="Confirmar desactivación"
          onConfirmar={confirmarDesactivacion}
          onCancelar={() => setPorDesactivar(null)}
        />
      )}
      {juegos.length === 0 ? <p>No hay juegos registrados.</p> : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead><tr><th scope="col">Juego</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead>
            <tbody>{juegos.map((juego) => (
              <tr key={juego.id}>
                <td>{juego.nombre}</td>
                <td>{juego.estado ? "Activo" : "Inactivo"}</td>
                <td>
                  <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setEdicion(juego)}>
                      Editar juego<span className="visually-hidden"> {juego.nombre}</span>
                    </button>
                    {juego.estado && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setPorDesactivar(juego)}>
                        Desactivar<span className="visually-hidden"> {juego.nombre}</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// Una fecha sin editar conserva la hora que traía el registro.
function fechaGuardada(datos, campo, edicion) {
  const valor = datos.get(campo);
  const anterior = edicion?.[campo];
  return anterior?.slice(0, 10) === valor ? anterior : valor;
}

function fechaParaComparar(valor) {
  if (typeof valor !== "string" || !valor) return new Date(NaN);
  return new Date(valor.length === 10 ? `${valor}T00:00:00` : valor.replace(" ", "T"));
}

function GestionTorneos({ juegos, torneos, ejecutar }) {
  const [edicion, setEdicion] = useState(null);
  const [errorFechas, setErrorFechas] = useState("");
  const juegosDisponibles = juegos.filter((juego) => juego.estado || juego.id === edicion?.juegoId);

  function editar(torneo) {
    setEdicion(torneo);
    setErrorFechas("");
  }

  async function guardar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);
    const cierre = fechaGuardada(datos, "fechaCierreInscripcion", edicion);
    const inicio = fechaGuardada(datos, "fechaInicio", edicion);
    const fin = fechaGuardada(datos, "fechaFin", edicion);
    if (!(fechaParaComparar(inicio) > fechaParaComparar(cierre))) {
      setErrorFechas("La fecha de inicio debe ser posterior al cierre de inscripción.");
      return;
    }
    if (!(fechaParaComparar(fin) > fechaParaComparar(inicio))) {
      setErrorFechas("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }
    setErrorFechas("");
    const torneo = {
      nombre: datos.get("nombre").trim(),
      juegoId: Number(datos.get("juegoId")),
      modalidad: datos.get("modalidad").trim(),
      cupoMaximo: Number(datos.get("cupoMaximo")),
      fechaCierreInscripcion: cierre,
      fechaInicio: inicio,
      fechaFin: fin,
    };
    const texto = edicion ? "Torneo actualizado." : "Torneo creado como borrador.";
    if (await ejecutar((signal) => guardarTorneo(edicion?.id, torneo, signal), texto)) {
      formulario.reset();
      editar(null);
    }
  }

  return (
    <section aria-labelledby="titulo-admin-torneos">
      <h2 id="titulo-admin-torneos">Torneos</h2>
      <form key={edicion?.id ?? "nuevo"} className="card p-4 mb-3" onSubmit={guardar} onChange={() => setErrorFechas("")}>
        <h3 className="h5">{edicion ? "Editar torneo" : "Nuevo torneo"}</h3>
        <div className="row g-3">
          <Campo id="admin-torneo-nombre" etiqueta="Nombre del torneo" name="nombre" maxLength={255} defaultValue={edicion?.nombre} />
          <div className="col-sm-6">
            <label className="form-label" htmlFor="admin-torneo-juego">Juego del torneo</label>
            <select className="form-select" id="admin-torneo-juego" name="juegoId" required defaultValue={edicion?.juegoId ?? ""}>
              <option value="">Selecciona un juego</option>
              {juegosDisponibles.map((juego) => <option key={juego.id} value={juego.id}>{juego.nombre}</option>)}
            </select>
          </div>
          <Campo id="admin-torneo-modalidad" etiqueta="Modalidad del torneo" name="modalidad" maxLength={255} defaultValue={edicion?.modalidad} />
          <Campo id="admin-torneo-cupo" etiqueta="Cupo máximo" name="cupoMaximo" type="number"
            min="1" max="2147483647" defaultValue={edicion?.cupoMaximo ?? 8} />
          <Campo id="admin-torneo-cierre" etiqueta="Cierre de inscripción" name="fechaCierreInscripcion" type="date" defaultValue={edicion?.fechaCierreInscripcion?.slice(0, 10)} />
          <Campo id="admin-torneo-inicio" etiqueta="Fecha de inicio" name="fechaInicio" type="date" defaultValue={edicion?.fechaInicio?.slice(0, 10)} />
          <Campo id="admin-torneo-fin" etiqueta="Fecha de fin" name="fechaFin" type="date" defaultValue={edicion?.fechaFin?.slice(0, 10)} />
        </div>
        {errorFechas && <p role="alert" className="alert alert-danger mt-3">{errorFechas}</p>}
        <div className="d-flex flex-wrap gap-2 mt-3">
          <button className="btn btn-primary" disabled={juegosDisponibles.length === 0}>Guardar torneo</button>
          {edicion && <button type="button" className="btn btn-outline-secondary" onClick={() => editar(null)}>Cancelar edición de torneo</button>}
        </div>
      </form>
      {torneos.length === 0 ? <p>No hay torneos registrados.</p> : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead><tr><th scope="col">Torneo</th><th scope="col">Estado</th><th scope="col">Inicio</th><th scope="col">Cupo máximo</th><th scope="col">Acciones</th></tr></thead>
            <tbody>{torneos.map((torneo) => (
              <FilaTorneo key={torneo.id} torneo={torneo} editar={editar} ejecutar={ejecutar} />
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function FilaTorneo({ torneo, editar, ejecutar }) {
  const [nuevoEstado, setNuevoEstado] = useState("");
  const estados = transiciones[torneo.estado] ?? [];
  const seleccionado = estados.includes(nuevoEstado) ? nuevoEstado : "";

  async function cambiar() {
    if (await ejecutar(
      (signal) => cambiarEstadoTorneo(torneo.id, seleccionado, signal),
      "Estado del torneo actualizado.",
    )) setNuevoEstado("");
  }

  return (
    <tr>
      <td>{torneo.nombre}</td>
      <td>{nombreEstado(torneo.estado)}</td>
      <td>{formatearFecha(torneo.fechaInicio)}</td>
      <td>{torneo.cupoMaximo}</td>
      <td>
        <div className="d-flex flex-wrap gap-2">
          {torneo.estado !== "en-curso" && (
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editar(torneo)}>
              Editar torneo<span className="visually-hidden"> {torneo.nombre}</span>
            </button>
          )}
          {estados.length > 0 && (
            <>
              <select className="form-select form-select-sm w-auto" aria-label={`Nuevo estado de ${torneo.nombre}`}
                value={seleccionado} onChange={(evento) => setNuevoEstado(evento.target.value)}>
                <option value="">Nuevo estado</option>
                {estados.map((estado) => <option key={estado} value={estado}>{nombreEstado(estado)}</option>)}
              </select>
              <button type="button" className="btn btn-sm btn-outline-primary" disabled={!seleccionado} onClick={cambiar}>
                Cambiar estado<span className="visually-hidden"> de {torneo.nombre}</span>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
