import { crearSemilla } from "../data/semilla.js";
import {
  cuposDisponibles,
  inscripcionFueraDePlazo,
  tieneSancionActiva,
} from "../utils/logica.js";

export const CLAVE_DATOS = "esports-arena-datos-v2";
const copia = (valor) => JSON.parse(JSON.stringify(valor));
const exigir = (condicion, mensaje) => {
  if (!condicion) throw new Error(mensaje);
};
const gestor = (actor) => ["organizador", "administrador"].includes(actor?.rol);
const congelar = (objeto) => {
  Object.values(objeto).forEach((v) => {
    if (v && typeof v === "object") congelar(v);
  });
  return Object.freeze(objeto);
};
const estructuraValida = (d) =>
  d &&
  ["JUEGOS", "JUGADORES", "EQUIPOS", "TORNEOS", "PARTIDAS"].every((k) =>
    Array.isArray(d[k]),
  ) &&
  d.JUEGOS.length > 0 &&
  d.JUGADORES.length > 0 &&
  d.RANKINGS &&
  d.PREMIOS &&
  d.JUEGOS.every(
    (j) =>
      j.id &&
      Number.isInteger(j.integrantesPorEquipo) &&
      j.integrantesPorEquipo > 0,
  ) &&
  d.JUGADORES.every(
    (j) =>
      j.id &&
      typeof j.nombre === "string" &&
      typeof j.apodo === "string" &&
      Array.isArray(j.sanciones),
  ) &&
  d.EQUIPOS.every(
    (e) =>
      e.id &&
      typeof e.nombre === "string" &&
      Array.isArray(e.integrantes) &&
      e.integrantes.every((i) => d.JUGADORES.some((j) => j.id === i.jugadorId)),
  ) &&
  d.TORNEOS.every(
    (t) =>
      t.id &&
      typeof t.nombre === "string" &&
      Array.isArray(t.participantesInscritos) &&
      d.JUEGOS.some((j) => j.id === t.juegoId),
  );

// Servicio local de demostración. Sus roles no sustituyen autorización de servidor.
export function crearArenaStore({
  storage,
  ahora = () => new Date(),
  semilla = crearSemilla,
} = {}) {
  let datos = semilla(ahora());
  let aviso = "";
  try {
    const guardado = storage?.getItem(CLAVE_DATOS);
    if (guardado) {
      const contenido = JSON.parse(guardado);
      exigir(
        contenido.version === 2 && estructuraValida(contenido.datos),
        "Datos locales incompatibles",
      );
      datos = contenido.datos;
    }
  } catch {
    aviso =
      "No se pudieron recuperar los datos locales. Se cargó una demostración nueva.";
  }
  datos = congelar(copia(datos));
  const oyentes = new Set();
  const notificar = () => oyentes.forEach((fn) => fn());
  function guardar(siguiente) {
    try {
      storage?.setItem(
        CLAVE_DATOS,
        JSON.stringify({ version: 2, datos: siguiente }),
      );
    } catch {
      throw new Error(
        "No se pudo guardar en este navegador. Libera espacio o habilita el almacenamiento; no se aplicaron cambios.",
      );
    }
    datos = congelar(copia(siguiente));
    aviso = storage
      ? ""
      : "Almacenamiento no disponible: los cambios duran solo durante esta sesión.";
    notificar();
  }
  // Persiste también la primera semilla para mantener fechas estables al recargar.
  if (storage) {
    try {
      storage.setItem(CLAVE_DATOS, JSON.stringify({ version: 2, datos }));
    } catch {
      aviso =
        "El navegador bloqueó el almacenamiento. Los cambios no podrán guardarse.";
    }
  } else
    aviso =
      "Almacenamiento no disponible: los cambios duran solo durante esta sesión.";

  function identificar(actor) {
    exigir(
      actor && ["jugador", "organizador", "administrador"].includes(actor.rol),
      "Selecciona un perfil de jugador para realizar esta acción.",
    );
    const jugador = datos.JUGADORES.find((j) => j.id === actor.jugadorId);
    exigir(jugador, "Jugador no encontrado.");
    return jugador;
  }
  function controlarEquipo(equipo, actor) {
    identificar(actor);
    exigir(equipo, "Equipo no encontrado.");
    exigir(
      actor.rol === "administrador" || equipo.capitanId === actor.jugadorId,
      "Solo el capitán o un administrador puede gestionar este equipo.",
    );
  }
  const estaInscrito = (id) =>
    datos.TORNEOS.some((t) => t.participantesInscritos.includes(id));
  const idNuevo = (prefijo, lista) =>
    `${prefijo}${Math.max(0, ...lista.map((x) => Number(x.id.slice(prefijo.length)) || 0)) + 1}`;
  function validarEquipo(entrada, id, actor) {
    const nombre = String(entrada.nombre || "").trim();
    exigir(
      nombre.length >= 3 && nombre.length <= 60,
      "El nombre del equipo debe tener entre 3 y 60 caracteres.",
    );
    exigir(
      !datos.EQUIPOS.some(
        (e) =>
          e.id !== id &&
          e.nombre.toLocaleLowerCase() === nombre.toLocaleLowerCase(),
      ),
      "Ya existe un equipo con este nombre.",
    );
    const juego = datos.JUEGOS.find((j) => j.id === entrada.juegoId);
    exigir(
      juego && juego.integrantesPorEquipo > 1,
      "Selecciona un juego por equipos.",
    );
    const miembros = entrada.integrantes || [];
    exigir(
      miembros.length >= 1 && miembros.length <= juego.integrantesPorEquipo,
      `El equipo necesita entre 1 y ${juego.integrantesPorEquipo} integrantes.`,
    );
    exigir(
      new Set(miembros).size === miembros.length &&
        miembros.every((idJugador) =>
          datos.JUGADORES.some((j) => j.id === idJugador),
        ),
      "Los integrantes deben existir y no repetirse.",
    );
    exigir(
      miembros.includes(entrada.capitanId),
      "El capitán debe pertenecer al equipo.",
    );
    if (!id && actor.rol !== "administrador")
      exigir(
        entrada.capitanId === actor.jugadorId,
        "Debes ser el capitán del equipo que creas.",
      );
    return {
      id: id || idNuevo("e", datos.EQUIPOS),
      nombre,
      juegoId: juego.id,
      capitanId: entrada.capitanId,
      activo: entrada.activo !== false,
      integrantes: miembros.map((jugadorId) => ({
        jugadorId,
        rol: jugadorId === entrada.capitanId ? "Capitán" : "Miembro",
      })),
    };
  }
  function abierto(torneo) {
    exigir(torneo, "Torneo no encontrado.");
    exigir(torneo.estado === "abierto", "El torneo no está abierto.");
    exigir(
      !inscripcionFueraDePlazo(torneo, ahora()),
      "El plazo de inscripción ha finalizado.",
    );
  }
  function participante(torneo, id, actor) {
    identificar(actor);
    const juego = datos.JUEGOS.find((j) => j.id === torneo.juegoId);
    if (juego.integrantesPorEquipo === 1) {
      const jugador = datos.JUGADORES.find((j) => j.id === id);
      exigir(jugador, "Selecciona un jugador válido.");
      exigir(
        actor.rol === "administrador" || actor.jugadorId === id,
        "Solo puedes inscribir tu propio perfil.",
      );
      return { jugador, juego };
    }
    const equipo = datos.EQUIPOS.find((e) => e.id === id);
    controlarEquipo(equipo, actor);
    return { equipo, juego };
  }
  return {
    getSnapshot: () => datos,
    getAviso: () => aviso,
    subscribe(fn) {
      oyentes.add(fn);
      return () => oyentes.delete(fn);
    },
    guardarEquipo(entrada, actor, id = null) {
      identificar(actor);
      if (id) {
        controlarEquipo(
          datos.EQUIPOS.find((e) => e.id === id),
          actor,
        );
        exigir(
          !estaInscrito(id),
          "Cancela las inscripciones del equipo antes de modificarlo. Los equipos con historial se conservan.",
        );
      }
      const equipo = validarEquipo(entrada, id, actor);
      const siguiente = copia(datos);
      siguiente.EQUIPOS = id
        ? siguiente.EQUIPOS.map((e) => (e.id === id ? equipo : e))
        : [...siguiente.EQUIPOS, equipo];
      guardar(siguiente);
      return equipo.id;
    },
    eliminarEquipo(id, actor) {
      controlarEquipo(
        datos.EQUIPOS.find((e) => e.id === id),
        actor,
      );
      exigir(
        !estaInscrito(id),
        "No se puede eliminar un equipo inscrito o con historial.",
      );
      const siguiente = copia(datos);
      siguiente.EQUIPOS = siguiente.EQUIPOS.filter((e) => e.id !== id);
      guardar(siguiente);
    },
    actualizarPerfil(id, entrada, actor) {
      identificar(actor);
      exigir(
        actor.rol === "administrador" || actor.jugadorId === id,
        "Solo puedes editar tu propio perfil.",
      );
      exigir(
        datos.JUGADORES.some((j) => j.id === id),
        "Jugador no encontrado.",
      );
      const nombre = String(entrada.nombre || "").trim();
      const apodo = String(entrada.apodo || "").trim();
      const email = String(entrada.email || "").trim();
      exigir(
        nombre.length >= 2 && nombre.length <= 80,
        "El nombre debe tener entre 2 y 80 caracteres.",
      );
      exigir(
        /^[\p{L}\p{N}_-]{3,20}$/u.test(apodo),
        "El apodo debe tener de 3 a 20 letras, números, guiones o guiones bajos.",
      );
      exigir(
        !datos.JUGADORES.some(
          (j) =>
            j.id !== id &&
            j.apodo.toLocaleLowerCase() === apodo.toLocaleLowerCase(),
        ),
        "Este apodo ya está en uso.",
      );
      exigir(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        "Ingresa un correo válido.",
      );
      const siguiente = copia(datos);
      siguiente.JUGADORES = siguiente.JUGADORES.map((j) =>
        j.id === id ? { ...j, nombre, apodo, email } : j,
      );
      guardar(siguiente);
    },
    inscribir(torneoId, participanteId, actor) {
      const torneo = datos.TORNEOS.find((t) => t.id === torneoId);
      abierto(torneo);
      exigir(
        cuposDisponibles(torneo) > 0,
        "El torneo no tiene cupos disponibles.",
      );
      exigir(
        !torneo.participantesInscritos.includes(participanteId),
        "El participante ya está inscrito.",
      );
      const { equipo, jugador, juego } = participante(
        torneo,
        participanteId,
        actor,
      );
      if (equipo) {
        exigir(equipo.activo, "El equipo está inactivo.");
        exigir(
          equipo.juegoId === torneo.juegoId,
          "El equipo pertenece a otro juego.",
        );
        exigir(
          equipo.integrantes.length === juego.integrantesPorEquipo,
          `Se requieren exactamente ${juego.integrantesPorEquipo} integrantes.`,
        );
        exigir(
          !equipo.integrantes.some((i) =>
            tieneSancionActiva(
              datos.JUGADORES.find((j) => j.id === i.jugadorId),
            ),
          ),
          "El equipo tiene integrantes sancionados.",
        );
      } else
        exigir(
          !tieneSancionActiva(jugador),
          "El jugador tiene una sanción vigente.",
        );
      const siguiente = copia(datos);
      siguiente.TORNEOS.find(
        (t) => t.id === torneoId,
      ).participantesInscritos.push(participanteId);
      guardar(siguiente);
    },
    cancelarInscripcion(torneoId, participanteId, actor) {
      const torneo = datos.TORNEOS.find((t) => t.id === torneoId);
      abierto(torneo);
      participante(torneo, participanteId, actor);
      exigir(
        torneo.participantesInscritos.includes(participanteId),
        "El participante no está inscrito.",
      );
      const siguiente = copia(datos);
      const t = siguiente.TORNEOS.find((t) => t.id === torneoId);
      t.participantesInscritos = t.participantesInscritos.filter(
        (id) => id !== participanteId,
      );
      guardar(siguiente);
    },
    guardarTorneo(entrada, actor, id = null) {
      identificar(actor);
      exigir(
        gestor(actor),
        "Solo organizadores y administradores pueden gestionar torneos.",
      );
      const actual = id ? datos.TORNEOS.find((t) => t.id === id) : null;
      exigir(!id || actual, "Torneo no encontrado.");
      const nombre = String(entrada.nombre || "").trim();
      exigir(
        nombre.length >= 3 && nombre.length <= 80,
        "El nombre del torneo debe tener entre 3 y 80 caracteres.",
      );
      exigir(
        datos.JUEGOS.some((j) => j.id === entrada.juegoId),
        "Selecciona un juego válido.",
      );
      const estados = ["abierto", "en-curso", "finalizado"];
      exigir(estados.includes(entrada.estado), "Estado de torneo inválido.");
      const fechaValida = (f) =>
        /^\d{4}-\d{2}-\d{2}$/.test(f || "") &&
        !Number.isNaN(Date.parse(f)) &&
        new Date(f).toISOString().slice(0, 10) === f;
      exigir(
        fechaValida(entrada.fechaCierreInscripcion) &&
          fechaValida(entrada.fechaInicio),
        "Completa fechas válidas.",
      );
      exigir(
        entrada.fechaCierreInscripcion <= entrada.fechaInicio,
        "El cierre no puede ser posterior al inicio.",
      );
      const cupo = Number(entrada.cupoMaximo);
      exigir(
        Number.isInteger(cupo) && cupo > 0 && cupo <= 128,
        "El cupo debe ser un entero entre 1 y 128.",
      );
      exigir(
        cupo >= (actual?.participantesInscritos.length || 0),
        "El cupo no puede ser menor a los inscritos.",
      );
      exigir(
        !actual?.participantesInscritos.length ||
          entrada.juegoId === actual.juegoId,
        "No se puede cambiar el juego de un torneo con participantes.",
      );
      if (actual)
        exigir(
          estados.indexOf(entrada.estado) >= estados.indexOf(actual.estado),
          "No se puede retroceder el estado del torneo.",
        );
      const torneo = {
        id: id || idNuevo("t", datos.TORNEOS),
        nombre,
        juegoId: entrada.juegoId,
        estado: entrada.estado,
        fechaCierreInscripcion: entrada.fechaCierreInscripcion,
        fechaInicio: entrada.fechaInicio,
        cupoMaximo: cupo,
        participantesInscritos: actual?.participantesInscritos || [],
      };
      if (torneo.estado === "abierto")
        exigir(
          !inscripcionFueraDePlazo(torneo, ahora()),
          "Un torneo abierto necesita un cierre vigente.",
        );
      const siguiente = copia(datos);
      siguiente.TORNEOS = id
        ? siguiente.TORNEOS.map((t) => (t.id === id ? torneo : t))
        : [...siguiente.TORNEOS, torneo];
      guardar(siguiente);
      return torneo.id;
    },
    eliminarTorneo(id, actor) {
      identificar(actor);
      exigir(
        gestor(actor),
        "Solo organizadores y administradores pueden gestionar torneos.",
      );
      const torneo = datos.TORNEOS.find((t) => t.id === id);
      exigir(torneo, "Torneo no encontrado.");
      exigir(
        !torneo.participantesInscritos.length &&
          !datos.PARTIDAS.some((p) => p.torneoId === id),
        "No se puede eliminar un torneo con participantes o partidas.",
      );
      const siguiente = copia(datos);
      siguiente.TORNEOS = siguiente.TORNEOS.filter((t) => t.id !== id);
      delete siguiente.RANKINGS[id];
      delete siguiente.PREMIOS[id];
      guardar(siguiente);
    },
    restablecer(actor) {
      identificar(actor);
      exigir(
        actor.rol === "administrador",
        "Solo el administrador puede restablecer la demostración.",
      );
      guardar(semilla(ahora()));
    },
  };
}
