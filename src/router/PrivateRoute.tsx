import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";

/*
 Protege todas las rutas privadas del panel de usuario.
 Antes de mostrar una página comprueba la sesión
 y también evita que un administrador entre en el panel normal.
 */
function PrivateRoute() {
  const { autenticado, cargandoSesion, esAdministrador } = useAuth();

  /*
   Guardo la ruta que estaba intentando visitar el usuario.
   Así queda disponible al enviarlo al login si no tiene sesión.
   */
  const location = useLocation();

  /*
   Mientras se comprueba si existe una sesión,
   muestro una pantalla sencilla de carga.
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
   Si no hay una sesión iniciada, envío al usuario al login.
   También guardo la ruta desde la que llegó.
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
   Si la cuenta pertenece a un administrador,
   no permito entrar en el panel de usuario y lo envío
   directamente a su zona de administración.
   */
  if (esAdministrador) {
    return <Navigate to="/administracion" replace />;
  }

  /*
   Si todas las comprobaciones son correctas,
   Outlet muestra la página privada solicitada.
   */
  return <Outlet />;
}

export default PrivateRoute;
