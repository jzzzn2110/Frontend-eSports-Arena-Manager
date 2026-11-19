import { Link, useLocation, useNavigate } from "react-router-dom";

const enlaces = [
  {
    ruta: "/index.html",
    texto: "Inicio",
    claves: ["/", "/index.html"],
  },
  {
    ruta: "/torneos.html",
    texto: "Torneos",
    claves: ["/torneos.html", "/torneo-detalle.html"],
  },
  {
    ruta: "/inscripcion.html",
    texto: "Inscripción",
    claves: ["/inscripcion.html"],
  },
  {
    ruta: "/equipo.html",
    texto: "Mi equipo",
    claves: ["/equipo.html"],
  },
  {
    ruta: "/perfil.html",
    texto: "Perfil",
    claves: ["/perfil.html"],
  },
];

function Cabecera({
  perfil = "visitante",
  tema = "claro",
  onTemaChange = () => {},
  sesion = null,
  onLogout = () => {},
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const autenticado = Boolean(sesion?.token);

  function cerrarSesion() {
    onLogout();
    navigate("/login.html", { replace: true });
  }

  const enlacesVisibles = autenticado
    ? enlaces
    : enlaces.filter((enlace) =>
        ["/index.html", "/torneos.html"].includes(enlace.ruta)
      );

  return (
    <header className="encabezado">
      <div className="contenedor encabezado__contenedor">
        <div className="encabezado__principal">
          <Link
            to="/index.html"
            className="rankforge-brand"
            aria-label="Ir al inicio de RankForge"
          >
            <img
              src="/img/logo_pagina.png"
              alt="Logo de RankForge"
              className="rankforge-brand__logo"
            />

            <div className="rankforge-brand__contenido">
              <span className="rankforge-brand__nombre">
                RankForge
              </span>

              <span className="rankforge-brand__subtitulo">
                Bracket &middot; rankings &middot;
                inscripciones &middot; equipos
              </span>
            </div>
          </Link>
        </div>

        <nav
          className="nav-principal"
          aria-label="Navegación principal"
        >
          <ul>
            {[
              ...enlacesVisibles,
              ...(autenticado &&
              ["organizador", "administrador"].includes(perfil)
                ? [
                      { ruta: "/organizacion.html", texto: "Organización", claves: ["/organizacion.html"] },
                    {
                      ruta: "/administracion.html",
                      texto: "Administración",
                      claves: ["/administracion.html"],
                    },
                  ]
                : []),
            ].map((enlace) => {
              const actual = enlace.claves.includes(
                location.pathname
              );

              return (
                <li key={enlace.ruta}>
                  <Link
                    to={enlace.ruta}
                    aria-current={actual ? "page" : undefined}
                  >
                    {enlace.texto}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="acciones-cabecera">
          <button
            className="boton-tema"
            type="button"
            onClick={onTemaChange}
            aria-label={
              tema === "oscuro"
                ? "Activar modo claro"
                : "Activar modo oscuro"
            }
            aria-pressed={tema === "oscuro"}
          >
            <span
              className="boton-tema__icono"
              aria-hidden="true"
            >
              {tema === "oscuro" ? "☀" : "☾"}
            </span>

            <span>
              {tema === "oscuro"
                ? "Modo claro"
                : "Modo oscuro"}
            </span>
          </button>
        </div>

        <div className="auth-cabecera">
          {autenticado ? (
            <>
              <div className="auth-usuario">
                <span className="auth-email">
                  {sesion.email}
                </span>

                <span className="auth-rol">
                  {perfil.charAt(0).toUpperCase() +
                    perfil.slice(1)}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={cerrarSesion}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login.html"
                className="btn btn-outline-primary"
              >
                Iniciar sesión
              </Link>

              <Link
                to="/registro.html"
                className="btn btn-primary"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Cabecera;
