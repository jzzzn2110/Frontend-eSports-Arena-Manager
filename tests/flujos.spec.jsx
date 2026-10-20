import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';

import { ArenaProvider } from '../src/context/ArenaContext.jsx';
import { crearArenaStore } from '../src/services/crearArenaStore.js';
import Torneos from '../src/pages/Torneos.jsx';
import Inscripcion from '../src/pages/Inscripcion.jsx';
import Administracion from '../src/pages/Administracion.jsx';

// Indica que React está ejecutándose en un entorno de pruebas.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Flujos de eSports Arena Manager', () => {
  const actor = { rol: 'jugador', jugadorId: 'j1' };
  let store, storage, contenedor, raiz;

  beforeEach(() => {
    // Mock de almacenamiento: cada prueba usa sus propios datos.
    const guardado = new Map();

    storage = {
      getItem: jasmine.createSpy('getItem').and.callFake(
        (clave) => guardado.get(clave) ?? null
      ),
      setItem: jasmine.createSpy('setItem').and.callFake(
        (clave, valor) => guardado.set(clave, valor)
      ),
    };

    store = crearArenaStore({ storage });

    contenedor = document.createElement('div');
    document.body.appendChild(contenedor);
    raiz = createRoot(contenedor);
  });

  afterEach(() => {
    // Limpia el componente después de cada prueba.
    act(() => raiz.unmount());
    contenedor.remove();
  });

  function montar(componente, ruta = '/torneos.html') {
    act(() => {
      raiz.render(
        <MemoryRouter initialEntries={[ruta]}>
          <ArenaProvider store={store}>
            {componente}
          </ArenaProvider>
        </MemoryRouter>
      );
    });
  }

  function obtenerTorneo(servicio = store) {
    return servicio.getSnapshot().TORNEOS.find(
      (torneo) => torneo.id === 't3'
    );
  }

  function boton(texto) {
    return [...contenedor.querySelectorAll('button')].find(
      (elemento) => elemento.textContent.trim() === texto
    );
  }

  // Prueba 4: persistencia de una inscripción.
  it('guarda una inscripción y la recupera al crear otro servicio', () => {
    store.inscribir('t3', 'j1', actor);

    const recuperado = crearArenaStore({ storage });

    expect(obtenerTorneo(recuperado).participantesInscritos)
      .toContain('j1');

    expect(storage.setItem).toHaveBeenCalled();
  });

  // Prueba 5: evita participantes duplicados.
  it('rechaza una inscripción duplicada sin cambiar los datos', () => {
    store.inscribir('t3', 'j1', actor);

    const antes = store.getSnapshot();

    expect(() => store.inscribir('t3', 'j1', actor))
      .toThrowError(/ya está inscrito/);

    expect(store.getSnapshot()).toBe(antes);
  });

  // Prueba 6: simula un fallo al guardar.
  it('conserva los datos si falla el almacenamiento', () => {
    const antes = store.getSnapshot();

    storage.setItem.and.throwError('Almacenamiento lleno');

    expect(() => store.inscribir('t3', 'j1', actor))
      .toThrowError(/no se aplicaron cambios/);

    expect(store.getSnapshot()).toBe(antes);

    expect(obtenerTorneo().participantesInscritos)
      .not.toContain('j1');
  });

  // Prueba 7: comprueba los permisos del capitán.
  it('impide inscribir un equipo si el jugador no es su capitán', () => {
    const integrante = {
      rol: 'jugador',
      jugadorId: 'j2',
    };

    expect(() => store.inscribir('t5', 'e4', integrante))
      .toThrowError(/capitán/);

    const torneo = store.getSnapshot().TORNEOS.find(
      (elemento) => elemento.id === 't5'
    );

    expect(torneo.participantesInscritos).not.toContain('e4');
  });

  // Prueba 8: escribe en el buscador y revisa el DOM.
  it('filtra los torneos al escribir en el buscador', () => {
    montar(<Torneos />);

    const campo = contenedor.querySelector('#busqueda');

    act(() => {
      // Usa el setter nativo para que React detecte el cambio.
      const asignar = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      ).set;

      asignar.call(campo, 'Minecraft');

      campo.dispatchEvent(
        new Event('input', { bubbles: true })
      );
    });

    expect(contenedor.querySelector('[role="status"]').textContent)
      .toContain('1 torneo encontrado');

    expect(contenedor.querySelectorAll('article').length).toBe(1);

    expect(contenedor.querySelector('article').textContent)
      .toContain('Minecraft');
  });

  // Prueba 9: utiliza el formulario de inscripción.
  it('exige confirmar, registra la inscripción y permite cancelarla', () => {
    montar(
      <Inscripcion actor={actor} />,
      '/inscripcion.html?torneo=t3'
    );

    expect(boton('Completar inscripción').disabled).toBeTrue();

    act(() => {
      contenedor.querySelector('#confirmacion').click();
    });

    expect(boton('Completar inscripción').disabled).toBeFalse();

    act(() => boton('Completar inscripción').click());

    expect(obtenerTorneo().participantesInscritos).toContain('j1');

    expect(contenedor.querySelector('[role="alert"]').textContent)
      .toContain('Inscripción registrada');

    act(() => boton('Cancelar inscripción').click());

    expect(obtenerTorneo().participantesInscritos)
      .not.toContain('j1');

    expect(contenedor.querySelector('[role="alert"]').textContent)
      .toContain('Inscripción cancelada');
  });

  // Prueba 10: comprueba la pantalla según el rol.
  it('oculta el formulario de administración al rol jugador', () => {
    montar(
      <Administracion actor={actor} />,
      '/administracion.html'
    );

    expect(contenedor.querySelector('form')).toBeNull();

    expect(contenedor.textContent)
      .toContain(
        'Selecciona el perfil Organizador o Administrador'
      );
  });
});