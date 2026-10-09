import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';

import Inicio from './pages/Inicio.jsx';
import Torneos from './pages/Torneos.jsx';
import TorneoDetalle from './pages/TorneoDetalle.jsx';
import Inscripcion from './pages/Inscripcion.jsx';
import Equipo from './pages/Equipo.jsx';
import Perfil from './pages/Perfil.jsx';

//enlaces
const enlaces = [
  { ruta: '/index.html', texto: 'Inicio' },
  { ruta: '/torneos.html', texto: 'Torneos' },
  { ruta: '/inscripcion.html', texto: 'Inscripción' },
  { ruta: '/equipo.html', texto: 'Mi equipo' },
  { ruta: '/perfil.html', texto: 'Perfil' },
];

function App() {
  return (
    <>
      <header className="encabezado">
        <div className="contenedor">
          <Link to="/index.html" className="marca">
            <span className="marca__icono" aria-hidden="true">
              EA
            </span>
            eSports Arena Manager
          </Link>

          <nav className="nav-principal" aria-label="Navegación principal">
            <ul>
              {enlaces.map((enlace) => (
                <li key={enlace.ruta}>
                  <NavLink to={enlace.ruta} end>
                    {enlace.texto}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/index.html" replace />}
        />

        <Route path="/index.html" element={<Inicio />} />
        <Route path="/torneos.html" element={<Torneos />} />
        <Route path="/torneo-detalle.html" element={<TorneoDetalle />} />
        <Route path="/inscripcion.html" element={<Inscripcion />} />
        <Route path="/equipo.html" element={<Equipo />} />
        <Route path="/perfil.html" element={<Perfil />} />

        <Route
          path="*"
          element={<Navigate to="/index.html" replace />}
        />
      </Routes>
    </>
  );
}

export default App;

