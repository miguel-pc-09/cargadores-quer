import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

import "../styles/Administracion/AdminLayout.css";

type Tema = "oscuro" | "claro";

const TEMA_GUARDADO = "cargaquer-tema";

function obtenerTemaActual(): Tema {
  return document.documentElement.dataset.tema === "claro" ? "claro" : "oscuro";
}

function aplicarTema(tema: Tema) {
  document.documentElement.dataset.tema = tema;

  localStorage.setItem(TEMA_GUARDADO, tema);
}

function AdminLayout() {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const [tema, setTema] = useState<Tema>(() => obtenerTemaActual());

  const { usuario, cerrarSesion } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuMovilAbierto ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuMovilAbierto]);

  const salir = () => {
    cerrarSesion();

    navigate("/login", {
      replace: true,
    });
  };

  const cerrarMenu = () => {
    setMenuMovilAbierto(false);
  };

  const alternarTema = () => {
    const nuevoTema: Tema = tema === "oscuro" ? "claro" : "oscuro";

    aplicarTema(nuevoTema);

    setTema(nuevoTema);
  };

  return (
    <div className="admin-layout">
      <header className="admin-layout__barra">
        <div className="admin-layout__barra-contenido">
          <div className="admin-layout__zona-izquierda">
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

          <div className="admin-layout__servicio">
            <span>Servicio:</span>

            <strong>Ayuntamiento de Quer</strong>
          </div>

          <div className="admin-layout__usuario">
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

            <div className="admin-layout__avatar" aria-hidden="true">
              A
            </div>

            <div className="admin-layout__usuario-texto">
              <strong>{usuario?.nombre ?? "Ayuntamiento"}</strong>

              <span>Administrador</span>
            </div>

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

        <div className="admin-layout__servicio-movil">
          <span>Servicio:</span>

          <strong>Ayuntamiento de Quer</strong>
        </div>
      </header>

      <div className="admin-layout__estructura">
        <aside
          className={`admin-layout__lateral${
            menuMovilAbierto ? " admin-layout__lateral--abierto" : ""
          }`}
        >
          <nav className="admin-layout__navegacion">
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

        <button
          type="button"
          className={`admin-layout__fondo-menu${
            menuMovilAbierto ? " admin-layout__fondo-menu--visible" : ""
          }`}
          aria-label="Cerrar menú"
          onClick={cerrarMenu}
        />

        <main className="admin-layout__contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
