import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Incluye componentes, grilla y utilidades de Bootstrap.
import "bootstrap/dist/css/bootstrap.min.css";

import "./styles/estilos.css";
import App from "./App.jsx";
import { ArenaProvider } from "./context/ArenaContext.jsx";

const contenedor = document.getElementById("root");
const raiz = createRoot(contenedor);

raiz.render(
  <StrictMode>
    <BrowserRouter>
      <ArenaProvider>
        <App />
      </ArenaProvider>
    </BrowserRouter>
  </StrictMode>,
);
