import {useEffect, useState} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import PiePagina from './components/PiePagina.jsx';

import Cabecera from './components/Cabecera.jsx';
import Inicio from './pages/Inicio.jsx';
import Torneos from './pages/Torneos.jsx';
import TorneoDetalle from './pages/TorneoDetalle.jsx';
import Inscripcion from './pages/Inscripcion.jsx';
import Equipo from './pages/Equipo.jsx';
import Perfil from './pages/Perfil.jsx';

const PERFILES_VALIDOS = [
  'visitante',
  'jugador',
  'organizador',
  'administrador',
];
const CLAVE_PERFIL = 'esports-arena-perfil-prueba';

function App() {
  //RECUPERA EL PERFIL ELEGIDO
  const [perfil,setPerfil] = useState(() =>{
    const guardado = localStorage.getItem(CLAVE_PERFIL);

    if(PERFILES_VALIDOS.includes(guardado)) return guardado;

    //la pagina personal comienza con el perfil jugador
    const ruta = window.location.pathname;
    return ruta === '/perfil.html' || ruta === '/equipo.html'
      ? 'jugador'
      : 'visitante';
  });

  // Conserva el perfil al recargar la pagina.
  useEffect(() => {
    localStorage.setItem(CLAVE_PERFIL, perfil);
  }, [perfil]);

  function cambiarPerfil(nuevoPerfil) {
    if (PERFILES_VALIDOS.includes(nuevoPerfil)) {
      setPerfil(nuevoPerfil);
    }
  }

  return (
    <>
      <Cabecera
        perfil={perfil}
        onPerfilChange={cambiarPerfil}
      />

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/index.html" replace />}
        />

        <Route path="/index.html" element={<Inicio />} />
        <Route path="/torneos.html" element={<Torneos />} />
        <Route path="/torneo-detalle.html" element={<TorneoDetalle />} />

        <Route
          path="/inscripcion.html"
          element={<Inscripcion perfilSimulado={perfil} />}
        />

        <Route
          path="/equipo.html"
          element={<Equipo perfilSimulado={perfil} />}
        />

        <Route
          path="/perfil.html"
          element={<Perfil perfilSimulado={perfil} />}
        />

        <Route
          path="*"
          element={<Navigate to="/index.html" replace />}
        />
      </Routes>

      <PiePagina />
    </>
  );
}

export default App;