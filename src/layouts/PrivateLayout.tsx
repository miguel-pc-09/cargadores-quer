import { useEffect, useState } from "react";

import { Outlet, useNavigate } from "react-router-dom";

import BarraSuperior from "../components/panelUsuario/BarraSuperior";
import MenuLateral from "../components/panelUsuario/MenuLateral";

import useAuth from "../hooks/useAuth";

import "../styles/PanelUsuario/PrivateLayout.css";

/*
 Estructura principal de toda la zona privada del usuario.
 Aquí se mantienen la barra superior, el menú lateral
 y el espacio donde se muestra cada página del panel.
 */
function PrivateLayout() {
  /*
   Controla si el menú lateral está abierto o cerrado
   cuando la aplicación se utiliza desde un móvil.
   */
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  /*
   Obtengo los datos del usuario actual y la función
   necesaria para cerrar su sesión.
   */
  const { usuario, cerrarSesion } = useAuth();

  const navigate = useNavigate();

  /*
   Cuando el menú móvil está abierto bloqueo el scroll de la página.
   Al cerrarlo o abandonar este layout recupero el comportamiento normal.
   */
  useEffect(() => {
    document.body.style.overflow = menuMovilAbierto ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuMovilAbierto]);

  /*
   Cierra el menú lateral móvil.
   Se utiliza también al navegar a otra sección.
   */
  const cerrarMenu = () => {
    setMenuMovilAbierto(false);
  };

  /*
   Abre o cierra el menú móvil dependiendo
   del estado en el que se encuentre.
   */
  const alternarMenu = () => {
    setMenuMovilAbierto((estadoActual) => !estadoActual);
  };

  /*
   Cierra la sesión del usuario y lo devuelve al login.
   Antes cierro también el menú móvil por si estaba abierto.
   */
  const salir = () => {
    cerrarMenu();

    cerrarSesion();

    navigate("/login", {
      replace: true,
    });
  };

  /*
   Preparo el nombre completo que se mostrará
   en la barra superior del panel.
   */
  const nombreUsuario = usuario
    ? `${usuario.nombre} ${usuario.apellidos}`.trim()
    : "Usuario";

  return (
    <div className="area-privada">
      {/*
       Barra superior común de todas las páginas privadas.
       Recibe el nombre del usuario y los controles del menú y sesión.
       */}
      <BarraSuperior
        nombreUsuario={nombreUsuario}
        menuAbierto={menuMovilAbierto}
        alternarMenu={alternarMenu}
        salir={salir}
      />
      ∫
      <div className="area-privada__estructura">
        {/*
         Menú principal para navegar entre las distintas
         secciones de la cuenta del usuario.
         */}
        <MenuLateral abierto={menuMovilAbierto} cerrarMenu={cerrarMenu} />

        {/*
         Outlet muestra aquí la página correspondiente:
         Inicio, Cargadores, Mis cargas, Mis reservas, Ayuda o Perfil.
         */}
        <main className="area-privada__contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PrivateLayout;
