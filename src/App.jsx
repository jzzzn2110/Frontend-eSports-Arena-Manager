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
import { useArena } from "./context/ArenaContext.jsx";
const ROLES = ["visitante", "jugador", "organizador", "administrador"];
const CLAVE = "esports-arena-sesion-v2";
const CLAVE_TEMA = "esports-arena-tema";
function temaInicial() {
  try {
    const temaGuardado = localStorage.getItem(CLAVE_TEMA);
    if (temaGuardado === "oscuro" || temaGuardado === "claro") return temaGuardado;
  } catch { /* Navegación privada: usar tema claro. */ }
  return "claro";
}
export default function App() {
  const { datos, aviso } = useArena();
  const [tema, setTema] = useState(temaInicial);
  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    document.documentElement.setAttribute("data-bs-theme", tema === "oscuro" ? "dark" : "light");
    document.documentElement.style.colorScheme = tema === "oscuro" ? "dark" : "light";
    try { localStorage.setItem(CLAVE_TEMA, tema); } catch { /* Persistencia no disponible. */ }
  }, [tema]);
  const [sesion, setSesion] = useState(() => {
    try {
      const guardada = JSON.parse(localStorage.getItem(CLAVE));
      if (
        ROLES.includes(guardada?.rol) &&
        datos.JUGADORES.some((j) => j.id === guardada.jugadorId)
      )
        return guardada;
    } catch {
      /* Selección inicial sin almacenamiento. */
    }
    return { rol: "visitante", jugadorId: datos.JUGADORES[0].id };
  });
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(sesion));
    } catch {
      /* Modo temporal. */
    }
  }, [sesion]);
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
        onTemaChange={() => setTema((anterior) => anterior === "oscuro" ? "claro" : "oscuro")}
        perfil={sesion.rol}
        jugadores={datos.JUGADORES}
        jugadorId={sesion.jugadorId}
        onPerfilChange={(rol) => {
          if (ROLES.includes(rol)) setSesion((s) => ({ ...s, rol }));
        }}
        onJugadorChange={(jugadorId) => setSesion((s) => ({ ...s, jugadorId }))}
      />
      <div className="contenedor aviso-demo">
        Demostración académica · perfiles simulados · datos guardados en este
        navegador
      </div>
      {aviso && (
        <div className="container alert alert-warning" role="status">
          {aviso}
        </div>
      )}
      <div id="contenido" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Navigate to="/index.html" replace />} />
          <Route path="/index.html" element={<Inicio />} />
          <Route path="/torneos.html" element={<Torneos />} />
          <Route path="/torneo-detalle.html" element={<TorneoDetalle />} />
          <Route
            path="/inscripcion.html"
            element={<Inscripcion actor={sesion} />}
          />
          <Route
            path="/equipo.html"
            element={
              <Equipo key={sesion.jugadorId + sesion.rol} actor={sesion} />
            }
          />
          <Route
            path="/perfil.html"
            element={
              <Perfil key={sesion.jugadorId + sesion.rol} actor={sesion} />
            }
          />
          <Route
            path="/administracion.html"
            element={<Administracion actor={sesion} />}
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
