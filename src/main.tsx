import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import "./styles/variables.css";
import "./styles/global.css";

// Clave para guardar el tema.
const TEMA_GUARDADO = "cargaquer-tema";

// Obtiene el tema guardado.
const temaInicial = localStorage.getItem(TEMA_GUARDADO);

// Aplica el tema antes de iniciar React.
document.documentElement.dataset.tema =
  temaInicial === "claro" ? "claro" : "oscuro";

// Obtiene el elemento raíz de la aplicación.
const root = document.getElementById("root");

if (!root) {
  throw new Error("No se ha encontrado el elemento raíz de la aplicación.");
}

// Inicia la aplicación.
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
