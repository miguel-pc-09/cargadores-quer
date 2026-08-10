import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import PrivateLayout from "../layouts/PrivateLayout";

import AdministracionPage from "../pages/Administracion/AdministracionPage";
import ValidacionesPage from "../pages/Administracion/ValidacionesPage";
import AyudaPage from "../pages/Ayuda/AyudaPage";
import CargaActivaPage from "../pages/CargaActiva/CargaActivaPage";
import CargadoresPage from "../pages/Cargadores/CargadoresPage";
import CargasPage from "../pages/Cargas/CargasPage";
import DetalleCargadorPage from "../pages/DetalleCargador/DetalleCargadorPage";
import DetalleTomaPage from "../pages/DetalleToma/DetalleTomaPage";
import InicioPage from "../pages/Inicio/InicioPage";
import LoginPage from "../pages/Login/LoginPage";
import PerfilPage from "../pages/Perfil/PerfilPage";
import RecuperarContrasenaPage from "../pages/RecuperarContrasena/RecuperarContrasenaPage";
import RegistroPage from "../pages/Registro/RegistroPage";
import ReservaTomaPage from "../pages/ReservaToma/ReservaTomaPage";
import ReservasPage from "../pages/Reservas/ReservasPage";

import AdminRoute from "./AdminRoute";
import PrivateRoute from "./PrivateRoute";

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/registro" element={<RegistroPage />} />

      <Route
        path="/recuperar-contrasena"
        element={<RecuperarContrasenaPage />}
      />

      <Route element={<PrivateRoute />}>
        <Route path="/panel" element={<PrivateLayout />}>
          <Route index element={<InicioPage />} />

          <Route path="cargadores" element={<CargadoresPage />} />

          <Route
            path="cargadores/:cargadorId"
            element={<DetalleCargadorPage />}
          />

          <Route
            path="cargadores/:cargadorId/tomas/:tomaId"
            element={<DetalleTomaPage />}
          />

          <Route
            path="cargadores/:cargadorId/tomas/:tomaId/reservar"
            element={<ReservaTomaPage />}
          />

          <Route path="cargas/:cargaId" element={<CargaActivaPage />} />

          <Route path="mis-cargas" element={<CargasPage />} />

          <Route path="mis-reservas" element={<ReservasPage />} />

          <Route path="ayuda" element={<AyudaPage />} />

          <Route path="perfil" element={<PerfilPage />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/administracion" element={<AdminLayout />}>
          <Route index element={<AdministracionPage />} />

          <Route path="validaciones" element={<ValidacionesPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;
