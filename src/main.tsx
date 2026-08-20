import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import "./styles/variables.css";
import "./styles/global.css";

const TEMA_GUARDADO = "cargaquer-tema";

const temaInicial = localStorage.getItem(TEMA_GUARDADO);

document.documentElement.dataset.tema =
  temaInicial === "claro" ? "claro" : "oscuro";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No se ha encontrado el elemento raíz de la aplicación.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
