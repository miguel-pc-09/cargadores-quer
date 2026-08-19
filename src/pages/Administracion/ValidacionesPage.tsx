import { useCallback, useEffect, useState } from "react";

import {
  aceptarValidacion,
  obtenerValidacionesPendientes,
  rechazarValidacion,
  type ValidacionPendiente,
} from "../../services/solicitudesRegistroService";

import "../../styles/Administracion/ValidacionesPage.css";

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
      setProcesandoId(validacion.solicitudId);

      setError("");

      setMensaje("");

      await aceptarValidacion(validacion);

      setValidaciones((actuales) =>
        actuales.filter((item) => item.solicitudId !== validacion.solicitudId),
      );

      setMensaje(
        `La solicitud de ${validacion.nombre} ${validacion.apellidos} ha sido aprobada. La matrícula ${validacion.matricula} ya puede acceder al servicio.`,
      );
    } catch (errorValidacion) {
      setError(
        errorValidacion instanceof Error
          ? errorValidacion.message
          : "No se ha podido aceptar la solicitud.",
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
      setProcesandoId(validacion.solicitudId);

      setError("");

      setMensaje("");

      await rechazarValidacion(validacion);

      setValidaciones((actuales) =>
        actuales.filter((item) => item.solicitudId !== validacion.solicitudId),
      );

      setMensaje(
        `La solicitud de la matrícula ${validacion.matricula} ha sido rechazada.`,
      );
    } catch (errorValidacion) {
      setError(
        errorValidacion instanceof Error
          ? errorValidacion.message
          : "No se ha podido rechazar la solicitud.",
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
          Revisa las solicitudes pendientes antes de permitir el acceso al
          servicio.
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
        ) : (
          <div className="validaciones-admin__tabla-contenedor">
            <table className="validaciones-admin__tabla">
              <thead>
                <tr>
                  <th>Nombre</th>

                  <th>Documento</th>

                  <th>Correo</th>

                  <th>Matrícula</th>

                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {validaciones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="validaciones-admin__fila-vacia">
                      No hay validaciones pendientes.
                    </td>
                  </tr>
                ) : (
                  validaciones.map((validacion) => {
                    const procesando = procesandoId === validacion.solicitudId;

                    return (
                      <tr key={validacion.solicitudId}>
                        <td>
                          <strong>{obtenerNombreCompleto(validacion)}</strong>
                        </td>

                        <td>{validacion.dniProtegido}</td>

                        <td>{validacion.email}</td>

                        <td>
                          <span className="validaciones-admin__matricula">
                            {validacion.matricula}
                          </span>
                        </td>

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
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default ValidacionesPage;
