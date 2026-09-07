(function () {
  'use strict';

  // 1. Extraer los datos desde el mismo origen que usa torneos.js
  const {
    TORNEOS = [],
    JUEGOS = [],
    EQUIPOS = [],
    JUGADORES = [], // Si en datos.js se llama USUARIOS, cambia esta constante
    formatearFecha
  } = (window.ARENA && window.ARENA.datos) ? window.ARENA.datos : {};

  document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario-inscripcion');
    const avisoError = document.getElementById('aviso-error-general');
    const mensajeError = document.getElementById('mensaje-error-general');
    const avisoExito = document.getElementById('exito-inscripcion');
    const selectorTorneo = document.getElementById('selector-torneo');
    const fieldsetSelectorTorneo = document.getElementById('fieldset-selector-torneo');

    const infoTorneo = document.getElementById('info-torneo');
    const elNombre = document.getElementById('torneo-nombre');
    const elJuegoMod = document.getElementById('torneo-juego-modalidad');
    const elEstado = document.getElementById('torneo-estado');
    const elCierre = document.getElementById('torneo-cierre');
    const elCupos = document.getElementById('torneo-cupos');

    const radiosTipo = document.getElementsByName('tipo-participante');
    const divEquipo = document.getElementById('contenedor-equipo');
    const divIndividual = document.getElementById('contenedor-individual');
    const selectEquipo = document.getElementById('equipo-selector');
    const selectIndividual = document.getElementById('participante-individual');
    const checkConfirmacion = document.getElementById('confirmacion-datos');

    let torneoActual = null;

    // 2. Leer el parámetro correcto de la URL configurado en torneos.js
    const parametrosURL = new URLSearchParams(window.location.search);
    const idTorneoURL = parametrosURL.get('torneo');

    if (TORNEOS.length === 0) {
      mostrarErrorGeneral('No se pudo cargar la base de datos de torneos. Verifica el archivo datos.js');
      return;
    }

    // 3. Evaluar la URL o activar el modo manual
    if (idTorneoURL && TORNEOS.find(t => String(t.id) === String(idTorneoURL))) {
      torneoActual = TORNEOS.find(t => String(t.id) === String(idTorneoURL));
      cargarDatosTorneo(torneoActual);
      formulario.classList.remove('oculto');
    } else {
      // Fallback: Mostrar desplegable si el usuario entró directo a inscripcion.html
      const torneosAbiertos = TORNEOS.filter(t => String(t.estado).toLowerCase() === 'abierto');
      if (torneosAbiertos.length > 0) {
        fieldsetSelectorTorneo.classList.remove('oculto');
        formulario.classList.remove('oculto');
        infoTorneo.classList.add('oculto');

        torneosAbiertos.forEach(t => {
          const opcion = document.createElement('option');
          opcion.value = t.id;
          const fechaCierre = formatearFecha ? formatearFecha(t.fechaCierreInscripcion) : t.fechaCierreInscripcion;
          opcion.textContent = `${t.nombre} - Cierre: ${fechaCierre}`;
          selectorTorneo.appendChild(opcion);
        });
      } else {
        mostrarErrorGeneral('No hay torneos con inscripciones abiertas en este momento.');
      }
    }

    cargarSelects();

    // 4. Listeners del formulario
    selectorTorneo.addEventListener('change', (e) => {
      const idSeleccionado = e.target.value;
      if (idSeleccionado) {
        torneoActual = TORNEOS.find(t => String(t.id) === String(idSeleccionado));
        cargarDatosTorneo(torneoActual);
        infoTorneo.classList.remove('oculto');
        limpiarErrores();
      } else {
        infoTorneo.classList.add('oculto');
        torneoActual = null;
      }
    });

    radiosTipo.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'equipo') {
          divEquipo.classList.remove('oculto');
          divIndividual.classList.add('oculto');
        } else {
          divEquipo.classList.add('oculto');
          divIndividual.classList.remove('oculto');
        }
        limpiarErrores();
      });
    });

    formulario.addEventListener('submit', (e) => {
      e.preventDefault();
      limpiarErrores();
      let hayErrores = false;

      if (!torneoActual) {
        document.getElementById('error-selector-torneo').textContent = 'Debes seleccionar un torneo válido.';
        hayErrores = true;
      } else {
        if (String(torneoActual.estado).toLowerCase() !== 'abierto') {
          mostrarErrorGeneral('Las inscripciones para este torneo ya están cerradas.');
          return;
        }
      }

      const esEquipo = document.getElementById('tipo-equipo').checked;
      if (esEquipo && selectEquipo.value === "") {
        document.getElementById('error-equipo').textContent = 'Debes seleccionar un equipo.';
        hayErrores = true;
      } else if (!esEquipo && selectIndividual.value === "") {
        document.getElementById('error-individual').textContent = 'Debes seleccionar tu perfil de jugador.';
        hayErrores = true;
      }

      if (!checkConfirmacion.checked) {
        document.getElementById('error-confirmacion').textContent = 'Debes confirmar los datos para continuar.';
        hayErrores = true;
      }

      if (!hayErrores) {
        formulario.classList.add('oculto');
        avisoExito.classList.remove('oculto');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // 5. Funciones auxiliares vinculadas a tu estructura de datos
    function cargarDatosTorneo(torneo) {
      let nombreJuego = 'Juego del torneo';
      let modalidadJuego = '';
      
      if (JUEGOS.length > 0) {
        const juego = JUEGOS.find(j => String(j.id) === String(torneo.juegoId));
        if (juego) {
          nombreJuego = juego.nombre;
          modalidadJuego = juego.modalidad;
        }
      }

      elNombre.textContent = torneo.nombre || 'Torneo';
      elJuegoMod.textContent = `${nombreJuego} ${modalidadJuego ? '• ' + modalidadJuego : ''}`;
      elEstado.textContent = torneo.estado ? torneo.estado.toUpperCase() : 'DESCONOCIDO';
      
      elCierre.textContent = formatearFecha 
        ? formatearFecha(torneo.fechaCierreInscripcion) 
        : (torneo.fechaCierreInscripcion || 'Pronto');
      
      const cuposMaximos = torneo.cupoMaximo || 0;
      const cuposOcupados = torneo.participantesInscritos ? torneo.participantesInscritos.length : 0;
      elCupos.textContent = `${cuposMaximos - cuposOcupados} disponibles`;

      if (String(torneo.estado).toLowerCase() === 'abierto') {
        elEstado.style.backgroundColor = 'var(--color-acento)';
        elEstado.style.color = 'var(--color-fondo)';
      } else {
        elEstado.style.backgroundColor = 'var(--color-error)';
        elEstado.style.color = 'white';
      }
    }

    function cargarSelects() {
      if (EQUIPOS.length > 0) {
        EQUIPOS.forEach(eq => {
          const op = document.createElement('option');
          op.value = eq.id;
          op.textContent = eq.nombre;
          selectEquipo.appendChild(op);
        });
      } else {
        // Fallback si no hay equipos en datos.js
        selectEquipo.innerHTML = '<option value="1">Equipo Alpha (Simulado)</option><option value="2">Equipo Beta (Simulado)</option>';
      }

      if (JUGADORES.length > 0) {
        JUGADORES.forEach(us => {
          const op = document.createElement('option');
          op.value = us.id;
          op.textContent = us.apodo || us.nombre || `Jugador ${us.id}`;
          selectIndividual.appendChild(op);
        });
      } else {
        // Fallback si no hay jugadores en datos.js
        selectIndividual.innerHTML = '<option value="1">Jugador 1 (Simulado)</option><option value="2">Jugador 2 (Simulado)</option>';
      }
    }

    function limpiarErrores() {
      document.querySelectorAll('.mensaje-error').forEach(el => el.textContent = '');
      avisoError.classList.add('oculto');
    }

    function mostrarErrorGeneral(mensaje) {
      avisoError.classList.remove('oculto');
      mensajeError.textContent = mensaje;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
})();