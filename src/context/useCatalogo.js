import { useEffect, useState } from "react";
import { apiConfigurada } from "../services/api.js";
import { listarJuegos, obtenerJuego } from "../services/juegosService.js";
import {
  esIdTorneoApi,
  listarTorneos,
  obtenerTorneo,
} from "../services/torneosService.js";
import { useArena } from "./ArenaContext.jsx";

async function cargarCatalogo(torneoId, signal) {
  if (torneoId === undefined) {
    const [juegos, torneos] = await Promise.all([
      listarJuegos(signal),
      listarTorneos(signal),
    ]);
    return { juegos, torneos };
  }

  const torneo = await obtenerTorneo(torneoId, signal);
  const juego = torneo ? await obtenerJuego(torneo.juegoId, signal) : null;
  return { torneo, juego };
}

export function useCatalogo(torneoId) {
  const { datos } = useArena();
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState(null);
  // Los enlaces de demostración conservan sus IDs locales, por ejemplo t1.
  const desdeApi = apiConfigurada && (torneoId === undefined || esIdTorneoApi(torneoId));

  useEffect(() => {
    if (!desdeApi) return;
    const solicitud = new AbortController();
    const publicar = (catalogo) => {
      if (!solicitud.signal.aborted) setResultado({ torneoId, intento, ...catalogo });
    };
    const fallar = () => {
      publicar({ estado: "error" });
      solicitud.abort();
    };
    const limite = setTimeout(fallar, 12000);

    cargarCatalogo(torneoId, solicitud.signal)
      .then((catalogo) => publicar({ estado: "listo", ...catalogo }), fallar)
      .finally(() => clearTimeout(limite));

    return () => {
      clearTimeout(limite);
      solicitud.abort();
    };
  }, [desdeApi, torneoId, intento]);

  if (!desdeApi) {
    const torneo = datos.TORNEOS.find((item) => item.id === torneoId);
    return {
      estado: "listo",
      desdeApi: false,
      juegos: datos.JUEGOS,
      torneos: datos.TORNEOS,
      torneo,
      juego: datos.JUEGOS.find((item) => item.id === torneo?.juegoId),
    };
  }

  if (resultado?.torneoId !== torneoId || resultado?.intento !== intento) {
    return { estado: "cargando" };
  }
  return {
    ...resultado,
    desdeApi: true,
    reintentar: () => setIntento((actual) => actual + 1),
  };
}
