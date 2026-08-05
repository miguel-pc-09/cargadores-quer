import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import BarraSuperior from "../components/panelUsuario/BarraSuperior";
import MenuLateral from "../components/panelUsuario/MenuLateral";
import { nombreUsuarioSimulado } from "../data/panelUsuario";

import "../styles/PanelUsuario/PrivateLayout.css";

function PrivateLayout() {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuMovilAbierto ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuMovilAbierto]);

  return (
    <div className="area-privada">
      <BarraSuperior
        nombreUsuario={nombreUsuarioSimulado}
        menuAbierto={menuMovilAbierto}
        alternarMenu={() =>
          setMenuMovilAbierto((estadoActual) => !estadoActual)
        }
      />

      <div className="area-privada__estructura">
        <MenuLateral
          abierto={menuMovilAbierto}
          cerrarMenu={() => setMenuMovilAbierto(false)}
        />

        <main className="area-privada__contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PrivateLayout;
