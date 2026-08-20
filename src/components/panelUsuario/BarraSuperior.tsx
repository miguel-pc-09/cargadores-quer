import { useState } from "react";

interface BarraSuperiorProps {
  nombreUsuario: string;
  menuAbierto: boolean;
  alternarMenu: () => void;
  salir: () => void;
}

type Tema = "oscuro" | "claro";

const TEMA_GUARDADO = "cargaquer-tema";

function obtenerTemaActual(): Tema {
  return document.documentElement.dataset.tema === "claro" ? "claro" : "oscuro";
}

function aplicarTema(tema: Tema) {
  document.documentElement.dataset.tema = tema;

  localStorage.setItem(TEMA_GUARDADO, tema);
}

function BarraSuperior({
  nombreUsuario,
  menuAbierto,
  alternarMenu,
  salir,
}: BarraSuperiorProps) {
  const [tema, setTema] = useState<Tema>(() => obtenerTemaActual());

  const inicialUsuario = nombreUsuario.charAt(0).toUpperCase();

  const alternarTema = () => {
    const nuevoTema: Tema = tema === "oscuro" ? "claro" : "oscuro";

    aplicarTema(nuevoTema);

    setTema(nuevoTema);
  };

  return (
    <header className="barra-superior">
      <div className="barra-superior__contenido">
        <div className="barra-superior__zona-izquierda">
          <button
            type="button"
            className="barra-superior__menu"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            onClick={alternarMenu}
          >
            {menuAbierto ? "×" : "☰"}
          </button>

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

        <div className="barra-superior__cliente">
          <span>Servicio:</span>

          <strong>Ayuntamiento de Quer</strong>
        </div>

        <div className="barra-superior__usuario">
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

          <div className="barra-superior__avatar" aria-hidden="true">
            {inicialUsuario}
          </div>

          <span className="barra-superior__nombre">{nombreUsuario}</span>

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

      <div className="barra-superior__cliente-movil">
        <span>Cliente:</span>

        <strong>Ayuntamiento de Quer</strong>
      </div>
    </header>
  );
}

export default BarraSuperior;
