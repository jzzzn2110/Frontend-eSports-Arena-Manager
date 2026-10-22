import { Link, useLocation } from "react-router-dom";
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
    texto: "Inscripcion",
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

// Recibe el perfil y la funcion para cambiarlo mediante props.
function Cabecera({
  perfil = "visitante",
  tema = "claro",
  onTemaChange = () => {},
  onPerfilChange = () => {},
  jugadores = [],
  jugadorId,
  onJugadorChange,
}) {
  const location = useLocation();

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
        Bracket Â· rankings Â· inscripciones Â· equipos
      </span>
    </div>
  </Link>
</div>



        <nav className="nav-principal" aria-label="NavegaciÃ³n principal">
          <ul>
            {[
              ...enlaces,
              ...(["organizador", "administrador"].includes(perfil)
                ? [
                    {
                      ruta: "/administracion.html",
                      texto: "AdministraciÃ³n",
                      claves: ["/administracion.html"],
                    },
                  ]
                : []),
            ].map((enlace) => {
              const actual = enlace.claves.includes(location.pathname);

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
          <button className="boton-tema" type="button" onClick={onTemaChange}
            aria-label={tema === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"}
            aria-pressed={tema === "oscuro"}
            title={tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
            <span className="boton-tema__icono" aria-hidden="true">{tema === "oscuro" ? "â˜€" : "â˜¾"}</span>
            <span>{tema === "oscuro" ? "Modo claro" : "Modo oscuro"}</span>
          </button>
        </div>

        <div className="selector-perfil selector-perfil--panel">
          <label
            htmlFor="perfil-simulado"
            className="selector-perfil__etiqueta"
          >
            Perfil de prueba
          </label>
          <select
            id="perfil-simulado"
            name="perfil-simulado"
            value={perfil}
            onChange={(event) => onPerfilChange(event.target.value)}
          >
            <option value="visitante">Visitante</option>
            <option value="jugador">Jugador</option>
            <option value="organizador">Organizador</option>
            <option value="administrador">Administrador</option>
          </select>
          <label htmlFor="jugador-simulado">Jugador de prueba</label>
          <select
            id="jugador-simulado"
            value={jugadorId}
            onChange={(e) => onJugadorChange(e.target.value)}
          >
            {jugadores.map((j) => (
              <option key={j.id} value={j.id}>
                {j.apodo}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

export default Cabecera;
