import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

import "../styles/Administracion/AdminLayout.css";

/*
 Los dos temas disponibles actualmente en CargaQuer.
 */
type Tema = "oscuro" | "claro";

/*
 Clave utilizada para guardar el tema elegido
 y mantenerlo aunque se cierre o recargue la página.
 */
const TEMA_GUARDADO = "cargaquer-tema";

/*
 Obtiene el tema que está aplicado actualmente
 en el elemento principal del documento.
 */
function obtenerTemaActual(): Tema {
  return document.documentElement.dataset.tema === "claro" ? "claro" : "oscuro";
}

/*
 Aplica el nuevo tema a toda la aplicación
 y guarda la elección en el navegador.
 */
function aplicarTema(tema: Tema) {
  document.documentElement.dataset.tema = tema;

  localStorage.setItem(TEMA_GUARDADO, tema);
}

/*
 Estructura principal de toda la zona de administración.
 Aquí se encuentran la barra superior, el menú lateral,
 el cambio de tema y el espacio donde se cargan las páginas.
 */
function AdminLayout() {
  /*
   Controla la apertura del menú lateral en dispositivos móviles.
   */
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  /*
   Mantiene sincronizado el tema actual para poder
   alternar entre modo oscuro y modo claro.
   */
  const [tema, setTema] = useState<Tema>(() => obtenerTemaActual());

  /*
   Obtengo los datos del administrador actual
   y la función necesaria para cerrar su sesión.
   */
  const { usuario, cerrarSesion } = useAuth();

  const navigate = useNavigate();

  /*
   Bloquea el desplazamiento de la página cuando
   el menú lateral está abierto en un dispositivo móvil.
   */
  useEffect(() => {
    document.body.style.overflow = menuMovilAbierto ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuMovilAbierto]);

  /*
   * Cierra la sesión del administrador
   * y lo devuelve a la pantalla de acceso.
   */
  const salir = () => {
    cerrarSesion();

    navigate("/login", {
      replace: true,
    });
  };

  /*
   Cierra el menú lateral.
   Se utiliza al seleccionar una sección o pulsar fuera del menú.
   */
  const cerrarMenu = () => {
    setMenuMovilAbierto(false);
  };

  /*
   Cambia entre el modo oscuro y el modo claro
   y guarda la nueva selección.
   */
  const alternarTema = () => {
    const nuevoTema: Tema = tema === "oscuro" ? "claro" : "oscuro";

    aplicarTema(nuevoTema);

    setTema(nuevoTema);
  };

  return (
    <div className="admin-layout">
      {/* Barra superior del panel de administración */}
      <header className="admin-layout__barra">
        <div className="admin-layout__barra-contenido">
          <div className="admin-layout__zona-izquierda">
            {/*
             Botón para abrir y cerrar el menú lateral
             cuando se utiliza la aplicación desde móvil.
             */}
            <button
              type="button"
              className="admin-layout__menu-movil"
              aria-label="Abrir menú de administración"
              aria-expanded={menuMovilAbierto}
              onClick={() =>
                setMenuMovilAbierto((estadoActual) => !estadoActual)
              }
            >
              ☰
            </button>

            {/* Identidad de CargaQuer dentro de administración */}
            <div className="admin-layout__marca">
              <div className="admin-layout__logo" aria-hidden="true">
                ⚡
              </div>

              <div className="admin-layout__marca-texto">
                <strong>CargaQuer</strong>

                <span>Gestión municipal</span>
              </div>
            </div>
          </div>

          {/* Ayuntamiento al que pertenece el panel */}
          <div className="admin-layout__servicio">
            <span>Servicio:</span>

            <strong>Ayuntamiento de Quer</strong>
          </div>

          {/* Datos y acciones del administrador conectado */}
          <div className="admin-layout__usuario">
            {/*
             * Botón para cambiar entre el modo claro y oscuro.
             */}
            <button
              type="button"
              className="admin-layout__tema"
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

            {/* Avatar del administrador */}
            <div className="admin-layout__avatar" aria-hidden="true">
              A
            </div>

            {/* Nombre y tipo de cuenta */}
            <div className="admin-layout__usuario-texto">
              <strong>{usuario?.nombre ?? "Ayuntamiento"}</strong>

              <span>Administrador</span>
            </div>

            {/* Cierre de sesión */}
            <button
              type="button"
              className="admin-layout__salir"
              onClick={salir}
            >
              <span aria-hidden="true">↪</span>

              <span>Salir</span>
            </button>
          </div>
        </div>

        {/*
         Versión del nombre del servicio preparada
         específicamente para pantallas pequeñas.
         */}
        <div className="admin-layout__servicio-movil">
          <span>Servicio:</span>

          <strong>Ayuntamiento de Quer</strong>
        </div>
      </header>
      <div className="admin-layout__estructura">
        {/*
         Menú lateral principal de administración.
         En móvil recibe una clase adicional cuando está abierto.
         */}
        <aside
          className={`admin-layout__lateral${
            menuMovilAbierto ? " admin-layout__lateral--abierto" : ""
          }`}
        >
          <nav className="admin-layout__navegacion">
            {/* Resumen general */}
            <NavLink
              to="/administracion"
              end
              onClick={cerrarMenu}
              className={({ isActive }) =>
                `admin-layout__enlace${
                  isActive ? " admin-layout__enlace--activo" : ""
                }`
              }
            >
              <span className="admin-layout__enlace-icono">◫</span>

              <span>Resumen</span>
            </NavLink>

            {/* Gestión de usuarios */}
            <NavLink
              to="/administracion/usuarios"
              onClick={cerrarMenu}
              className={({ isActive }) =>
                `admin-layout__enlace${
                  isActive ? " admin-layout__enlace--activo" : ""
                }`
              }
            >
              <span className="admin-layout__enlace-icono">♙</span>

              <span>Usuarios</span>
            </NavLink>

            {/* Solicitudes pendientes de validar */}
            <NavLink
              to="/administracion/validaciones"
              onClick={cerrarMenu}
              className={({ isActive }) =>
                `admin-layout__enlace${
                  isActive ? " admin-layout__enlace--activo" : ""
                }`
              }
            >
              <span className="admin-layout__enlace-icono">✓</span>

              <span>Validaciones</span>
            </NavLink>

            {/* Estado y gestión de cargadores */}
            <NavLink
              to="/administracion/cargadores"
              onClick={cerrarMenu}
              className={({ isActive }) =>
                `admin-layout__enlace${
                  isActive ? " admin-layout__enlace--activo" : ""
                }`
              }
            >
              <span className="admin-layout__enlace-icono">⚡</span>

              <span>Cargadores</span>
            </NavLink>

            {/* Incidencias registradas */}
            <NavLink
              to="/administracion/incidencias"
              onClick={cerrarMenu}
              className={({ isActive }) =>
                `admin-layout__enlace${
                  isActive ? " admin-layout__enlace--activo" : ""
                }`
              }
            >
              <span className="admin-layout__enlace-icono">!</span>

              <span>Incidencias</span>
            </NavLink>
          </nav>
        </aside>

        {/*
         Fondo que aparece detrás del menú en móvil.
         Al pulsarlo se cierra el menú lateral.
         */}
        <button
          type="button"
          className={`admin-layout__fondo-menu${
            menuMovilAbierto ? " admin-layout__fondo-menu--visible" : ""
          }`}
          aria-label="Cerrar menú"
          onClick={cerrarMenu}
        />

        {/*
         Aquí se muestra la página de administración
         correspondiente a la opción seleccionada.
         */}
        <main className="admin-layout__contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
