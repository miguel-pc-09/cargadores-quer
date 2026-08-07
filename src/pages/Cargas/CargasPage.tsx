import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { cargadoresSimulados } from "../../data/cargadores";
import { obtenerCargasUsuario } from "../../services/cargasService";
import {
  calcularEstadisticasCargas,
  formatearCoste,
  formatearEnergia,
  formatearTiempoTotal,
} from "../../services/estadisticasService";
import type { Carga } from "../../types/carga";

import "../../styles/Cargas/CargasPage.css";

const USUARIO_ACTUAL_ID = "usuario-demo";

interface EstadoNavegacion {
  mensaje?: string;
}

function formatearFechaHora(fechaIso: string) {
  const fecha = new Date(fechaIso);

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

function calcularDuracionReal(carga: Carga) {
  const inicio = new Date(carga.fechaHoraInicio).getTime();

  const fin = carga.fechaHoraFinReal
    ? new Date(carga.fechaHoraFinReal).getTime()
    : Date.now();

  return Math.max(0, Math.round((fin - inicio) / 60_000));
}

function obtenerNombreCargador(carga: Carga) {
  const cargador = cargadoresSimulados.find(
    (cargadorActual) => cargadorActual.id === carga.cargadorId,
  );

  return cargador?.nombre ?? "Cargador no disponible";
}

function CargasPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const estadoNavegacion = location.state as EstadoNavegacion | null;

  const [cargas, setCargas] = useState<Carga[]>([]);
  const [cargando, setCargando] = useState(true);

  const [mensajeExito, setMensajeExito] = useState(
    estadoNavegacion?.mensaje ?? "",
  );

  const [mensajeError, setMensajeError] = useState("");

  const cargarSesiones = async () => {
    setCargando(true);
    setMensajeError("");

    try {
      const cargasUsuario = await obtenerCargasUsuario(USUARIO_ACTUAL_ID);

      setCargas(cargasUsuario);
    } catch {
      setMensajeError("No hemos podido cargar tu historial de cargas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarSesiones();
  }, []);

  useEffect(() => {
    if (!estadoNavegacion?.mensaje) {
      return;
    }

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [estadoNavegacion, location.pathname, navigate]);

  const estadisticas = useMemo(
    () => calcularEstadisticasCargas(cargas),
    [cargas],
  );

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
                  <th>Cargador</th>
                  <th>Duración</th>
                  <th>Energía</th>
                </tr>
              </thead>

              <tbody>
                {cargasOrdenadas.map((carga) => {
                  const fechaFin =
                    carga.fechaHoraFinReal ?? carga.fechaHoraFinPrevista;

                  const duracionReal = calcularDuracionReal(carga);

                  return (
                    <tr key={carga.id}>
                      <td>{formatearFechaHora(carga.fechaHoraInicio)}</td>

                      <td>
                        {carga.estado === "activa"
                          ? "En curso"
                          : formatearFechaHora(fechaFin)}
                      </td>

                      <td className="mis-cargas__cargador">
                        {obtenerNombreCargador(carga)}
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
