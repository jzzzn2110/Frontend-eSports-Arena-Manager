(function () {
  'use strict';

  // 1. Conexión segura con el objeto global de datos
  const {
    TORNEOS = [],
    JUEGOS = [],
    EQUIPOS = [],
    JUGADORES = [],
    USUARIOS = [],
    escaparHTML = (str) => str || '',
    formatearFecha = (fecha) => fecha || '—'
  } = (window.ARENA && window.ARENA.datos) ? window.ARENA.datos : {};

  // Unificar fuente de usuarios
  const listaUsuarios = USUARIOS.length > 0 ? USUARIOS : JUGADORES;

  // Perfil por defecto para la simulación activa
  let usuarioActual = {
    id: 'u1',
    nombre: 'Alex Morgan',
    apodo: 'ApexPredator',
    correo: 'alex.morgan@arena.gg',
    rol: 'jugador',
    equipoId: 'eq1',
    fechaRegistro: '2025-01-15',
    juegoFavoritoId: 'j1',
    stats: { torneos: 12, victorias: 4, puntos: 1450 }
  };

  document.addEventListener('DOMContentLoaded', () => {
    poblarSelectorJuegos();
    cargarPerfil();
    configurarEventos();
  });

  function cargarPerfil() {
    // Si hay datos en la BD global, usar el primer registro
    if (listaUsuarios.length > 0) {
      const encontrado = listaUsuarios.find(u => u.rol === usuarioActual.rol) || listaUsuarios[0];
      usuarioActual = { ...usuarioActual, ...encontrado };
    }

    renderizarVista();
  }

  function renderizarVista() {
    // Referencias DOM
    const elNombreVisible = document.getElementById('perfil-nombre-visible');
    const elApodoVisible = document.getElementById('perfil-apodo-visible');
    const elAvatar = document.getElementById('avatar-iniciales');
    const elInsigniaRol = document.getElementById('insignia-rol');

    const elStatTorneos = document.getElementById('stat-torneos');
    const elStatVictorias = document.getElementById('stat-victorias');
    const elStatPuntos = document.getElementById('stat-puntos');

    const elResumenCorreo = document.getElementById('resumen-correo');
    const elResumenEquipo = document.getElementById('resumen-equipo');
    const elResumenFecha = document.getElementById('resumen-fecha');

    const inputNombre = document.getElementById('perfil-nombre');
    const inputApodo = document.getElementById('perfil-apodo');
    const inputCorreo = document.getElementById('perfil-correo');
    const selectJuego = document.getElementById('perfil-juego-favorito');

    // 1. Renderizar Encabezado y Badge
    const apodo = usuarioActual.apodo || usuarioActual.nombre || 'Usuario';
    elNombreVisible.textContent = usuarioActual.nombre || 'Usuario Anónimo';
    elApodoVisible.textContent = `@${apodo.toLowerCase().replace(/\s+/g, '')}`;
    elAvatar.textContent = apodo.substring(0, 2).toUpperCase();
    
    elInsigniaRol.textContent = (usuarioActual.rol || 'Jugador').toUpperCase();
    elInsigniaRol.className = `insignia ${claseSegunRol(usuarioActual.rol)}`;

    // 2. Renderizar Estadísticas
    const stats = usuarioActual.stats || { torneos: 5, victorias: 2, puntos: 350 };
    elStatTorneos.textContent = stats.torneos;
    elStatVictorias.textContent = stats.victorias;
    elStatPuntos.textContent = stats.puntos;

    // 3. Renderizar Resumen
    elResumenCorreo.textContent = usuarioActual.correo || 'No especificado';
    
    const equipo = EQUIPOS.find(e => String(e.id) === String(usuarioActual.equipoId));
    elResumenEquipo.textContent = equipo ? equipo.nombre : 'Sin equipo asociado';
    elResumenFecha.textContent = formatearFecha(usuarioActual.fechaRegistro || '2025-01-01');

    // 4. Prellenar Formulario
    inputNombre.value = usuarioActual.nombre || '';
    inputApodo.value = usuarioActual.apodo || '';
    inputCorreo.value = usuarioActual.correo || '';
    if (usuarioActual.juegoFavoritoId) {
      selectJuego.value = usuarioActual.juegoFavoritoId;
    }

    // 5. Cargar tabla de torneos del usuario
    pintarTorneosDelUsuario();
  }

  function pintarTorneosDelUsuario() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-mis-torneos');
    
    // Filtrar torneos donde participa el usuario o su equipo
    const misTorneos = TORNEOS.filter(t => 
      t.participantesInscritos && (
        t.participantesInscritos.includes(usuarioActual.id) || 
        t.participantesInscritos.includes(usuarioActual.equipoId)
      )
    );

    // Fallback: Si no hay cruce directo, mostrar los torneos en estado 'abierto' o 'en-curso'
    const torneosAMostrar = misTorneos.length > 0 ? misTorneos : TORNEOS.slice(0, 3);

    if (torneosAMostrar.length === 0) {
      cuerpoTabla.innerHTML = `<tr><td colspan="5" class="estado-vacio">No estás inscrito en ningún torneo actualmente.</td></tr>`;
      return;
    }

    cuerpoTabla.innerHTML = torneosAMostrar.map(torneo => {
      const juego = JUEGOS.find(j => String(j.id) === String(torneo.juegoId));
      const claseEstado = torneo.estado === 'abierto' ? 'insignia--abierto' :
                          torneo.estado === 'en-curso' ? 'insignia--en-curso' : 'insignia--finalizado';

      return `
        <tr>
          <td><strong>${escaparHTML(torneo.nombre)}</strong></td>
          <td>${juego ? escaparHTML(juego.nombre) : '—'}</td>
          <td><span class="insignia ${claseEstado}">${escaparHTML(torneo.estado)}</span></td>
          <td>${juego ? escaparHTML(juego.modalidad) : '5v5'}</td>
          <td>
            <a href="torneo-detalle.html?id=${torneo.id}" class="boton boton-secundario boton-pequeno">Ver detalles</a>
          </td>
        </tr>
      `;
    }).join('');
  }

  function poblarSelectorJuegos() {
    const selectJuego = document.getElementById('perfil-juego-favorito');
    if (JUEGOS.length > 0) {
      JUEGOS.forEach(juego => {
        const op = document.createElement('option');
        op.value = juego.id;
        op.textContent = juego.nombre;
        selectJuego.appendChild(op);
      });
    }
  }

  function configurarEventos() {
    const formulario = document.getElementById('formulario-perfil');
    const selectorPerfilSimulado = document.getElementById('perfil-simulado');
    const avisoExito = document.getElementById('aviso-exito-perfil');

    // Cambio de rol desde el header
    if (selectorPerfilSimulado) {
      selectorPerfilSimulado.addEventListener('change', (e) => {
        usuarioActual.rol = e.target.value;
        renderizarVista();
      });
    }

    // Guardar cambios del formulario
    formulario.addEventListener('submit', (e) => {
      e.preventDefault();
      limpiarErrores();

      const inputNombre = document.getElementById('perfil-nombre');
      const inputApodo = document.getElementById('perfil-apodo');
      const inputCorreo = document.getElementById('perfil-correo');
      const selectJuego = document.getElementById('perfil-juego-favorito');

      let valido = true;

      if (!inputNombre.value.trim()) {
        mostrarError('error-perfil-nombre', 'El nombre es obligatorio.');
        valido = false;
      }

      if (!inputApodo.value.trim()) {
        mostrarError('error-perfil-apodo', 'El apodo es obligatorio.');
        valido = false;
      }

      if (!inputCorreo.value.trim() || !inputCorreo.value.includes('@')) {
        mostrarError('error-perfil-correo', 'Ingresa un correo válido.');
        valido = false;
      }

      if (valido) {
        // Actualizar objeto en memoria
        usuarioActual.nombre = inputNombre.value.trim();
        usuarioActual.apodo = inputApodo.value.trim();
        usuarioActual.correo = inputCorreo.value.trim();
        usuarioActual.juegoFavoritoId = selectJuego.value;

        renderizarVista();

        avisoExito.classList.remove('oculto');
        setTimeout(() => {
          avisoExito.classList.add('oculto');
        }, 4000);
      }
    });
  }

  function claseSegunRol(rol) {
    switch (String(rol).toLowerCase()) {
      case 'administrador': return 'insignia--en-curso';
      case 'organizador': return 'insignia--abierto';
      case 'jugador': return 'insignia--abierto';
      default: return 'insignia--finalizado';
    }
  }

  function mostrarError(idElemento, mensaje) {
    const el = document.getElementById(idElemento);
    if (el) el.textContent = mensaje;
  }

  function limpiarErrores() {
    document.querySelectorAll('.mensaje-error').forEach(el => el.textContent = '');
  }
})();