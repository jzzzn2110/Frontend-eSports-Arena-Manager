import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { ArenaProvider } from "../src/context/ArenaContext.jsx";
import { crearArenaStore } from "../src/services/crearArenaStore.js";
import App from "../src/App.jsx";
import Torneos from "../src/pages/Torneos.jsx";
import TorneoDetalle from "../src/pages/TorneoDetalle.jsx";
import Inscripcion from "../src/pages/Inscripcion.jsx";
import Equipo from "../src/pages/Equipo.jsx";
import Perfil from "../src/pages/Perfil.jsx";
import Administracion from "../src/pages/Administracion.jsx";
import TarjetaTorneo from "../src/components/TarjetaTorneo.jsx";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("Componentes y rutas de Arena", () => {
  let contenedor, raiz, store;
  const actor = { rol: "jugador", jugadorId: "j1" };
  beforeEach(() => {
    localStorage.removeItem("esports-arena-sesion-v2");
    store = crearArenaStore({
      ahora: () => new Date("2030-01-01T12:00:00"),
      storage: { getItem: () => null, setItem: jasmine.createSpy("persistir") },
    });
    contenedor = document.createElement("div");
    document.body.appendChild(contenedor);
    raiz = createRoot(contenedor);
  });
  afterEach(() => {
    act(() => raiz.unmount());
    contenedor.remove();
    localStorage.removeItem("esports-arena-sesion-v2");
  });
  const montar = (componente, ruta = "/") =>
    act(() =>
      raiz.render(
        <MemoryRouter
          initialEntries={[ruta]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <ArenaProvider store={store}>{componente}</ArenaProvider>
        </MemoryRouter>,
      ),
    );
  const cambiar = (selector, valor) =>
    act(() => {
      const el = contenedor.querySelector(selector);
      const proto =
        el.tagName === "SELECT"
          ? HTMLSelectElement.prototype
          : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(el, valor);
      el.dispatchEvent(
        new Event(el.tagName === "SELECT" ? "change" : "input", {
          bubbles: true,
        }),
      );
    });
  const clic = (selector) =>
    act(() => contenedor.querySelector(selector).click());
  const enviar = () =>
    act(() =>
      contenedor
        .querySelector("form")
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
  const texto = () => contenedor.textContent;

  [
    "/index.html",
    "/torneos.html",
    "/torneo-detalle.html?id=t1",
    "/inscripcion.html?torneo=t3",
    "/equipo.html",
    "/perfil.html",
    "/administracion.html",
    "/no-existe",
  ].forEach((ruta) =>
    it(`renderiza la ruta ${ruta} sin errores`, () => {
      montar(<App />, ruta);
      expect(contenedor.querySelector("main")).not.toBeNull();
    }),
  );
  it("filtra torneos y limpia la búsqueda sin ciclos de renderizado", () => {
    montar(<Torneos />);
    cambiar("#busqueda", "Ajedrez");
    expect(texto()).toContain("1 torneo encontrado");
    clic("button");
    expect(texto()).toContain("5 torneos encontrados");
  });
  it("muestra resultado vacío", () => {
    montar(<Torneos />);
    cambiar("#busqueda", "inexistente");
    expect(texto()).toContain("No hay torneos");
  });
  it("valida el rango y elimina el error al corregirlo", () => {
    montar(<Torneos />);
    cambiar("#desde", "2030-03-01");
    cambiar("#hasta", "2030-02-01");
    expect(contenedor.querySelector('[role="alert"]').textContent).toContain(
      "posterior",
    );
    cambiar("#hasta", "2030-04-01");
    expect(contenedor.querySelector('[role="alert"]')).toBeNull();
  });
  it("lee el filtro de estado desde la URL", () => {
    montar(<Torneos />, "/torneos.html?estado=abierto");
    expect(texto()).toContain("3 torneos encontrados");
  });
  it("muestra torneo inexistente", () => {
    montar(<TorneoDetalle />, "/torneo-detalle.html?id=no");
    expect(texto()).toContain("Torneo no encontrado");
  });
  it("muestra participantes por definir y calendario", () => {
    montar(<TorneoDetalle />, "/torneo-detalle.html?id=t2");
    expect(texto()).toContain("Por definir");
    expect(texto()).toContain("Partidas");
  });
  it("muestra ranking y premios en el torneo finalizado", () => {
    montar(<TorneoDetalle />, "/torneo-detalle.html?id=t4");
    expect(texto()).toContain("Rocket Arena");
    expect(texto()).toContain("150.000");
  });
  it("renderiza datos recibidos por props en una tarjeta", () => {
    const datos = store.getSnapshot();
    montar(
      <TarjetaTorneo
        torneo={datos.TORNEOS[0]}
        juego={datos.JUEGOS.find((j) => j.id === "g1")}
        mostrarInscripcion
      />,
    );
    expect(texto()).toContain("Copa Arena");
    expect(
      contenedor.querySelector('a[href*="inscripcion"]').getAttribute("href"),
    ).toContain("torneo=t1");
    expect(
      contenedor
        .querySelector('[role="progressbar"]')
        .getAttribute("aria-valuenow"),
    ).toBe("13");
  });
  it("completa inscripción individual y cancelación con cambio real de datos", () => {
    montar(<Inscripcion actor={actor} />, "/inscripcion.html?torneo=t3");
    expect(texto()).toContain("Participante individual");
    clic("#confirmacion");
    enviar();
    expect(texto()).toContain("Inscripción registrada");
    expect(
      store.getSnapshot().TORNEOS.find((t) => t.id === "t3")
        .participantesInscritos,
    ).toContain("j1");
    clic("button");
    expect(texto()).toContain("Inscripción cancelada");
  });
  it("inscribe el equipo elegido y actualiza cupos", () => {
    montar(<Inscripcion actor={actor} />, "/inscripcion.html?torneo=t5");
    cambiar("#equipo-selector", "e4");
    clic("#confirmacion");
    enviar();
    expect(texto()).toContain("7 cupos disponibles");
    expect(texto()).toContain("Inscripción registrada");
  });
  it("muestra error del servicio simulado sin falso éxito", () => {
    spyOn(store, "inscribir").and.throwError(
      "Fallo simulado de almacenamiento",
    );
    montar(<Inscripcion actor={actor} />, "/inscripcion.html?torneo=t3");
    clic("#confirmacion");
    enviar();
    expect(texto()).toContain("Fallo simulado");
    expect(texto()).not.toContain("Inscripción registrada");
  });
  it("exige confirmación incluso al enviar programáticamente", () => {
    montar(<Inscripcion actor={actor} />, "/inscripcion.html?torneo=t3");
    enviar();
    expect(texto()).toContain("Confirma los datos");
  });
  it("bloquea al visitante y a los torneos cerrados", () => {
    montar(
      <Inscripcion actor={{ ...actor, rol: "visitante" }} />,
      "/inscripcion.html?torneo=t4",
    );
    expect(texto()).toContain("están cerradas");
    expect(contenedor.querySelector("button").disabled).toBeTrue();
  });
  it("crea un equipo y agrega integrantes mediante eventos", () => {
    montar(<Equipo actor={actor} />);
    cambiar("#nombre-equipo", "Equipo DOM");
    cambiar("#agregar-jugador", "j2");
    clic('button[type="button"]');
    enviar();
    expect(texto()).toContain("Equipo guardado");
    expect(
      store.getSnapshot().EQUIPOS.find((e) => e.nombre === "Equipo DOM")
        .integrantes.length,
    ).toBe(2);
  });
  it("muestra errores de equipo", () => {
    montar(<Equipo actor={actor} />);
    enviar();
    expect(texto()).toContain("entre 3 y 60");
  });
  it("edita el perfil y actualiza su encabezado", () => {
    montar(<Perfil actor={actor} />);
    cambiar("#perfil-apodo", "NuevoApodo");
    enviar();
    expect(contenedor.querySelector("h1").textContent).toContain("NuevoApodo");
    expect(texto()).toContain("Perfil actualizado");
  });
  it("rechaza correo inválido desde el formulario", () => {
    montar(<Perfil actor={actor} />);
    cambiar("#perfil-email", "correo");
    enviar();
    expect(texto()).toContain("correo válido");
  });
  it("no inventa historial para un jugador sin inscripciones", () => {
    const vacios = JSON.parse(JSON.stringify(store.getSnapshot()));
    vacios.TORNEOS.forEach((t) => {
      t.participantesInscritos = [];
    });
    store = crearArenaStore({ semilla: () => vacios });
    montar(<Perfil actor={actor} />);
    expect(texto()).toContain("No tienes inscripciones registradas");
    expect(texto()).not.toContain("Torneo Táctico Elite");
  });
  it("restringe el panel administrativo", () => {
    montar(<Administracion actor={actor} />);
    expect(texto()).toContain("Organizador o Administrador");
    expect(contenedor.querySelector("form")).toBeNull();
  });
  it("crea torneos desde el panel", () => {
    montar(<Administracion actor={{ ...actor, rol: "organizador" }} />);
    cambiar("#torneo-nombre-input", "Copa DOM");
    cambiar("#torneo-cierre-input", "2030-02-01");
    cambiar("#torneo-inicio-input", "2030-02-02");
    enviar();
    expect(texto()).toContain("Torneo guardado");
    expect(store.getSnapshot().TORNEOS.length).toBe(6);
  });
  it("cambia el perfil simulado y permite navegar a administración", () => {
    montar(<App />, "/administracion.html");
    cambiar("#perfil-simulado", "administrador");
    expect(texto()).toContain("Restablecer demostración");
    expect(
      JSON.parse(localStorage.getItem("esports-arena-sesion-v2")).rol,
    ).toBe("administrador");
  });
  it("confirma la eliminación de un equipo y actualiza el DOM", () => {
    const id = store.guardarEquipo(
      {
        nombre: "Equipo borrable",
        juegoId: "g4",
        capitanId: "j1",
        integrantes: ["j1"],
        activo: true,
      },
      actor,
    );
    montar(<Equipo actor={actor} />);
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent.includes("Eliminar Equipo borrable"))
        .click(),
    );
    expect(texto()).toContain("Se eliminará el equipo");
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent === "Confirmar eliminación")
        .click(),
    );
    expect(texto()).toContain("Equipo eliminado");
    expect(store.getSnapshot().EQUIPOS.some((e) => e.id === id)).toBeFalse();
  });
  it("edita un equipo y permite cancelar la edición", () => {
    store.guardarEquipo(
      {
        nombre: "Equipo editable",
        juegoId: "g4",
        capitanId: "j1",
        integrantes: ["j1"],
        activo: true,
      },
      actor,
    );
    montar(<Equipo actor={actor} />);
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent.includes("Editar Equipo editable"))
        .click(),
    );
    cambiar("#nombre-equipo", "Equipo cambiado");
    enviar();
    expect(texto()).toContain("Equipo cambiado");
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent.includes("Editar Equipo cambiado"))
        .click(),
    );
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent === "Cancelar edición")
        .click(),
    );
    expect(contenedor.querySelector("#nombre-equipo").value).toBe("");
  });
  it("editar y eliminar un torneo actualiza la tabla", () => {
    const admin = { ...actor, rol: "administrador" };
    const id = store.guardarTorneo(
      {
        nombre: "Copa editable",
        juegoId: "g3",
        estado: "abierto",
        cupoMaximo: 8,
        fechaCierreInscripcion: "2030-02-01",
        fechaInicio: "2030-02-02",
      },
      admin,
    );
    montar(<Administracion actor={admin} />);
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent.includes("Editar Copa editable"))
        .click(),
    );
    cambiar("#torneo-nombre-input", "Copa cambiada");
    enviar();
    expect(texto()).toContain("Copa cambiada");
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent.includes("Eliminar Copa cambiada"))
        .click(),
    );
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent === "Conservar")
        .click(),
    );
    expect(store.getSnapshot().TORNEOS.some((t) => t.id === id)).toBeTrue();
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent.includes("Eliminar Copa cambiada"))
        .click(),
    );
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent === "Confirmar eliminación")
        .click(),
    );
    expect(store.getSnapshot().TORNEOS.some((t) => t.id === id)).toBeFalse();
  });
  it("informa la validación de torneo en el panel", () => {
    montar(<Administracion actor={{ ...actor, rol: "administrador" }} />);
    enviar();
    expect(texto()).toContain("entre 3 y 80");
  });
  it("restablece datos tras confirmación del administrador", () => {
    store.inscribir("t3", "j1", actor);
    montar(<Administracion actor={{ ...actor, rol: "administrador" }} />);
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent === "Restablecer demostración")
        .click(),
    );
    act(() =>
      [...contenedor.querySelectorAll("button")]
        .find((b) => b.textContent === "Confirmar eliminación")
        .click(),
    );
    expect(texto()).toContain("Demostración restablecida");
    expect(
      store.getSnapshot().TORNEOS.find((t) => t.id === "t3")
        .participantesInscritos,
    ).not.toContain("j1");
  });
});
