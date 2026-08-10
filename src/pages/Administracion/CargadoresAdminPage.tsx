import { Fragment, useCallback, useEffect, useState } from "react";

import {
  obtenerCargadoresAdministracion,
  type TomaAdministracion,
} from "../../services/adminService";

import "../../styles/Administracion/CargadoresAdminPage.css";

function formatearEstado(estado: string) {
  const estadoLimpio = estado.trim();

  if (!estadoLimpio) {
    return "Disponible";
  }

  return estadoLimpio.charAt(0).toUpperCase() + estadoLimpio.slice(1);
}

function obtenerClaseEstado(estado: string) {
  const estadoNormalizado = estado.toLowerCase();

  if (
    estadoNormalizado.includes("ocup") ||
    estadoNormalizado.includes("cargando")
  ) {
    return "cargadores-admin__estado--ocupado";
  }

  if (
    estadoNormalizado.includes("inactivo") ||
    estadoNormalizado.includes("fuera")
  ) {
    return "cargadores-admin__estado--inactivo";
  }

  return "cargadores-admin__estado--disponible";
}

function CargadoresAdminPage() {
  const [tomas, setTomas] = useState<TomaAdministracion[]>([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [tomaDesplegadaId, setTomaDesplegadaId] = useState<string | null>(null);

  const cargarCargadores = useCallback(async () => {
    try {
      setCargando(true);

      setError("");

      const resultado = await obtenerCargadoresAdministracion();

      setTomas(resultado);
    } catch (errorCarga) {
      setError(
        errorCarga instanceof Error
          ? errorCarga.message
          : "No se han podido cargar los cargadores.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarCargadores();
  }, [cargarCargadores]);

  function cambiarDesplegable(tomaId: string) {
    setTomaDesplegadaId((actual) => (actual === tomaId ? null : tomaId));
  }

  return (
    <section className="cargadores-admin">
      <header className="cargadores-admin__cabecera">
        <span className="cargadores-admin__etiqueta">Panel municipal</span>

        <h1>Cargadores</h1>

        <p>
          Consulta el estado de los cargadores, sus tomas y la actividad del
          servicio.
        </p>
      </header>

      {error && (
        <div className="cargadores-admin__mensaje-error" role="alert">
          <span aria-hidden="true">!</span>

          <p>{error}</p>
        </div>
      )}

      <section className="cargadores-admin__panel">
        <header className="cargadores-admin__panel-cabecera">
          <div>
            <span className="cargadores-admin__etiqueta">Infraestructura</span>

            <h2>Cargadores y tomas</h2>
          </div>

          <span className="cargadores-admin__contador">{tomas.length}</span>
        </header>

        {cargando ? (
          <div className="cargadores-admin__cargando">
            <span className="cargadores-admin__spinner" />

            <p>Cargando cargadores...</p>
          </div>
        ) : (
          <div className="cargadores-admin__tabla-contenedor">
            <table className="cargadores-admin__tabla">
              <thead>
                <tr>
                  <th>Cargador</th>

                  <th>Toma</th>

                  <th>Estado</th>

                  <th>Incidencias</th>

                  <th>Cargas esta semana</th>

                  <th>Información</th>
                </tr>
              </thead>

              <tbody>
                {tomas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="cargadores-admin__fila-vacia">
                      No hay cargadores disponibles.
                    </td>
                  </tr>
                ) : (
                  tomas.map((toma) => {
                    const desplegada = tomaDesplegadaId === toma.id;

                    return (
                      <Fragment key={toma.id}>
                        <tr
                          className={
                            desplegada ? "cargadores-admin__fila--abierta" : ""
                          }
                        >
                          <td>
                            <strong>{toma.cargadorNombre}</strong>
                          </td>

                          <td>{toma.tomaNombre}</td>

                          <td>
                            <span
                              className={`cargadores-admin__estado ${obtenerClaseEstado(
                                toma.estado,
                              )}`}
                            >
                              {formatearEstado(toma.estado)}
                            </span>
                          </td>

                          <td>
                            {toma.tieneIncidenciaAbierta ? (
                              <span className="cargadores-admin__incidencia cargadores-admin__incidencia--abierta">
                                Sí
                              </span>
                            ) : (
                              <span className="cargadores-admin__incidencia cargadores-admin__incidencia--correcto">
                                No
                              </span>
                            )}
                          </td>

                          <td>{toma.cargasSemana}</td>

                          <td>
                            <button
                              type="button"
                              className="cargadores-admin__boton-desplegar"
                              aria-expanded={desplegada}
                              onClick={() => cambiarDesplegable(toma.id)}
                            >
                              <span>{desplegada ? "Ocultar" : "Ver más"}</span>

                              <span
                                className={`cargadores-admin__flecha ${
                                  desplegada
                                    ? "cargadores-admin__flecha--abierta"
                                    : ""
                                }`}
                                aria-hidden="true"
                              >
                                ▾
                              </span>
                            </button>
                          </td>
                        </tr>

                        {desplegada && (
                          <tr className="cargadores-admin__fila-detalle">
                            <td colSpan={6}>
                              <div className="cargadores-admin__detalle">
                                <div className="cargadores-admin__detalle-dato">
                                  <span>Nº incidencias</span>

                                  <strong>{toma.numeroIncidencias}</strong>
                                </div>

                                <div className="cargadores-admin__detalle-dato">
                                  <span>Potencia</span>

                                  <strong>
                                    {toma.potenciaMaximaKw.toLocaleString(
                                      "es-ES",
                                      {
                                        maximumFractionDigits: 2,
                                      },
                                    )}{" "}
                                    kW
                                  </strong>
                                </div>

                                <div className="cargadores-admin__detalle-dato">
                                  <span>Cargas mensuales</span>

                                  <strong>{toma.cargasMes}</strong>
                                </div>

                                <div className="cargadores-admin__detalle-dato">
                                  <span>Cargas anuales</span>

                                  <strong>{toma.cargasAnio}</strong>
                                </div>

                                <div className="cargadores-admin__detalle-dato">
                                  <span>Energía suministrada</span>

                                  <strong>
                                    {toma.energiaSuministradaKwh.toLocaleString(
                                      "es-ES",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    )}{" "}
                                    kWh
                                  </strong>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
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

export default CargadoresAdminPage;
