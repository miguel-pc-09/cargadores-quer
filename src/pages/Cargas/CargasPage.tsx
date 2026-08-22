import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import { obtenerCargasUsuario } from "../../services/cargasService";
import { obtenerCargadores } from "../../services/chargersService";

import {
  calcularEstadisticasCargas,
  formatearCoste,
  formatearEnergia,
  formatearTiempoTotal,
} from "../../services/estadisticasService";

import type { Carga } from "../../types/carga";
import type { Cargador } from "../../types/charger";

import "../../styles/Cargas/CargasPage.css";

// Estado recibido al navegar hasta Mis cargas.
interface EstadoNavegacion {
  mensaje?: string;
}

// Formatea una fecha y hora.
function formatearFechaHora(fechaIso: string) {
  const fecha = new Date(fechaIso);

  if (Number.isNaN(fecha.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

// Calcula la duración real de una carga.
function calcularDuracionReal(carga: Carga) {
  const inicio = new Date(carga.fechaHoraInicio).getTime();

  const fin = carga.fechaHoraFinReal
    ? new Date(carga.fechaHoraFinReal).getTime()
    : Date.now();

  const finPrevisto = new Date(carga.fechaHoraFinPrevista).getTime();

  const finLimitado =
    carga.estado === "activa" && !Number.isNaN(finPrevisto)
      ? Math.min(fin, finPrevisto)
      : fin;

  if (Number.isNaN(inicio) || Number.isNaN(finLimitado)) {
    return 0;
  }

  return Math.max(0, Math.round((finLimitado - inicio) / 60_000));
}

// Obtiene la información del cargador y la toma.
function obtenerInformacionCargador(carga: Carga, cargadores: Cargador[]) {
  const cargador = cargadores.find(
    (cargadorActual) => cargadorActual.id === carga.cargadorId,
  );

  if (!cargador) {
    return {
      cargador: "Cargador no disponible",
      toma: "",
    };
  }

  const toma = cargador.tomas.find(
    (tomaActual) => tomaActual.id === carga.tomaId,
  );

  return {
    cargador: cargador.nombre,
    toma: toma?.nombre ?? "Toma no disponible",
  };
}

function CargasPage() {
  const location = useLocation();

  const navigate = useNavigate();

  const { usuario } = useAuth();

  const usuarioId = usuario?.id ?? "";

  const estadoNavegacion = location.state as EstadoNavegacion | null;

  // Estado para guardar las cargas.
  const [cargas, setCargas] = useState<Carga[]>([]);

  // Estado para guardar los cargadores.
  const [cargadores, setCargadores] = useState<Cargador[]>([]);

  // Estado para controlar la carga inicial.
  const [cargando, setCargando] = useState(true);

  // Estado para mostrar mensajes correctos.
  const [mensajeExito, setMensajeExito] = useState(
    estadoNavegacion?.mensaje ?? "",
  );

  // Estado para mostrar errores.
  const [mensajeError, setMensajeError] = useState("");

  // Función para cargar los datos.
  const cargarDatos = useCallback(
    async (mostrarCarga = false) => {
      if (!usuarioId) {
        setCargas([]);
        setCargadores([]);
        setCargando(false);

        return;
      }

      if (mostrarCarga) {
        setCargando(true);
      }

      setMensajeError("");

      try {
        const [cargasUsuario, cargadoresMunicipales] = await Promise.all([
          obtenerCargasUsuario(usuarioId),
          obtenerCargadores(),
        ]);

        setCargas(cargasUsuario);

        setCargadores(cargadoresMunicipales);
      } catch (error) {
        console.error("Error al cargar la información de Mis cargas:", error);

        setMensajeError("No hemos podido cargar tu historial de cargas.");
      } finally {
        if (mostrarCarga) {
          setCargando(false);
        }
      }
    },
    [usuarioId],
  );

  // Carga los datos al abrir la pantalla.
  useEffect(() => {
    void cargarDatos(true);
  }, [cargarDatos]);

  // Comprueba si existe alguna carga activa.
  const hayCargaActiva = useMemo(
    () => cargas.some((carga) => carga.estado === "activa"),
    [cargas],
  );

  // Actualiza las cargas mientras exista una sesión activa.
  useEffect(() => {
    if (!hayCargaActiva) {
      return;
    }

    const intervalo = window.setInterval(() => {
      void cargarDatos();
    }, 5000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [cargarDatos, hayCargaActiva]);

  // Actualiza los datos al volver a la pestaña.
  useEffect(() => {
    const actualizarAlVolver = () => {
      if (document.visibilityState === "visible") {
        void cargarDatos();
      }
    };

    document.addEventListener("visibilitychange", actualizarAlVolver);

    return () => {
      document.removeEventListener("visibilitychange", actualizarAlVolver);
    };
  }, [cargarDatos]);

  // Limpia el mensaje recibido por navegación.
  useEffect(() => {
    if (!estadoNavegacion?.mensaje) {
      return;
    }

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [estadoNavegacion, location.pathname, navigate]);

  // Calcula las estadísticas.
  const estadisticas = useMemo(
    () => calcularEstadisticasCargas(cargas),
    [cargas],
  );

  // Ordena las cargas por fecha.
  const cargasOrdenadas = useMemo(
    () =>
      [...cargas].sort(
        (cargaA, cargaB) =>
          new Date(cargaB.fechaHoraInicio).getTime() -
          new Date(cargaA.fechaHoraInicio).getTime(),
      ),
    [cargas],
  );

  return (
    <section className="mis-cargas">
      <header className="mis-cargas__cabecera">
        <h1>Mis cargas</h1>
      </header>

      {mensajeExito && (
        <div className="mis-cargas__mensaje-exito" role="status">
          <span aria-hidden="true">✓</span>

          <p>{mensajeExito}</p>

          <button
            type="button"
            aria-label="Cerrar mensaje"
            onClick={() => setMensajeExito("")}
          >
            ×
          </button>
        </div>
      )}

      {mensajeError && (
        <div className="mis-cargas__mensaje-error" role="alert">
          <span aria-hidden="true">!</span>

          <p>{mensajeError}</p>
        </div>
      )}

      {cargando ? (
        <div className="mis-cargas__cargando" role="status">
          <span className="mis-cargas__spinner" aria-hidden="true" />

          <p>Cargando tus sesiones...</p>
        </div>
      ) : cargasOrdenadas.length === 0 ? (
        <div className="mis-cargas__vacio">
          <span className="mis-cargas__vacio-icono" aria-hidden="true">
            ⚡
          </span>

          <h2>Todavía no tienes cargas</h2>

          <p>
            Cuando finalices tu primera sesión, aparecerá aquí con su duración y
            energía suministrada.
          </p>

          <Link to="/panel/cargadores" className="mis-cargas__buscar">
            Buscar cargador
          </Link>
        </div>
      ) : (
        <>
          <section
            className="mis-cargas__resumen-principal"
            aria-label="Resumen de cargas"
          >
            <span>Total acumulado</span>

            <strong>
              {formatearEnergia(estadisticas.energiaTotalKwh)} kWh
            </strong>

            <p>
              {estadisticas.numeroSesiones}{" "}
              {estadisticas.numeroSesiones === 1 ? "sesión" : "sesiones"}
            </p>
          </section>

          <section
            className="mis-cargas__estadisticas"
            aria-label="Estadísticas de carga"
          >
            <article className="mis-cargas__estadistica">
              <span>Este mes</span>

              <strong>
                {formatearEnergia(estadisticas.energiaMesActualKwh)} kWh
              </strong>
            </article>

            <article className="mis-cargas__estadistica">
              <span>Tiempo total</span>

              <strong>
                {formatearTiempoTotal(estadisticas.tiempoTotalMinutos)}
              </strong>
            </article>

            <article className="mis-cargas__estadistica mis-cargas__estadistica--coste">
              <span>Coste estimado</span>

              <strong>
                {estadisticas.costeDisponible &&
                estadisticas.costeEstimadoEuros !== null
                  ? formatearCoste(estadisticas.costeEstimadoEuros)
                  : "Pendiente de tarifa"}
              </strong>
            </article>
          </section>

          <section
            className="mis-cargas__historial"
            aria-label="Historial de cargas"
          >
            <table className="mis-cargas__tabla">
              <thead>
                <tr>
                  <th>Inicio</th>

                  <th>Fin</th>

                  <th>Cargador / Toma</th>

                  <th>Duración</th>

                  <th>Energía</th>
                </tr>
              </thead>

              <tbody>
                {cargasOrdenadas.map((carga) => {
                  const fechaFin =
                    carga.fechaHoraFinReal ?? carga.fechaHoraFinPrevista;

                  const duracionReal = calcularDuracionReal(carga);

                  const informacionCargador = obtenerInformacionCargador(
                    carga,
                    cargadores,
                  );

                  return (
                    <tr key={carga.id}>
                      <td>{formatearFechaHora(carga.fechaHoraInicio)}</td>

                      <td>
                        {carga.estado === "activa"
                          ? "En curso"
                          : formatearFechaHora(fechaFin)}
                      </td>

                      <td className="mis-cargas__cargador">
                        <Link
                          to={
                            carga.estado === "activa"
                              ? `/panel/cargas/${carga.id}`
                              : `/panel/cargadores/${carga.cargadorId}`
                          }
                          className="mis-cargas__cargador"
                          title={
                            carga.estado === "activa"
                              ? "Ver carga en curso"
                              : "Ver cargador"
                          }
                        >
                          <strong>{informacionCargador.cargador}</strong>

                          {informacionCargador.toma && (
                            <span>{informacionCargador.toma}</span>
                          )}
                        </Link>
                      </td>

                      <td className="mis-cargas__duracion">
                        {formatearTiempoTotal(duracionReal)}
                      </td>

                      <td className="mis-cargas__energia">
                        {formatearEnergia(carga.energiaConsumidaKwh)} kWh
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </>
      )}
    </section>
  );
}

export default CargasPage;
