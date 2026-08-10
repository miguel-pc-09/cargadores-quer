import { useCallback, useEffect, useState } from "react";

import {
  aceptarValidacion,
  obtenerValidacionesPendientes,
  rechazarValidacion,
  type ValidacionPendiente,
} from "../../services/adminService";

import "../../styles/Administracion/ValidacionesPage.css";

function formatearFecha(fechaTexto: string) {
  const fecha = new Date(fechaTexto);

  if (Number.isNaN(fecha.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

function obtenerNombreCompleto(validacion: ValidacionPendiente) {
  return `${validacion.nombre} ${validacion.apellidos}`.trim();
}

function ValidacionesPage() {
  const [validaciones, setValidaciones] = useState<ValidacionPendiente[]>([]);

  const [cargando, setCargando] = useState(true);

  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const [mensaje, setMensaje] = useState("");

  const [error, setError] = useState("");

  const cargarValidaciones = useCallback(async () => {
    try {
      setCargando(true);

      setError("");

      const resultado = await obtenerValidacionesPendientes();

      setValidaciones(resultado);
    } catch (errorCarga) {
      setError(
        errorCarga instanceof Error
          ? errorCarga.message
          : "No se han podido cargar las validaciones.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarValidaciones();
  }, [cargarValidaciones]);

  async function aceptar(validacion: ValidacionPendiente) {
    if (procesandoId) {
      return;
    }

    try {
      setProcesandoId(validacion.vehiculoId);

      setError("");

      setMensaje("");

      await aceptarValidacion(validacion);

      setValidaciones((actuales) =>
        actuales.filter((item) => item.vehiculoId !== validacion.vehiculoId),
      );

      setMensaje(
        `La matrícula ${validacion.matricula} ha sido validada y la cuenta ya puede acceder al servicio.`,
      );
    } catch (errorValidacion) {
      setError(
        errorValidacion instanceof Error
          ? errorValidacion.message
          : "No se ha podido aceptar la validación.",
      );
    } finally {
      setProcesandoId(null);
    }
  }

  async function rechazar(validacion: ValidacionPendiente) {
    if (procesandoId) {
      return;
    }

    try {
      setProcesandoId(validacion.vehiculoId);

      setError("");

      setMensaje("");

      await rechazarValidacion(validacion);

      setValidaciones((actuales) =>
        actuales.filter((item) => item.vehiculoId !== validacion.vehiculoId),
      );

      setMensaje(`La matrícula ${validacion.matricula} ha sido rechazada.`);
    } catch (errorValidacion) {
      setError(
        errorValidacion instanceof Error
          ? errorValidacion.message
          : "No se ha podido rechazar la validación.",
      );
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <section className="validaciones-admin">
      <header className="validaciones-admin__cabecera">
        <span className="validaciones-admin__etiqueta">Panel municipal</span>

        <h1>Validaciones</h1>

        <p>
          Revisa las solicitudes pendientes antes de permitir el acceso a las
          reservas y cargas.
        </p>
      </header>

      {mensaje && (
        <div
          className="validaciones-admin__mensaje validaciones-admin__mensaje--correcto"
          role="status"
        >
          <span aria-hidden="true">✓</span>

          <p>{mensaje}</p>
        </div>
      )}

      {error && (
        <div
          className="validaciones-admin__mensaje validaciones-admin__mensaje--error"
          role="alert"
        >
          <span aria-hidden="true">!</span>

          <p>{error}</p>
        </div>
      )}

      <section className="validaciones-admin__panel">
        <header className="validaciones-admin__panel-cabecera">
          <div>
            <span className="validaciones-admin__etiqueta">Solicitudes</span>

            <h2>Pendientes de revisión</h2>
          </div>

          <span className="validaciones-admin__contador">
            {validaciones.length}
          </span>
        </header>

        {cargando ? (
          <div className="validaciones-admin__estado-vacio">
            <span className="validaciones-admin__spinner" />

            <p>Cargando validaciones...</p>
          </div>
        ) : validaciones.length === 0 ? (
          <div className="validaciones-admin__estado-vacio">
            <span
              className="validaciones-admin__vacio-icono"
              aria-hidden="true"
            >
              ✓
            </span>

            <h3>No hay validaciones pendientes</h3>

            <p>Todas las solicitudes están revisadas.</p>
          </div>
        ) : (
          <>
            <div className="validaciones-admin__tabla-contenedor">
              <table className="validaciones-admin__tabla">
                <thead>
                  <tr>
                    <th>Usuario</th>

                    <th>DNI / NIE</th>

                    <th>Teléfono</th>

                    <th>Matrícula</th>

                    <th>Solicitud</th>

                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {validaciones.map((validacion) => {
                    const procesando = procesandoId === validacion.vehiculoId;

                    return (
                      <tr key={validacion.vehiculoId}>
                        <td>
                          <strong>{obtenerNombreCompleto(validacion)}</strong>
                        </td>

                        <td>{validacion.dni}</td>

                        <td>{validacion.telefono}</td>

                        <td>
                          <span className="validaciones-admin__matricula">
                            {validacion.matricula}
                          </span>
                        </td>

                        <td>{formatearFecha(validacion.creadoEn)}</td>

                        <td>
                          <div className="validaciones-admin__acciones">
                            <button
                              type="button"
                              className="validaciones-admin__boton validaciones-admin__boton--aceptar"
                              disabled={procesando}
                              onClick={() => void aceptar(validacion)}
                            >
                              {procesando ? "Procesando..." : "Aceptar"}
                            </button>

                            <button
                              type="button"
                              className="validaciones-admin__boton validaciones-admin__boton--rechazar"
                              disabled={procesando}
                              onClick={() => void rechazar(validacion)}
                            >
                              Rechazar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="validaciones-admin__lista-movil">
              {validaciones.map((validacion) => {
                const procesando = procesandoId === validacion.vehiculoId;

                return (
                  <article
                    key={validacion.vehiculoId}
                    className="validaciones-admin__tarjeta"
                  >
                    <header className="validaciones-admin__tarjeta-cabecera">
                      <div>
                        <span>Usuario</span>

                        <strong>{obtenerNombreCompleto(validacion)}</strong>
                      </div>

                      <span className="validaciones-admin__estado">
                        Pendiente
                      </span>
                    </header>

                    <dl className="validaciones-admin__datos">
                      <div>
                        <dt>Matrícula</dt>

                        <dd>{validacion.matricula}</dd>
                      </div>

                      <div>
                        <dt>DNI / NIE</dt>

                        <dd>{validacion.dni}</dd>
                      </div>

                      <div>
                        <dt>Teléfono</dt>

                        <dd>{validacion.telefono}</dd>
                      </div>

                      <div>
                        <dt>Solicitud</dt>

                        <dd>{formatearFecha(validacion.creadoEn)}</dd>
                      </div>
                    </dl>

                    <div className="validaciones-admin__acciones validaciones-admin__acciones--movil">
                      <button
                        type="button"
                        className="validaciones-admin__boton validaciones-admin__boton--aceptar"
                        disabled={procesando}
                        onClick={() => void aceptar(validacion)}
                      >
                        {procesando ? "Procesando..." : "Aceptar"}
                      </button>

                      <button
                        type="button"
                        className="validaciones-admin__boton validaciones-admin__boton--rechazar"
                        disabled={procesando}
                        onClick={() => void rechazar(validacion)}
                      >
                        Rechazar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </section>
  );
}

export default ValidacionesPage;
