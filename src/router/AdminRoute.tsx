import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";

function AdminRoute() {
  const { autenticado, cargandoSesion, esAdministrador } = useAuth();

  const location = useLocation();

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

  if (!esAdministrador) {
    return <Navigate to="/panel" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
