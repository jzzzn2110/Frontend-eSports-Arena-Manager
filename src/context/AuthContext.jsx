import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { perfilService } from "../services/perfilService.js";
import { apiConfigurada } from "../services/api.js";

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
export function AuthProvider({ children, servicioPerfil = perfilService }) {
  const [sesion, setSesion] = useState(sesionInicial);
  const [perfil, setPerfil] = useState(null);
  const [errorPerfil, setErrorPerfil] = useState("");
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [intentoPerfil, setIntentoPerfil] = useState(0);

  useEffect(() => {
    setPerfil(null);
    setErrorPerfil("");
    if (!sesion.token) { setCargandoPerfil(false); return; }
    if (!apiConfigurada && servicioPerfil === perfilService) {
      setErrorPerfil("Falta configurar la conexión con la API.");
      setCargandoPerfil(false); return;
    }
    const controller = new AbortController();
    setCargandoPerfil(true);
    servicioPerfil.asegurar({ token: sesion.token, signal: controller.signal })
      .then((datos) => { if (!controller.signal.aborted) setPerfil(datos); })
      .catch((error) => { if (!controller.signal.aborted) setErrorPerfil(error.message); })
      .finally(() => { if (!controller.signal.aborted) setCargandoPerfil(false); });
    return () => controller.abort();
  }, [sesion.token, servicioPerfil, intentoPerfil]);

  // Detectar sesiones rechazadas por el backend
  useEffect(() => {
    function manejarSesionInvalida(evento) {
      if (
        sesion.token &&
        evento.detail?.token === sesion.token
      ) {
        logout();
      }
    }

    window.addEventListener(
      "rankforge:sesion-invalida",
      manejarSesionInvalida
    );

    return () => {
      window.removeEventListener(
        "rankforge:sesion-invalida",
        manejarSesionInvalida
      );
    };
  }, [sesion.token]);

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
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      // Almacenamiento no disponible
    }
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
        perfil,
        cargandoPerfil,
        errorPerfil,
        recargarPerfil: () => setIntentoPerfil((n) => n + 1),
        guardarPerfil: async (datos) => {
          const actualizado = await servicioPerfil.guardar(datos, { token: sesion.token });
          setPerfil(actualizado);
          return actualizado;
        },
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
