import {
  crearArenaStore,
  CLAVE_DATOS,
} from "../src/services/crearArenaStore.js";
import { crearSemilla } from "../src/data/semilla.js";
const jugador = { rol: "jugador", jugadorId: "j1" };
const admin = { rol: "administrador", jugadorId: "j1" };
const visitante = { rol: "visitante", jugadorId: "j1" };
const fecha = () => new Date("2030-01-01T12:00:00");
const equipo = () => ({
  nombre: "Equipo nuevo",
  juegoId: "g4",
  capitanId: "j1",
  integrantes: ["j1", "j2"],
  activo: true,
});
const torneo = () => ({
  nombre: "Copa nueva",
  juegoId: "g3",
  estado: "abierto",
  cupoMaximo: 4,
  fechaCierreInscripcion: "2030-02-01",
  fechaInicio: "2030-02-02",
});

describe("Servicio de Arena con almacenamiento y reloj aislados", () => {
  let store, storage, guardado;
  beforeEach(() => {
    guardado = new Map();
    storage = {
      getItem: jasmine
        .createSpy("getItem")
        .and.callFake((k) => guardado.get(k) || null),
      setItem: jasmine
        .createSpy("setItem")
        .and.callFake((k, v) => guardado.set(k, v)),
    };
    store = crearArenaStore({ storage, ahora: fecha });
  });
  it("persiste la semilla y conserva sus fechas al recargar", () => {
    const inicial = store.getSnapshot();
    expect(
      inicial.TORNEOS.find((t) => t.id === "t3").fechaCierreInscripcion,
    ).toBe("2030-01-22");
    expect(
      crearArenaStore({
        storage,
        ahora: () => new Date("2031-01-01"),
      }).getSnapshot(),
    ).toEqual(inicial);
    expect(storage.setItem).toHaveBeenCalled();
  });
  it("recupera JSON corrupto con un aviso", () => {
    guardado.set(CLAVE_DATOS, "{");
    const recuperado = crearArenaStore({ storage, ahora: fecha });
    expect(recuperado.getAviso()).toContain("demostración nueva");
    expect(recuperado.getSnapshot().TORNEOS.length).toBe(5);
  });
  it("rechaza estructuras incompatibles", () => {
    guardado.set(CLAVE_DATOS, JSON.stringify({ version: 2, datos: {} }));
    expect(crearArenaStore({ storage, ahora: fecha }).getAviso()).toContain(
      "demostración nueva",
    );
  });
  it("informa almacenamiento no disponible", () => {
    expect(crearArenaStore({ ahora: fecha }).getAviso()).toContain(
      "solo durante esta sesión",
    );
  });
  it("no aplica cambios si falla la escritura", () => {
    const previo = store.getSnapshot();
    storage.setItem.and.throwError("quota");
    expect(() =>
      store.actualizarPerfil(
        "j1",
        { nombre: "Nuevo nombre", apodo: "NuevoApodo", email: "nuevo@mail.cl" },
        jugador,
      ),
    ).toThrowError(/No se pudo guardar/);
    expect(store.getSnapshot()).toBe(previo);
  });
  it("publica una instantánea nueva y permite cancelar la suscripción", () => {
    const fn = jasmine.createSpy("cambio");
    const cancelar = store.subscribe(fn);
    store.guardarEquipo(equipo(), jugador);
    expect(fn).toHaveBeenCalledTimes(1);
    cancelar();
    store.guardarEquipo({ ...equipo(), nombre: "Segundo equipo" }, jugador);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it("protege la instantánea contra mutación externa", () => {
    expect(() => store.getSnapshot().EQUIPOS.push(equipo())).toThrow();
  });
  it("crea, lee, actualiza y elimina un equipo", () => {
    const id = store.guardarEquipo(equipo(), jugador);
    expect(store.getSnapshot().EQUIPOS.find((e) => e.id === id).nombre).toBe(
      "Equipo nuevo",
    );
    store.guardarEquipo({ ...equipo(), nombre: "Nombre editado" }, jugador, id);
    expect(store.getSnapshot().EQUIPOS.find((e) => e.id === id).nombre).toBe(
      "Nombre editado",
    );
    store.eliminarEquipo(id, jugador);
    expect(store.getSnapshot().EQUIPOS.some((e) => e.id === id)).toBeFalse();
  });
  [
    [{ nombre: "x" }, /nombre/],
    [{ nombre: "LOS GALLOS" }, /Ya existe/],
    [{ juegoId: "g3" }, /por equipos/],
    [{ integrantes: [] }, /integrantes/],
    [{ integrantes: ["j1", "j1"] }, /no repetirse/],
    [{ integrantes: ["j1", "inexistente"] }, /existir/],
    [{ capitanId: "j8" }, /capitán/],
    [{ capitanId: "j2" }, /Debes ser/],
    [{ integrantes: ["j1", "j2", "j4"] }, /entre 1 y 2/],
  ].forEach(([cambio, error], i) =>
    it(`rechaza equipo inválido ${i + 1}`, () =>
      expect(() =>
        store.guardarEquipo({ ...equipo(), ...cambio }, jugador),
      ).toThrowError(error)),
  );
  it("impide gestionar equipos ajenos", () =>
    expect(() => store.eliminarEquipo("e2", jugador)).toThrowError(/capitán/));
  it("impide modificar o eliminar equipos con historial", () => {
    expect(() => store.eliminarEquipo("e1", jugador)).toThrowError(/historial/);
    expect(() => store.guardarEquipo(equipo(), jugador, "e1")).toThrowError(
      /historial/,
    );
  });
  it("rechaza visitante y jugador inexistente", () => {
    expect(() => store.guardarEquipo(equipo(), visitante)).toThrowError(
      /perfil/,
    );
    expect(() =>
      store.guardarEquipo(equipo(), { ...jugador, jugadorId: "no" }),
    ).toThrowError(/no encontrado/);
  });
  it("actualiza el perfil y lo recupera tras recarga", () => {
    store.actualizarPerfil(
      "j1",
      {
        nombre: "  Nombre nuevo  ",
        apodo: "Nuev0_gg",
        email: "nuevo@example.cl",
      },
      jugador,
    );
    const nuevo = crearArenaStore({ storage, ahora: fecha }).getSnapshot()
      .JUGADORES[0];
    expect(nuevo.nombre).toBe("Nombre nuevo");
    expect(nuevo.email).toBe("nuevo@example.cl");
  });
  [
    [{ nombre: "" }, /nombre/],
    [{ apodo: "con espacios" }, /apodo/],
    [{ apodo: "jhn_shooter" }, /en uso/],
    [{ email: "a@b" }, /correo/],
  ].forEach(([cambio, error], i) =>
    it(`rechaza perfil inválido ${i + 1}`, () =>
      expect(() =>
        store.actualizarPerfil(
          "j1",
          {
            nombre: "Nombre correcto",
            apodo: "NuevoGG",
            email: "a@b.cl",
            ...cambio,
          },
          jugador,
        ),
      ).toThrowError(error)),
  );
  it("impide editar el perfil ajeno", () =>
    expect(() => store.actualizarPerfil("j2", {}, jugador)).toThrowError(
      /propio perfil/,
    ));
  it("inscribe al jugador, actualiza cupos y permite cancelar", () => {
    store.inscribir("t3", "j1", jugador);
    expect(
      store.getSnapshot().TORNEOS.find((t) => t.id === "t3")
        .participantesInscritos,
    ).toContain("j1");
    store.cancelarInscripcion("t3", "j1", jugador);
    expect(
      store.getSnapshot().TORNEOS.find((t) => t.id === "t3")
        .participantesInscritos,
    ).not.toContain("j1");
  });
  it("inscribe un equipo completo", () => {
    store.inscribir("t5", "e4", jugador);
    expect(
      store.getSnapshot().TORNEOS.find((t) => t.id === "t5")
        .participantesInscritos,
    ).toEqual(["e4"]);
  });
  it("rechaza duplicados", () => {
    store.inscribir("t3", "j1", jugador);
    expect(() => store.inscribir("t3", "j1", jugador)).toThrowError(
      /ya está inscrito/,
    );
  });
  it("rechaza jugador sancionado", () =>
    expect(() =>
      store.inscribir("t3", "j3", { ...jugador, jugadorId: "j3" }),
    ).toThrowError(/sanción/));
  it("rechaza inscripción ajena", () =>
    expect(() => store.inscribir("t3", "j2", jugador)).toThrowError(
      /propio perfil/,
    ));
  it("rechaza equipos de otro juego", () =>
    expect(() => store.inscribir("t1", "e4", jugador)).toThrowError(
      /otro juego/,
    ));
  it("rechaza equipo inactivo", () =>
    expect(() => store.inscribir("t1", "e3", admin)).toThrowError(/inactivo/));
  it("rechaza equipo incompleto", () => {
    const id = store.guardarEquipo({ ...equipo(), juegoId: "g5" }, jugador);
    expect(() => store.inscribir("t5", id, jugador)).toThrowError(
      /exactamente 4/,
    );
  });
  it("rechaza equipo con sancionados", () => {
    const id = store.guardarEquipo(
      { ...equipo(), juegoId: "g5", integrantes: ["j1", "j2", "j3", "j4"] },
      jugador,
    );
    expect(() => store.inscribir("t5", id, jugador)).toThrowError(
      /sancionados/,
    );
  });
  it("rechaza torneo inexistente o cerrado", () => {
    expect(() => store.inscribir("nada", "j1", jugador)).toThrowError(
      /no encontrado/,
    );
    expect(() => store.inscribir("t4", "j1", jugador)).toThrowError(
      /no está abierto/,
    );
  });
  it("rechaza inscripción vencida con reloj controlado", () => {
    const s = crearArenaStore({ storage, ahora: () => new Date("2031-01-01") });
    expect(() => s.inscribir("t3", "j1", jugador)).toThrowError(/plazo/);
  });
  it("rechaza torneo lleno", () => {
    const id = store.guardarTorneo({ ...torneo(), cupoMaximo: 1 }, admin);
    store.inscribir(id, "j1", jugador);
    expect(() => store.inscribir(id, "j2", admin)).toThrowError(/cupos/);
  });
  it("no cancela inscripciones ajenas ni inexistentes", () => {
    expect(() => store.cancelarInscripcion("t3", "j5", jugador)).toThrowError(
      /propio perfil/,
    );
    expect(() => store.cancelarInscripcion("t3", "j1", jugador)).toThrowError(
      /no está inscrito/,
    );
  });
  it("crea, actualiza y elimina un torneo vacío", () => {
    const organizador = { ...jugador, rol: "organizador" };
    const id = store.guardarTorneo(torneo(), organizador);
    store.guardarTorneo(
      { ...torneo(), nombre: "Copa editada" },
      organizador,
      id,
    );
    expect(store.getSnapshot().TORNEOS.find((t) => t.id === id).nombre).toBe(
      "Copa editada",
    );
    store.eliminarTorneo(id, organizador);
    expect(store.getSnapshot().TORNEOS.some((t) => t.id === id)).toBeFalse();
  });
  [
    [{ nombre: "x" }, /nombre/],
    [{ juegoId: "otro" }, /juego/],
    [{ estado: "otro" }, /Estado/],
    [{ cupoMaximo: 0 }, /cupo/],
    [{ cupoMaximo: 1.5 }, /cupo/],
    [{ fechaInicio: "2030-02-30" }, /fechas/],
    [{ fechaInicio: "2030-01-01" }, /posterior/],
    [{ fechaCierreInscripcion: "2029-12-01" }, /vigente/],
  ].forEach(([cambio, error], i) =>
    it(`rechaza torneo inválido ${i + 1}`, () =>
      expect(() =>
        store.guardarTorneo({ ...torneo(), ...cambio }, admin),
      ).toThrowError(error)),
  );
  it("protege torneos con participantes", () => {
    const t = store.getSnapshot().TORNEOS.find((t) => t.id === "t3");
    expect(() => store.eliminarTorneo("t3", admin)).toThrowError(
      /participantes/,
    );
    expect(() =>
      store.guardarTorneo({ ...t, cupoMaximo: 1 }, admin, t.id),
    ).toThrowError(/menor/);
    expect(() =>
      store.guardarTorneo({ ...t, juegoId: "g4" }, admin, t.id),
    ).toThrowError(/cambiar el juego/);
  });
  it("impide retroceder estados de torneos", () => {
    const t = store.getSnapshot().TORNEOS.find((t) => t.id === "t4");
    expect(() =>
      store.guardarTorneo({ ...t, estado: "abierto" }, admin, t.id),
    ).toThrowError(/retroceder/);
  });
  it("restringe la administración y el reinicio", () => {
    expect(() => store.guardarTorneo(torneo(), jugador)).toThrowError(
      /organizadores/,
    );
    expect(() => store.eliminarTorneo("t5", jugador)).toThrowError(
      /organizadores/,
    );
    expect(() => store.restablecer(jugador)).toThrowError(/administrador/);
    store.inscribir("t3", "j1", jugador);
    store.restablecer(admin);
    expect(store.getSnapshot()).toEqual(crearSemilla(fecha()));
  });
  it('migra Rocket League sin perder perfiles ni equipos existentes y no repite la migración', () => {
    const anterior = crearSemilla(fecha());
    const historico = anterior.TORNEOS.find(t => t.id === 't4');
    historico.nombre = 'Copa de Ajedrez finalizada'; historico.juegoId = 'g3'; historico.participantesInscritos = ['j3', 'j7'];
    anterior.PARTIDAS.find(p => p.torneoId === 't4').participanteA = 'j3';
    anterior.PARTIDAS.find(p => p.torneoId === 't4').participanteB = 'j7';
    anterior.RANKINGS.t4 = [{ participanteId: 'j3', puntos: 9, diferencia: 5 }];
    anterior.JUGADORES[0].apodo = 'PerfilConservado';
    guardado.set(CLAVE_DATOS, JSON.stringify({ version: 2, datos: anterior }));
    const migrado = crearArenaStore({ storage, ahora: fecha });
    const d = migrado.getSnapshot();
    expect(d.JUGADORES[0].apodo).toBe('PerfilConservado');
    expect(d.EQUIPOS.find(e => e.id === 'e5').nombre).toBe('Rocket Arena');
    const t = d.TORNEOS.find(t => t.id === 't4');
    expect(t.juegoId).toBe('g4'); expect(t.participantesInscritos).not.toContain('e5');
    expect(t.participantesInscritos).toContain(d.RANKINGS.t4[0].participanteId);
    expect(crearArenaStore({ storage, ahora: fecha }).getSnapshot()).toEqual(d);
  });

});
