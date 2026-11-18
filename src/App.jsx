import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import Cabecera from "./components/Cabecera.jsx";
import PiePagina from "./components/PiePagina.jsx";
import Inicio from "./pages/Inicio.jsx";
import Torneos from "./pages/Torneos.jsx";
import TorneoDetalle from "./pages/TorneoDetalle.jsx";
import Inscripcion from "./pages/Inscripcion.jsx";
import Equipo from "./pages/Equipo.jsx";
import Perfil from "./pages/Perfil.jsx";
import Administracion from "./pages/Administracion.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import { useArena } from "./context/ArenaContext.jsx";
import { apiConfigurada } from "./services/api.js";

const ROLES = ["jugador", "organizador", "administrador"];
const CLAVE = "rankforge-sesion-jwt";
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

// Comprobar la fecha de expiracion del token
function tokenVigente(token) {
  try {
    const payload = token.split(".")[1];
    const contenido = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    return contenido.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Crear una sesion de visitante
function sesionVisitante() {
  return {
    token: null,
    email: null,
    rol: "visitante",
    jugadorId: null,
  };
}

// Recuperar una sesion guardada
function sesionInicial() {
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE));

    if (
      guardada?.token &&
      ROLES.includes(guardada.rol) &&
      tokenVigente(guardada.token)
    ) {
      return guardada;
    }
  } catch {
    // No existe una sesion valida
  }

  return sesionVisitante();
}

// Proteger rutas privadas
function RutaProtegida({ sesion, roles, children }) {
  if (!sesion.token || !tokenVigente(sesion.token)) {
    return <Navigate to="/login.html" replace />;
  }

  if (roles && !roles.includes(sesion.rol)) {
    return <Navigate to="/index.html" replace />;
  }

  return children;
}

export default function App() {
  const { datos, aviso } = useArena();

  const [tema, setTema] = useState(temaInicial);
  const [sesion, setSesion] = useState(sesionInicial);

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

  // Guardar la sesion
  useEffect(() => {
    try {
      if (sesion.token) {
        localStorage.setItem(CLAVE, JSON.stringify(sesion));
      } else {
        localStorage.removeItem(CLAVE);
      }
    } catch {
      // Persistencia no disponible
    }
  }, [sesion]);

  // Comprobar periodicamente si el token ha expirado
  useEffect(() => {
    if (!sesion.token) return;

    const intervalo = setInterval(() => {
      if (!tokenVigente(sesion.token)) {
        setSesion(sesionVisitante());
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [sesion.token]);

  // Iniciar sesion
  function handleLogin(usuario) {
    setSesion({
      token: usuario.token,
      email: usuario.email,
      rol: usuario.rol,
      jugadorId: null,
    });
  }

  // Cerrar sesion
  function handleLogout() {
    setSesion(sesionVisitante());
  }

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
        onLogout={handleLogout}
        jugadores={datos.JUGADORES}
        jugadorId={sesion.jugadorId}
      />

      <div className="contenedor aviso-demo">
        {apiConfigurada
          ? "RankForge · Autenticación real · Equipos e inscripciones simulados"
          : "RankForge · API no configurada"}
      </div>

      {aviso && (
        <div className="container alert alert-warning" role="status">
          {aviso}
        </div>
      )}

      <div id="contenido" tabIndex={-1}>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/index.html" replace />}
          />

          <Route path="/index.html" element={<Inicio />} />

          <Route path="/torneos.html" element={<Torneos />} />

          <Route
            path="/torneo-detalle.html"
            element={<TorneoDetalle />}
          />

          <Route
            path="/login.html"
            element={
              sesion.token ? (
                <Navigate to="/index.html" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          <Route
            path="/registro.html"
            element={
              sesion.token ? (
                <Navigate to="/index.html" replace />
              ) : (
                <Registro />
              )
            }
          />

          <Route
            path="/inscripcion.html"
            element={
              <RutaProtegida sesion={sesion}>
                {sesion.jugadorId ? (
                  <Inscripcion actor={sesion} />
                ) : (
                  <main className="container py-5">
                    <h1>Inscripciones</h1>
                    <p>Funcionalidad pendiente de vinculación con tu cuenta.</p>
                  </main>
                )}
              </RutaProtegida>
            }
          />

          <Route
            path="/equipo.html"
            element={
              <RutaProtegida sesion={sesion}>
                {sesion.jugadorId ? (
                  <Equipo actor={sesion} />
                ) : (
                  <main className="container py-5">
                    <h1>Mi equipo</h1>
                    <p>Funcionalidad pendiente de vinculación con tu cuenta.</p>
                  </main>
                )}
              </RutaProtegida>
            }
          />

          <Route
            path="/perfil.html"
            element={
              <RutaProtegida sesion={sesion}>
                {sesion.jugadorId ? (
                  <Perfil actor={sesion} />
                ) : (
                  <main className="container py-5">
                    <h1>Mi perfil</h1>
                    <p>Correo: {sesion.email}</p>
                    <p>Rol: {sesion.rol}</p>
                  </main>
                )}
              </RutaProtegida>
            }
          />

          <Route
            path="/administracion.html"
            element={
              <RutaProtegida
                sesion={sesion}
                roles={["administrador", "organizador"]}
              >
                <Administracion actor={sesion} />
              </RutaProtegida>
            }
          />

          <Route
            path="*"
            element={
              <main className="container py-5">
                <h1>Página no encontrada</h1>
                <Link to="/index.html">Volver al inicio</Link>
              </main>
            }
          />
        </Routes>
      </div>

      <PiePagina />
    </>
  );
}
