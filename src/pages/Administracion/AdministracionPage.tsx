import { useCallback, useEffect, useState } from "react";

import {
  type MovimientoAdministracion,
  type ResumenAdministracion,
} from "../../services/adminService";

import { obtenerResumenAdministracionConSolicitudes } from "../../services/solicitudesRegistroService";

import "../../styles/Administracion/AdministracionPage.css";

function formatearNumero(numero: number) {
  return numero.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function obtenerClaseEstado(estado: MovimientoAdministracion["estado"]) {
  switch (estado) {
    case "pendiente":
      return "administracion__estado--pendiente";

    case "incidencia":
      return "administracion__estado--incidencia";

    default:
      return "administracion__estado--correcto";
  }
}

function obtenerTextoEstado(estado: MovimientoAdministracion["estado"]) {
  switch (estado) {
    case "pendiente":
      return "Pendiente";

    case "incidencia":
      return "Revisar";

    default:
      return "Correcto";
  }
}

function AdministracionPage() {
  const [resumen, setResumen] = useState<ResumenAdministracion | null>(null);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const cargarResumen = useCallback(async () => {
    try {
      setCargando(true);

      setError("");

      const resultado = await obtenerResumenAdministracionConSolicitudes();

      setResumen(resultado);
    } catch (errorCarga) {
      setError(
        errorCarga instanceof Error
          ? errorCarga.message
          : "No se ha podido cargar el resumen de administración.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarResumen();
  }, [cargarResumen]);

  return (
    <section className="administracion">
      <header className="administracion__cabecera">
        <span className="administracion__etiqueta">Panel municipal</span>

        <h1>Resumen</h1>

        <p>
          Consulta el estado general del servicio de recarga eléctrica de Quer.
        </p>
      </header>

      {error && (
        <div className="administracion__error" role="alert">
          <span aria-hidden="true">!</span>

          <p>{error}</p>
        </div>
      )}

      {cargando || !resumen ? (
        <div className="administracion__cargando">
          <span className="administracion__spinner" aria-hidden="true" />

          <p>Cargando resumen municipal...</p>
        </div>
      ) : (
        <>
          <section className="administracion__metricas">
            <article className="administracion__metrica">
              <span>Usuarios registrados</span>

              <strong>{resumen.usuariosRegistrados}</strong>

              <small>{resumen.usuariosActivos} usuarios activos</small>
            </article>

            <article className="administracion__metrica">
              <span>Cargas realizadas</span>

              <strong>{resumen.cargasRealizadas}</strong>

              <small>Total acumulado</small>
            </article>

            <article className="administracion__metrica">
              <span>Energía suministrada</span>

              <strong>
                {formatearNumero(resumen.energiaSuministradaKwh)} kWh
              </strong>

              <small>Total acumulado</small>
            </article>

            <article className="administracion__metrica administracion__metrica--pendiente">
              <span>Validaciones pendientes</span>

              <strong>{resumen.validacionesPendientes}</strong>

              <small>Solicitudes de acceso</small>
            </article>

            <article className="administracion__metrica administracion__metrica--incidencia">
              <span>Incidencias abiertas</span>

              <strong>{resumen.incidenciasAbiertas}</strong>

              <small>Requieren revisión</small>
            </article>

            <article className="administracion__metrica">
              <span>Cargadores</span>

              <strong>{resumen.cargadores}</strong>

              <small>{resumen.tomas} tomas instaladas</small>
            </article>
          </section>

          <section className="administracion__panel">
            <header className="administracion__panel-cabecera">
              <div>
                <span className="administracion__etiqueta">Actividad</span>

                <h2>Últimos movimientos</h2>
              </div>
            </header>

            <div className="administracion__tabla-contenedor">
              <table className="administracion__tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>

                    <th>Usuario</th>

                    <th>Acción</th>

                    <th>Cargador</th>

                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {resumen.movimientos.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td>{movimiento.fecha}</td>

                      <td>{movimiento.usuario}</td>

                      <td>{movimiento.accion}</td>

                      <td>{movimiento.cargador}</td>

                      <td>
                        <span
                          className={`administracion__estado ${obtenerClaseEstado(
                            movimiento.estado,
                          )}`}
                        >
                          {obtenerTextoEstado(movimiento.estado)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
}

export default AdministracionPage;
