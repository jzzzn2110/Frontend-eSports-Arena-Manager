import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';

import Cabecera from './components/Cabecera.jsx';
import PiePagina from './components/PiePagina.jsx';
import Inicio from './pages/Inicio.jsx';
import Torneos from './pages/Torneos.jsx';
import TorneoDetalle from './pages/TorneoDetalle.jsx';
import Inscripcion from './pages/Inscripcion.jsx';
import Equipo from './pages/Equipo.jsx';
import Perfil from './pages/Perfil.jsx';
import * as datosBase from './data/datos.js';
import * as logica from './utils/logica.js';

const PERFILES_VALIDOS = ['visitante', 'jugador', 'organizador', 'administrador'];
const CLAVE_PERFIL = 'esports-arena-perfil-prueba';

function App() {
  const [perfil, setPerfil] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_PERFIL);
    if (PERFILES_VALIDOS.includes(guardado)) return guardado;
    const ruta = window.location.pathname;
    return ruta === '/perfil.html' || ruta === '/equipo.html' ? 'jugador' : 'visitante';
  });

  // Comparte los torneos con las páginas mediante props.
  const [torneos, setTorneos] = useState(datosBase.TORNEOS);
  const datos = { ...datosBase, ...logica, TORNEOS: torneos };
  const [parametros] = useSearchParams();

  useEffect(() => {
    localStorage.setItem(CLAVE_PERFIL, perfil);
  }, [perfil]);

  function cambiarPerfil(nuevoPerfil) {
    if (PERFILES_VALIDOS.includes(nuevoPerfil)) setPerfil(nuevoPerfil);
  }

  // Guarda la inscripción en memoria y actualiza el estado de React.
  function registrarInscripcion(torneoId, participanteId) {
    if (perfil !== 'jugador') throw new Error('Selecciona el perfil Jugador.');
    const indice = datosBase.TORNEOS.findIndex((torneo) => torneo.id === torneoId);
    if (indice === -1) throw new Error('El torneo no existe.');
    const torneo = datosBase.TORNEOS[indice];
    if (!participanteId) throw new Error('Debes seleccionar un participante.');
    if (torneo.estado !== 'abierto' || logica.inscripcionFueraDePlazo(torneo)) {
      throw new Error('La inscripción de este torneo está cerrada.');
    }
    if (logica.participanteYaInscrito(torneo, participanteId)) {
      throw new Error('Este participante ya está inscrito.');
    }
    if (logica.cuposDisponibles(torneo) <= 0) throw new Error('El torneo ya no tiene cupos.');

    const actualizado = {
      ...torneo,
      participantesInscritos: [...torneo.participantesInscritos, participanteId],
    };
    // Mantiene sincronizado el servicio simulado que utiliza Inicio.
    datosBase.TORNEOS.splice(indice, 1, actualizado);
    setTorneos([...datosBase.TORNEOS]);
    return actualizado;
  }

  return (
    <>
      <Cabecera perfil={perfil} onPerfilChange={cambiarPerfil} />
      <Routes>
        <Route path="/" element={<Navigate to="/index.html" replace />} />
        <Route path="/index.html" element={<Inicio />} />
        <Route path="/torneos.html" element={<Torneos juegos={datos.JUEGOS} torneos={torneos} />} />
        <Route
          path="/torneo-detalle.html"
          element={<TorneoDetalle datos={datos} torneoId={parametros.get('id') || ''} />}
        />
        <Route
          path="/inscripcion.html"
          element={perfil === 'jugador' ? (
            <Inscripcion datos={datos} torneoIdUrl={parametros.get('torneo') || ''} onInscribir={registrarInscripcion} />
          ) : (
            <main className="contenedor seccion">
              <h1>Inscripción a torneo</h1>
              <p className="aviso aviso--info" role="status">
                Selecciona Jugador en Perfil de prueba para inscribirte.
              </p>
            </main>
          )}
        />
        <Route path="/equipo.html" element={<Equipo perfilSimulado={perfil} />} />
        <Route path="/perfil.html" element={<Perfil perfilSimulado={perfil} />} />
        <Route path="*" element={<Navigate to="/index.html" replace />} />
      </Routes>
      <PiePagina />
    </>
  );
}

export default App;
