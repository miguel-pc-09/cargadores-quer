import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import "./styles/variables.css";
import "./styles/global.css";

/*
 Clave utilizada para guardar el tema elegido por el usuario.
 Se comparte con el login, registro, panel de usuario y administración.
 */
const TEMA_GUARDADO = "cargaquer-tema";

/*
 Recupero el tema antes de arrancar React para que la página
 aparezca directamente en claro u oscuro sin cambiar de color al cargar.
 */
const temaInicial = localStorage.getItem(TEMA_GUARDADO);

document.documentElement.dataset.tema =
  temaInicial === "claro" ? "claro" : "oscuro";

/*
 Busco el elemento principal definido en index.html.
 Toda la aplicación React se monta dentro de este elemento.
 */
const root = document.getElementById("root");

if (!root) {
  throw new Error("No se ha encontrado el elemento raíz de la aplicación.");
}

/*
 Inicio la aplicación.
 */
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
