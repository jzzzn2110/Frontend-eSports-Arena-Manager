import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const CLAVE = "rankforge-sesion-jwt";

const ROLES = ["jugador", "organizador", "administrador"];

// Comprobar si el token sigue vigente
export function tokenVigente(token) {
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

// Recuperar la sesion almacenada
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

// Proveedor de autenticacion
export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(sesionInicial);

  // Guardar o eliminar la sesion
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

  // Comprobar la expiracion del token
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
  function login(usuario) {
    if (
      !tokenVigente(usuario.token) ||
      !ROLES.includes(usuario.rol)
    ) {
      throw new Error("La sesion recibida no es valida.");
    }

    setSesion({
      token: usuario.token,
      email: usuario.email,
      rol: usuario.rol,
      jugadorId: null,
    });
  }

  // Cerrar sesion
  function logout() {
    setSesion(sesionVisitante());
  }

  // Comprobar si el usuario esta autenticado
  const autenticado =
    Boolean(sesion.token) && tokenVigente(sesion.token);

  // Comprobar los permisos del usuario
  function tieneRol(...roles) {
    return autenticado && roles.includes(sesion.rol);
  }

  return (
    <AuthContext.Provider
      value={{
        sesion,
        autenticado,
        login,
        logout,
        tieneRol,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para acceder a la autenticacion
export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("La pagina necesita AuthProvider.");
  }

  return contexto;
}
