import { NavLink } from "react-router-dom";

// Propiedades del menú lateral.
interface MenuLateralProps {
  abierto?: boolean;
  cerrarMenu?: () => void;
}

// Función para marcar el enlace activo.
function obtenerClaseEnlace({ isActive }: { isActive: boolean }) {
  return [
    "menu-lateral__enlace",
    isActive ? "menu-lateral__enlace--activo" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

// Componente del menú lateral.
function MenuLateral({
  abierto = false,
  cerrarMenu = () => undefined,
}: MenuLateralProps) {
  return (
    <>
      {/* Fondo para cerrar el menú en móvil. */}
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
          {/* Acceso al inicio. */}
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

          {/* Acceso a cargadores. */}
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

          {/* Acceso a las cargas. */}
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

          {/* Acceso a las reservas. */}
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

          {/* Acceso a ayuda. */}
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

          {/* Separador de la cuenta. */}
          <div className="menu-lateral__separador">
            <span>Cuenta</span>
          </div>

          {/* Acceso al perfil. */}
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
