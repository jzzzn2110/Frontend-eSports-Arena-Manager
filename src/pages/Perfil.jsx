import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Perfil() {
  const { sesion, autenticado, logout } = useAuth();
  const navigate = useNavigate();

  if (!autenticado) return null;

  const email = sesion.email ?? "";
  const nombre = email.split("@")[0];
  const inicial = nombre.charAt(0).toUpperCase();

  const roles = {
    administrador: "Administrador",
    organizador: "Organizador",
    jugador: "Jugador",
  };

  const rol = roles[sesion.rol] ?? "Usuario";

  function cerrarSesion() {
    logout();
    navigate("/login.html", { replace: true });
  }

  return (
    <main className="container py-5">
      <h1>Mi perfil</h1>

      <p className="text-body-secondary mb-4">
        Consulta la información de tu cuenta RankForge.
      </p>

      <section className="card p-4 mb-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div
            className="rounded-circle d-flex align-items-center
                       justify-content-center text-white fs-2 fw-bold"
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#4430a0",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {inicial}
          </div>

          <div className="text-break">
            <h2 className="h4 mb-1">{nombre}</h2>

            <p className="mb-2">{email}</p>

            <span className="auth-rol">
              {rol}
            </span>
          </div>
        </div>

        <hr />

        <h2 className="h4 mb-4">
          Información de la cuenta
        </h2>

        <div className="mb-3">
          <label
            className="form-label"
            htmlFor="perfil-email"
          >
            Correo electrónico
          </label>

          <input
            id="perfil-email"
            className="form-control"
            type="email"
            value={email}
            readOnly
          />
        </div>

        <div className="mb-3">
          <label
            className="form-label"
            htmlFor="perfil-rol"
          >
            Rol de usuario
          </label>

          <input
            id="perfil-rol"
            className="form-control"
            type="text"
            value={rol}
            readOnly
          />
        </div>

        <div>
          <p className="mb-1">Estado de la sesión</p>

          <span className="text-success fw-bold">
            Sesión activa
          </span>
        </div>
      </section>

      <section className="card p-4 mb-4">
        <h2 className="h4">
          Seguridad de la cuenta
        </h2>

        <p>
          Tu sesión está protegida mediante
          autenticación JWT.
        </p>

        <button
          type="button"
          className="btn btn-outline-danger align-self-start"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </section>

      <Link
        to="/index.html"
        className="btn btn-outline-secondary"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
