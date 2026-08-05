import { useNavigate } from "react-router-dom";

interface BarraSuperiorProps {
  nombreUsuario: string;
  menuAbierto: boolean;
  alternarMenu: () => void;
}

function BarraSuperior({
  nombreUsuario,
  menuAbierto,
  alternarMenu,
}: BarraSuperiorProps) {
  const navigate = useNavigate();

  const inicialUsuario = nombreUsuario.charAt(0).toUpperCase();

  function cerrarSesion() {
    navigate("/login");
  }

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
          <div className="barra-superior__avatar" aria-hidden="true">
            {inicialUsuario}
          </div>

          <span className="barra-superior__nombre">{nombreUsuario}</span>

          <button
            type="button"
            className="barra-superior__salir"
            onClick={cerrarSesion}
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
