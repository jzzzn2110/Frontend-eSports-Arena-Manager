import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

import "./styles/estilos.css";
import App from "./App.jsx";
import { ArenaProvider } from "./context/ArenaContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

const contenedor = document.getElementById("root");
const raiz = createRoot(contenedor);

raiz.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ArenaProvider>
          <App />
        </ArenaProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
