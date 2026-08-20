import { useState } from "react";

// Propiedades de la barra superior.
interface BarraSuperiorProps {
  nombreUsuario: string;
  menuAbierto: boolean;
  alternarMenu: () => void;
  salir: () => void;
}

// Tipos de tema disponibles.
type Tema = "oscuro" | "claro";

// Clave para guardar el tema.
const TEMA_GUARDADO = "cargaquer-tema";

// Obtiene el tema actual.
function obtenerTemaActual(): Tema {
  return document.documentElement.dataset.tema === "claro" ? "claro" : "oscuro";
}

// Aplica y guarda el tema.
function aplicarTema(tema: Tema) {
  document.documentElement.dataset.tema = tema;

  localStorage.setItem(TEMA_GUARDADO, tema);
}

// Componente de la barra superior.
function BarraSuperior({
  nombreUsuario,
  menuAbierto,
  alternarMenu,
  salir,
}: BarraSuperiorProps) {
  // Estado para guardar el tema.
  const [tema, setTema] = useState<Tema>(() => obtenerTemaActual());

  // Inicial para el avatar.
  const inicialUsuario = nombreUsuario.charAt(0).toUpperCase();

  // Función para cambiar el tema.
  const alternarTema = () => {
    const nuevoTema: Tema = tema === "oscuro" ? "claro" : "oscuro";

    aplicarTema(nuevoTema);

    setTema(nuevoTema);
  };

  return (
    <header className="barra-superior">
      <div className="barra-superior__contenido">
        <div className="barra-superior__zona-izquierda">
          {/* Botón del menú móvil. */}
          <button
            type="button"
            className="barra-superior__menu"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            onClick={alternarMenu}
          >
            {menuAbierto ? "×" : "☰"}
          </button>

          {/* Logo y nombre de la aplicación. */}
          <div className="barra-superior__marca">
            <span className="barra-superior__logo" aria-hidden="true">
              ⚡
            </span>

            <div className="barra-superior__marca-texto">
              <strong>CargaQuer</strong>

              <span>Carga eléctrica municipal</span>
            </div>
          </div>
        </div>

        {/* Entidad que presta el servicio. */}
        <div className="barra-superior__cliente">
          <span>Servicio:</span>

          <strong>Ayuntamiento de Quer</strong>
        </div>

        <div className="barra-superior__usuario">
          {/* Botón para cambiar el tema. */}
          <button
            type="button"
            className="barra-superior__tema"
            onClick={alternarTema}
            aria-label={
              tema === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"
            }
            title={
              tema === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"
            }
          >
            <span aria-hidden="true">{tema === "oscuro" ? "☀" : "☾"}</span>
          </button>

          {/* Datos del usuario. */}
          <div className="barra-superior__avatar" aria-hidden="true">
            {inicialUsuario}
          </div>

          <span className="barra-superior__nombre">{nombreUsuario}</span>

          {/* Botón para cerrar sesión. */}
          <button
            type="button"
            className="barra-superior__salir"
            onClick={salir}
          >
            <span aria-hidden="true">↪</span>

            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Entidad mostrada en móvil. */}
      <div className="barra-superior__cliente-movil">
        <span>Cliente:</span>

        <strong>Ayuntamiento de Quer</strong>
      </div>
    </header>
  );
}

export default BarraSuperior;
