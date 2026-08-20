import { useEffect, useState } from "react";

import { Outlet, useNavigate } from "react-router-dom";

import BarraSuperior from "../components/panelUsuario/BarraSuperior";
import MenuLateral from "../components/panelUsuario/MenuLateral";

import useAuth from "../hooks/useAuth";

import "../styles/PanelUsuario/PrivateLayout.css";

// Estructura principal del panel de usuario.
function PrivateLayout() {
  // Estado del menú móvil.
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Datos y sesión del usuario.
  const { usuario, cerrarSesion } = useAuth();

  const navigate = useNavigate();

  // Bloquea el scroll con el menú abierto.
  useEffect(() => {
    document.body.style.overflow = menuMovilAbierto ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuMovilAbierto]);

  // Función para cerrar el menú.
  const cerrarMenu = () => {
    setMenuMovilAbierto(false);
  };

  // Función para abrir o cerrar el menú.
  const alternarMenu = () => {
    setMenuMovilAbierto((estadoActual) => !estadoActual);
  };

  // Función para cerrar sesión.
  const salir = () => {
    cerrarMenu();

    cerrarSesion();

    navigate("/login", {
      replace: true,
    });
  };

  // Nombre mostrado en la barra superior.
  const nombreUsuario = usuario
    ? `${usuario.nombre} ${usuario.apellidos}`.trim()
    : "Usuario";

  return (
    <div className="area-privada">
      {/* Barra superior del panel. */}
      <BarraSuperior
        nombreUsuario={nombreUsuario}
        menuAbierto={menuMovilAbierto}
        alternarMenu={alternarMenu}
        salir={salir}
      />

      <div className="area-privada__estructura">
        {/* Menú lateral del usuario. */}
        <MenuLateral abierto={menuMovilAbierto} cerrarMenu={cerrarMenu} />

        {/* Contenido de la página seleccionada. */}
        <main className="area-privada__contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PrivateLayout;
