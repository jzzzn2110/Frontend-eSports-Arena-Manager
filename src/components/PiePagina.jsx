import { Link } from "react-router-dom";

function PiePagina() {
  return (
    <footer className="pie-pagina">
      <div className="contenedor">
        <div>
          <p>
            <strong>RankForge</strong>
          </p>
          <p>Proyecto académico - Desarrollo fullstack</p>
        </div>

        <nav aria-label="enlaces de pie de pagina">
          <ul>
            <li>
              <Link to="/index.html">Inicio</Link>
            </li>
            <li>
              <Link to="/torneos.html">Torneos</Link>
            </li>
            <li>
              <Link to="/perfil.html">Perfil</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default PiePagina;
