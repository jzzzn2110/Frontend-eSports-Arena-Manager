import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { iniciarSesion, normalizarRol } from "../services/authService.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setCargando(true);

    try {
      const respuesta = await iniciarSesion(email, password);

      onLogin({
        token: respuesta.token,
        email: respuesta.email,
        rol: normalizarRol(respuesta.rol),
      });

      navigate("/index.html");
    } catch (error) {
        if (error.status === 401) {
         setError("Correo electrónico o contraseña incorrectos.");
        } else {
         setError(error.message || "No se pudo iniciar sesión.");
        }
      } finally {
         setCargando(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="auth-card">
        <h1>Iniciar sesión</h1>
        <p>Bienvenido a RankForge</p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.cl"
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={cargando}
          >
            {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-3 text-center">
          ¿No tienes una cuenta?{" "}
          <Link to="/registro.html">Regístrate</Link>
        </p>
      </div>
    </main>
  );
}
