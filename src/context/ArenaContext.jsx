import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";
import { crearArenaStore } from "../services/crearArenaStore.js";

const Contexto = createContext(null);
export function ArenaProvider({ children, store: externo }) {
  const [store] = useState(() => {
    if (externo) return externo;
    let storage;
    try {
      storage = window.localStorage;
    } catch {
      /* Modo sin persistencia. */
    }
    return crearArenaStore({ storage });
  });
  const datos = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  return (
    <Contexto.Provider value={{ store, datos, aviso: store.getAviso() }}>
      {children}
    </Contexto.Provider>
  );
}
export function useArena() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("La página necesita ArenaProvider.");
  return contexto;
}
