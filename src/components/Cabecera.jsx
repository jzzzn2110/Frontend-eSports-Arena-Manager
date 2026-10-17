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
          <Link to="/index.html" className="marca">
            <span className="marca__icono" aria-hidden="true">
              EA
            </span>
            <span>eSports Arena Manager</span>
          </Link>

          <p className="encabezado__subtitulo">
            Bracket · rankings · inscripciones · equipos
          </p>
        </div>

        <nav className="nav-principal" aria-label="Navegación principal">
          <ul>
            {[
              ...enlaces,
              ...(["organizador", "administrador"].includes(perfil)
                ? [
                    {
                      ruta: "/administracion.html",
                      texto: "Administración",
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
