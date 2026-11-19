import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";

import Cabecera from "./components/Cabecera.jsx";
import PiePagina from "./components/PiePagina.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";

import Inicio from "./pages/Inicio.jsx";
import Torneos from "./pages/Torneos.jsx";
import TorneoDetalle from "./pages/TorneoDetalle.jsx";
import InscripcionRemota from "./pages/InscripcionRemota.jsx";
import EquiposRemotos from "./pages/EquiposRemotos.jsx";
import Perfil from "./pages/Perfil.jsx";
import Administracion from "./pages/Administracion.jsx";
import Organizacion from "./pages/Organizacion.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";

import { useArena } from "./context/ArenaContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { apiConfigurada } from "./services/api.js";

const CLAVE_TEMA = "esports-arena-tema";

// Recuperar el tema guardado
function temaInicial() {
  try {
    const temaGuardado = localStorage.getItem(CLAVE_TEMA);

    if (temaGuardado === "oscuro" || temaGuardado === "claro") {
      return temaGuardado;
    }
  } catch {
    // Usar tema claro por defecto
  }

  return "claro";
}

export default function App() {
  const { datos, aviso } = useArena();

  const { sesion, autenticado, login, logout } = useAuth();

  const [tema, setTema] = useState(temaInicial);

  // Configuracion del tema
  useEffect(() => {
    document.documentElement.dataset.tema = tema;

    document.documentElement.setAttribute(
      "data-bs-theme",
      tema === "oscuro" ? "dark" : "light"
    );

    document.documentElement.style.colorScheme =
      tema === "oscuro" ? "dark" : "light";

    try {
      localStorage.setItem(CLAVE_TEMA, tema);
    } catch {
      // Persistencia no disponible
    }
  }, [tema]);

  return (
    <>
      <a
        className="visually-hidden-focusable salto-contenido"
        href="#contenido"
      >
        Saltar al contenido
      </a>

      <Cabecera
        tema={tema}
        onTemaChange={() =>
          setTema((anterior) =>
            anterior === "oscuro" ? "claro" : "oscuro"
          )
        }
        perfil={sesion.rol}
        sesion={sesion}
        onLogout={logout}
        jugadores={datos.JUGADORES}
        jugadorId={sesion.jugadorId}
      />

      <div className="contenedor aviso-demo">
        {apiConfigurada
          ? "RankForge · Conectado a la API"
          : "RankForge · API no configurada"}
      </div>

      {aviso && (
        <div className="container alert alert-warning" role="status">
          {aviso}
        </div>
      )}

      <div id="contenido" tabIndex={-1}>
        <Routes>
          {/* Rutas publicas */}

          <Route
            path="/"
            element={<Navigate to="/index.html" replace />}
          />

          <Route
            path="/index.html"
            element={<Inicio />}
          />

          <Route
            path="/torneos.html"
            element={<Torneos />}
          />

          <Route
            path="/torneo-detalle.html"
            element={<TorneoDetalle />}
          />

          {/* Autenticacion */}

          <Route
            path="/login.html"
            element={
              autenticado ? (
                <Navigate to="/index.html" replace />
              ) : (
                <Login onLogin={login} />
              )
            }
          />

          <Route
            path="/registro.html"
            element={
              autenticado ? (
                <Navigate to="/index.html" replace />
              ) : (
                <Registro />
              )
            }
          />

          {/* Rutas protegidas */}

          <Route
            path="/inscripcion.html"
            element={
              <RutaProtegida>
                <InscripcionRemota />
              </RutaProtegida>
            }
          />

          <Route
            path="/equipo.html"
            element={
              <RutaProtegida>
                <EquiposRemotos />
              </RutaProtegida>
            }
          />

          <Route
            path="/perfil.html"
            element={
              <RutaProtegida>
                <Perfil />
              </RutaProtegida>
            }
          />

          {/* Ruta administrativa */}
          <Route path="/organizacion.html" element={<RutaProtegida roles={["administrador", "organizador"]}><Organizacion /></RutaProtegida>} />

          <Route
            path="/administracion.html"
            element={
              <RutaProtegida
                roles={["administrador", "organizador"]}
              >
                <Administracion actor={sesion} />
              </RutaProtegida>
            }
          />

          {/* Pagina no encontrada */}

          <Route
            path="*"
            element={
              <main className="container py-5">
                <h1>Página no encontrada</h1>
                <Link to="/index.html">
                  Volver al inicio
                </Link>
              </main>
            }
          />
        </Routes>
      </div>

      <PiePagina />
    </>
  );
}
