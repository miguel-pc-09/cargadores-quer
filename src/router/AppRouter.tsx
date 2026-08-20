import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import PrivateLayout from "../layouts/PrivateLayout";

import AdministracionPage from "../pages/Administracion/AdministracionPage";
import CargadoresAdminPage from "../pages/Administracion/CargadoresAdminPage";
import IncidenciasAdminPage from "../pages/Administracion/IncidenciasAdminPage";
import UsuariosPage from "../pages/Administracion/UsuariosPage";
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

/*
 Aquí se define toda la navegación de CargaQuer.
 Las rutas están separadas en tres grupos:
 públicas, privadas de usuario y privadas de administración.
 */
function AppRouter() {
  return (
    <Routes>
      {/*
       Rutas públicas.
       Se pueden visitar sin haber iniciado sesión.
       */}
      <Route path="/login" element={<LoginPage />} />

      <Route path="/registro" element={<RegistroPage />} />

      <Route
        path="/recuperar-contrasena"
        element={<RecuperarContrasenaPage />}
      />

      {/*
       Rutas privadas del usuario.
       PrivateRoute comprueba primero que exista una sesión válida.
       */}
      <Route element={<PrivateRoute />}>
        {/*
         PrivateLayout contiene la estructura común del panel:
         barra superior, navegación lateral y contenido principal.
         */}
        <Route path="/panel" element={<PrivateLayout />}>
          {/* Página principal del usuario */}
          <Route index element={<InicioPage />} />

          {/* Listado general de cargadores */}
          <Route path="cargadores" element={<CargadoresPage />} />

          {/* Información completa de un cargador concreto */}
          <Route
            path="cargadores/:cargadorId"
            element={<DetalleCargadorPage />}
          />

          {/* Información de una toma concreta */}
          <Route
            path="cargadores/:cargadorId/tomas/:tomaId"
            element={<DetalleTomaPage />}
          />

          {/* Proceso para reservar una toma */}
          <Route
            path="cargadores/:cargadorId/tomas/:tomaId/reservar"
            element={<ReservaTomaPage />}
          />

          {/* Seguimiento de una carga que está en curso */}
          <Route path="cargas/:cargaId" element={<CargaActivaPage />} />

          {/* Historial y resumen de cargas del usuario */}
          <Route path="mis-cargas" element={<CargasPage />} />

          {/* Reservas activas e histórico del usuario */}
          <Route path="mis-reservas" element={<ReservasPage />} />

          {/* Preguntas frecuentes e información de uso */}
          <Route path="ayuda" element={<AyudaPage />} />

          {/* Datos personales, vehículo y preferencias */}
          <Route path="perfil" element={<PerfilPage />} />
        </Route>
      </Route>

      {/*
       Rutas privadas de administración.
       AdminRoute comprueba que el usuario tenga permisos de administrador.
       */}
      <Route element={<AdminRoute />}>
        {/*
         AdminLayout contiene la estructura común
         de todo el panel del Ayuntamiento.
         */}
        <Route path="/administracion" element={<AdminLayout />}>
          {/* Resumen general del sistema */}
          <Route index element={<AdministracionPage />} />

          {/* Gestión de usuarios registrados */}
          <Route path="usuarios" element={<UsuariosPage />} />

          {/* Solicitudes y cambios pendientes de validar */}
          <Route path="validaciones" element={<ValidacionesPage />} />

          {/* Estado general de cargadores y tomas */}
          <Route path="cargadores" element={<CargadoresAdminPage />} />

          {/* Incidencias registradas en el sistema */}
          <Route path="incidencias" element={<IncidenciasAdminPage />} />
        </Route>
      </Route>

      {/*
       * Al entrar directamente en la raíz enviamos al login.
       */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/*
       Cualquier dirección que no exista vuelve al login
       en lugar de mostrar una página rota.
       */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;
