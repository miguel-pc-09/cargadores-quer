import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";

/*
 * Protege todas las rutas del panel de administración.
 * Comprueba que exista una sesión y que el usuario
 * tenga realmente permisos de administrador.
 */
function AdminRoute() {
  const { autenticado, cargandoSesion, esAdministrador } = useAuth();

  /*
   * Guardo la ruta que el usuario estaba intentando visitar
   * por si hay que enviarlo al inicio de sesión.
   */
  const location = useLocation();

  /*
   * Mientras se comprueba la sesión actual,
   * muestro un estado sencillo de carga.
   */
  if (cargandoSesion) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <p>Cargando sesión...</p>
      </div>
    );
  }

  /*
   * Si no existe una sesión iniciada,
   * envío al usuario al login.
   */
  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /*
   * Si hay sesión pero el usuario no es administrador,
   * no puede entrar en esta zona y vuelve al panel normal.
   */
  if (!esAdministrador) {
    return <Navigate to="/panel" replace />;
  }

  /*
   * Si tiene sesión y permisos de administrador,
   * Outlet muestra la página de administración solicitada.
   */
  return <Outlet />;
}

export default AdminRoute;
