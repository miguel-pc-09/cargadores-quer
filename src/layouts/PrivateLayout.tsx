import { useEffect, useState } from "react";

import { Outlet, useNavigate } from "react-router-dom";

import BarraSuperior from "../components/panelUsuario/BarraSuperior";
import MenuLateral from "../components/panelUsuario/MenuLateral";

import useAuth from "../hooks/useAuth";

import "../styles/PanelUsuario/PrivateLayout.css";

function PrivateLayout() {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const { usuario, cerrarSesion } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuMovilAbierto ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuMovilAbierto]);

  const cerrarMenu = () => {
    setMenuMovilAbierto(false);
  };

  const alternarMenu = () => {
    setMenuMovilAbierto((estadoActual) => !estadoActual);
  };

  const salir = () => {
    cerrarMenu();

    cerrarSesion();

    navigate("/login", {
      replace: true,
    });
  };

  const nombreUsuario = usuario
    ? `${usuario.nombre} ${usuario.apellidos}`.trim()
    : "Usuario";

  return (
    <div className="area-privada">
      <BarraSuperior
        nombreUsuario={nombreUsuario}
        menuAbierto={menuMovilAbierto}
        alternarMenu={alternarMenu}
        salir={salir}
      />

      <div className="area-privada__estructura">
        <MenuLateral abierto={menuMovilAbierto} cerrarMenu={cerrarMenu} />

        <main className="area-privada__contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PrivateLayout;
