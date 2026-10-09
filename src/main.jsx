import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';

// Carga solo la grilla y las utilidades de Bootstrap.
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap/dist/css/bootstrap-utilities.min.css';

import './styles/estilos.css';
import App from './App.jsx';

const contenedor = document.getElementById('root');
const raiz = createRoot(contenedor);

raiz.render(
  <StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
    </StrictMode>
);