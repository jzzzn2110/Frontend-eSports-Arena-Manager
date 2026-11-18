import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RutaProtegida({ roles, children }) {
  const { autenticado, tieneRol } = useAuth();
  const location = useLocation();

  // Comprobar si el usuario ha iniciado sesion
  if (!autenticado) {
    return (
      <Navigate
        to="/login.html"
        state={{ desde: location.pathname }}
        replace
      />
    );
  }

  // Comprobar si el usuario tiene los permisos necesarios
  if (roles && !tieneRol(...roles)) {
    return <Navigate to="/index.html" replace />;
  }

  // Permitir el acceso a la pagina
  return children;
}
