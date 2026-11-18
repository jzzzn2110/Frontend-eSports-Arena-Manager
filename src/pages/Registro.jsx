import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../services/api.js";

export default function Registro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      await request("/api/auth/registro", {
        method: "POST",
        json: {
          email,
          password,
          rol: "JUGADOR",
        },
      });

      navigate("/login.html");
    } catch (error) {
      setError(error.message || "No se pudo crear la cuenta.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="auth-card">
        <h1>Crear cuenta</h1>
        <p>Únete a la comunidad de RankForge</p>

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
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="confirmarPassword"
              className="form-label"
            >
              Confirmar contraseña
            </label>

            <input
              id="confirmarPassword"
              type="password"
              className="form-control"
              value={confirmarPassword}
              onChange={(e) =>
                setConfirmarPassword(e.target.value)
              }
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={cargando}
          >
            {cargando ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="mt-3 text-center">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login.html">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
