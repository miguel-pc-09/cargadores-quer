import { NavLink } from "react-router-dom";

interface MenuLateralProps {
  abierto?: boolean;
  cerrarMenu?: () => void;
}

function obtenerClaseEnlace({ isActive }: { isActive: boolean }) {
  return [
    "menu-lateral__enlace",
    isActive ? "menu-lateral__enlace--activo" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function MenuLateral({
  abierto = false,
  cerrarMenu = () => undefined,
}: MenuLateralProps) {
  return (
    <>
      <button
        type="button"
        className={`menu-lateral__fondo ${
          abierto ? "menu-lateral__fondo--visible" : ""
        }`}
        aria-label="Cerrar menú"
        onClick={cerrarMenu}
      />

      <aside
        className={`menu-lateral ${abierto ? "menu-lateral--abierto" : ""}`}
      >
        <nav
          className="menu-lateral__navegacion"
          aria-label="Navegación del área de usuario"
        >
          <NavLink
            to="/panel"
            end
            className={obtenerClaseEnlace}
            onClick={cerrarMenu}
          >
            <span className="menu-lateral__icono" aria-hidden="true">
              ⌂
            </span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/panel/cargadores"
            className={obtenerClaseEnlace}
            onClick={cerrarMenu}
          >
            <span className="menu-lateral__icono" aria-hidden="true">
              ⚡
            </span>
            <span>Cargadores</span>
          </NavLink>

          <NavLink
            to="/panel/mis-cargas"
            className={obtenerClaseEnlace}
            onClick={cerrarMenu}
          >
            <span className="menu-lateral__icono" aria-hidden="true">
              ▤
            </span>
            <span>Mis cargas</span>
          </NavLink>

          <NavLink
            to="/panel/mis-reservas"
            className={obtenerClaseEnlace}
            onClick={cerrarMenu}
          >
            <span className="menu-lateral__icono" aria-hidden="true">
              ▣
            </span>
            <span>Mis reservas</span>
          </NavLink>

          <NavLink
            to="/panel/ayuda"
            className={obtenerClaseEnlace}
            onClick={cerrarMenu}
          >
            <span className="menu-lateral__icono" aria-hidden="true">
              ?
            </span>
            <span>Ayuda</span>
          </NavLink>

          <div className="menu-lateral__separador">
            <span>Cuenta</span>
          </div>

          <NavLink
            to="/panel/perfil"
            className={obtenerClaseEnlace}
            onClick={cerrarMenu}
          >
            <span className="menu-lateral__icono" aria-hidden="true">
              ♙
            </span>
            <span>Perfil</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

export default MenuLateral;
