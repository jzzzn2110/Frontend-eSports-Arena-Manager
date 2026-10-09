(function () {
  'use strict';

  // Consumir datos globales cargados desde datos.js
  const datos = window.ARENA && window.ARENA.datos;
  if (!datos) {
    return;
  }

  const JUEGOS = datos.JUEGOS;
  const JUGADORES = datos.JUGADORES;
  const EQUIPOS = datos.EQUIPOS;

  // Variables globales del módulo
  let integrantesSeleccionados = [];
  let selectCapitan;
  let listaIntegrantesUI;
  let contadorIntegrantesUI;

  function renderizarIntegrantes() {
    contadorIntegrantesUI.textContent = integrantesSeleccionados.length;

    if (integrantesSeleccionados.length === 0) {
      listaIntegrantesUI.innerHTML = '<li>Sin integrantes asignados.</li>';
      return;
    }

    const capitanActualId = selectCapitan.value;
    let html = '';

    integrantesSeleccionados.forEach((id) => {
      const jugador = datos.obtenerJugadorPorId(id);
      const apodo = jugador ? jugador.apodo : id;
      const esCapitan = id === capitanActualId;
      const rolTexto = esCapitan ? 'Capitán' : 'Miembro';

      html += '<li>' +
                '<span>' + datos.escaparHTML(apodo) + ' — <strong>' + rolTexto + '</strong></span> ' +
                '<button type="button" class="boton-secundario" onclick="quitarIntegrante(\'' + id + '\')">Quitar</button>' +
              '</li>';
    });

    listaIntegrantesUI.innerHTML = html;
  }

  // Actualizar el combo desplegable de Capitán con los integrantes añadidos
  function actualizarComboCapitan() {
    const capitanPrevio = selectCapitan.value;
    selectCapitan.innerHTML = '<option value="">Selecciona al capitán...</option>';

    integrantesSeleccionados.forEach((id) => {
      const jugador = datos.obtenerJugadorPorId(id);
      const apodo = jugador ? jugador.apodo : id;

      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = apodo;
      selectCapitan.appendChild(opt);
    });

    if (integrantesSeleccionados.includes(capitanPrevio)) {
      selectCapitan.value = capitanPrevio;
    }
  }

  // Función global para quitar integrante desde el botón en línea (onclick)
  window.quitarIntegrante = function (id) {
    integrantesSeleccionados = integrantesSeleccionados.filter((item) => item !== id);
    if (selectCapitan.value === id) {
      selectCapitan.value = '';
    }
    actualizarComboCapitan();
    renderizarIntegrantes();
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const formulario = document.getElementById('formulario-equipo');
    const inputNombre = document.getElementById('nombre-equipo');
    const selectJuego = document.getElementById('juego-principal');
    const selectAgregarJugador = document.getElementById('agregar-jugador-select');
    const btnAgregarJugador = document.getElementById('btn-agregar-jugador');

    selectCapitan = document.getElementById('capitan-equipo');
    listaIntegrantesUI = document.getElementById('lista-integrantes');
    contadorIntegrantesUI = document.getElementById('contador-integrantes');

    const avisoError = document.getElementById('aviso-error-general');
    const mensajeError = document.getElementById('mensaje-error-general');
    const avisoExito = document.getElementById('aviso-exito-equipo');
    const mensajeExito = document.getElementById('mensaje-exito-equipo');

    // Cargar juegos en el combo desplegable
    JUEGOS.forEach((juego) => {
      const opt = document.createElement('option');
      opt.value = juego.id;
      opt.textContent = juego.nombre;
      selectJuego.appendChild(opt);
    });

    // Cargar jugadores disponibles en el combo desplegable
    JUGADORES.forEach((jugador) => {
      const opt = document.createElement('option');
      opt.value = jugador.id;
      opt.textContent = jugador.apodo + ' (' + jugador.nombre + ')';
      selectAgregarJugador.appendChild(opt);
    });

    // Evento al cambiar la selección de Capitán para actualizar el rol en la lista
    selectCapitan.addEventListener('change', () => {
      renderizarIntegrantes();
    });

    // Evento al presionar "Agregar" jugador
    btnAgregarJugador.addEventListener('click', () => {
      const idJugador = selectAgregarJugador.value;
      document.getElementById('error-integrantes').textContent = '';

      if (!idJugador) {
        document.getElementById('error-integrantes').textContent = 'Selecciona un jugador para agregar.';
        return;
      }

      if (integrantesSeleccionados.includes(idJugador)) {
        document.getElementById('error-integrantes').textContent = 'El jugador ya está en la plantilla.';
        return;
      }

      integrantesSeleccionados.push(idJugador);
      actualizarComboCapitan();
      renderizarIntegrantes();
      selectAgregarJugador.value = '';
    });

    // Enviar y validar formulario
    formulario.addEventListener('submit', (e) => {
      e.preventDefault();

      // Limpiar mensajes de error previos
      document.querySelectorAll('.mensaje-error').forEach((el) => (el.textContent = ''));
      avisoError.classList.add('oculto');
      avisoExito.classList.add('oculto');

      let hayError = false;
      const nombreVal = inputNombre.value.trim();
      const juegoVal = selectJuego.value;
      const capitanVal = selectCapitan.value;

      // Validar Nombre
      if (!nombreVal) {
        document.getElementById('error-nombre-equipo').textContent = 'El nombre es obligatorio.';
        hayError = true;
      } else {
        const existe = EQUIPOS.some((eq) => eq.nombre.toLowerCase() === nombreVal.toLowerCase());
        if (existe) {
          document.getElementById('error-nombre-equipo').textContent = 'Ya existe un equipo con este nombre.';
          hayError = true;
        }
      }

      // Validar Juego
      if (!juegoVal) {
        document.getElementById('error-juego-principal').textContent = 'Selecciona un juego.';
        hayError = true;
      }

      // Validar Capitán
      if (!capitanVal) {
        document.getElementById('error-capitan-equipo').textContent = 'Selecciona un capitán.';
        hayError = true;
      }

      // Validar Integrantes
      if (integrantesSeleccionados.length === 0) {
        document.getElementById('error-integrantes').textContent = 'Agrega al menos un integrante.';
        hayError = true;
      }

      if (hayError) {
        avisoError.classList.remove('oculto');
        mensajeError.textContent = 'Por favor, corrige los errores del formulario.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Crear objeto del nuevo equipo e inserta en el arreglo global EQUIPOS
      const nuevoEquipo = {
        id: 'e' + (EQUIPOS.length + 1),
        nombre: nombreVal,
        juegoId: juegoVal,
        capitanId: capitanVal,
        activo: true,
        integrantes: integrantesSeleccionados.map((id) => ({
          jugadorId: id,
          rol: id === capitanVal ? 'Capitán' : 'Miembro'
        }))
      };

      EQUIPOS.push(nuevoEquipo);

      // Reiniciar formulario y vista
      formulario.reset();
      integrantesSeleccionados = [];
      actualizarComboCapitan();
      renderizarIntegrantes();

      // Mostrar mensaje de éxito
      avisoExito.classList.remove('oculto');
      mensajeExito.innerHTML = '¡Equipo <strong>' + datos.escaparHTML(nuevoEquipo.nombre) + '</strong> creado con éxito!';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();