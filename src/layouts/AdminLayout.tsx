import { NavLink, Outlet } from "react-router-dom";

import "../styles/Admin/AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <header className="admin-layout__barra">
        <div className="admin-layout__barra-contenido">
          <div className="admin-layout__marca">
            <div className="admin-layout__logo">⚡</div>

            <div>
              <strong>CargaQuer</strong>

              <span>Panel del Ayuntamiento</span>
            </div>
          </div>

          <div className="admin-layout__usuario">
            <div className="admin-layout__avatar">A</div>

            <div className="admin-layout__usuario-datos">
              <strong>Ayuntamiento de Quer</strong>

              <span>Administrador</span>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-layout__estructura">
        <aside className="admin-layout__lateral">
          <nav className="admin-layout__navegacion">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `admin-layout__enlace${
                  isActive ? " admin-layout__enlace--activo" : ""
                }`
              }
            >
              <span aria-hidden="true">◫</span>

              <span>Resumen</span>
            </NavLink>

            <NavLink
              to="/admin/usuarios"
              className={({ isActive }) =>
                `admin-layout__enlace${
                  isActive ? " admin-layout__enlace--activo" : ""
                }`
              }
            >
              <span aria-hidden="true">♙</span>

              <span>Usuarios</span>
            </NavLink>

            <NavLink
              to="/admin/validaciones"
              className={({ isActive }) =>
                `admin-layout__enlace${
                  isActive ? " admin-layout__enlace--activo" : ""
                }`
              }
            >
              <span aria-hidden="true">✓</span>

              <span>Validaciones</span>
            </NavLink>

            <NavLink
              to="/admin/cargadores"
              className={({ isActive }) =>
                `admin-layout__enlace${
                  isActive ? " admin-layout__enlace--activo" : ""
                }`
              }
            >
              <span aria-hidden="true">⚡</span>

              <span>Cargadores</span>
            </NavLink>

            <NavLink
              to="/admin/incidencias"
              className={({ isActive }) =>
                `admin-layout__enlace${
                  isActive ? " admin-layout__enlace--activo" : ""
                }`
              }
            >
              <span aria-hidden="true">!</span>

              <span>Incidencias</span>
            </NavLink>
          </nav>
        </aside>

        <main className="admin-layout__contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
