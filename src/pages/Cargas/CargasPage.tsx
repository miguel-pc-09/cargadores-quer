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
import type { Carga, EstadoCarga } from "../../types/carga";

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

  const diferenciaMinutos = Math.max(0, Math.round((fin - inicio) / 60_000));

  return diferenciaMinutos;
}

function obtenerTextoEstado(estado: EstadoCarga) {
  const textos: Record<EstadoCarga, string> = {
    activa: "En curso",
    finalizada: "Finalizada",
    cancelada: "Cancelada",
  };

  return textos[estado];
}

function obtenerDatosCargador(carga: Carga) {
  const cargador = cargadoresSimulados.find(
    (cargadorActual) => cargadorActual.id === carga.cargadorId,
  );

  const toma = cargador?.tomas.find(
    (tomaActual) => tomaActual.id === carga.tomaId,
  );

  return {
    nombreCargador: cargador?.nombre ?? "Cargador no disponible",

    direccion: cargador?.direccion ?? "Dirección no disponible",

    nombreToma: toma?.nombre ?? "Toma no disponible",
  };
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

  const hayCargaActiva = cargasOrdenadas.some(
    (carga) => carga.estado === "activa",
  );

  return (
    <section className="mis-cargas">
      <header className="mis-cargas__cabecera">
        <span className="mis-cargas__etiqueta">Historial energético</span>

        <h1>Mis cargas</h1>

        <p>
          Consulta la energía suministrada y todas las sesiones realizadas con
          tu vehículo.
        </p>
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
            <span>Energía total suministrada</span>

            <strong>
              {formatearEnergia(estadisticas.energiaTotalKwh)} kWh
            </strong>

            <p>
              {estadisticas.numeroSesiones}{" "}
              {estadisticas.numeroSesiones === 1 ? "sesión" : "sesiones"}{" "}
              registradas
            </p>
          </section>

          <section className="mis-cargas__estadisticas">
            <article className="mis-cargas__estadistica">
              <span>Este mes</span>

              <strong>
                {formatearEnergia(estadisticas.energiaMesActualKwh)} kWh
              </strong>

              <small>
                {estadisticas.numeroSesionesMesActual}{" "}
                {estadisticas.numeroSesionesMesActual === 1
                  ? "sesión"
                  : "sesiones"}
              </small>
            </article>

            <article className="mis-cargas__estadistica">
              <span>Tiempo total</span>

              <strong>
                {formatearTiempoTotal(estadisticas.tiempoTotalMinutos)}
              </strong>

              <small>Tiempo conectado</small>
            </article>

            <article className="mis-cargas__estadistica">
              <span>Potencia media</span>

              <strong>
                {estadisticas.potenciaMediaKw.toLocaleString("es-ES", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                kW
              </strong>

              <small>Media de las sesiones</small>
            </article>

            <article className="mis-cargas__estadistica mis-cargas__estadistica--coste">
              <span>Coste estimado</span>

              <strong>
                {estadisticas.costeDisponible &&
                estadisticas.costeEstimadoEuros !== null
                  ? formatearCoste(estadisticas.costeEstimadoEuros)
                  : "Pendiente de tarifa"}
              </strong>

              <small>
                {estadisticas.costeDisponible &&
                estadisticas.tarifaReferenciaEuroKwh !== null
                  ? `${estadisticas.tarifaReferenciaEuroKwh.toLocaleString(
                      "es-ES",
                    )} €/kWh`
                  : "Preparado para facturación futura"}
              </small>
            </article>
          </section>

          {hayCargaActiva && (
            <div className="mis-cargas__aviso-activa">
              <span aria-hidden="true">⚡</span>

              <div>
                <strong>Tienes una carga en curso</strong>

                <p>
                  Puedes abrirla desde el historial para consultar su progreso.
                </p>
              </div>
            </div>
          )}

          <section className="mis-cargas__historial">
            <header className="mis-cargas__historial-cabecera">
              <div>
                <span className="mis-cargas__etiqueta">
                  Sesiones registradas
                </span>

                <h2>Historial de cargas</h2>
              </div>

              <span className="mis-cargas__contador">
                {cargasOrdenadas.length}{" "}
                {cargasOrdenadas.length === 1 ? "sesión" : "sesiones"}
              </span>
            </header>

            <div className="mis-cargas__tabla">
              <div className="mis-cargas__fila mis-cargas__fila--cabecera">
                <span>Inicio</span>
                <span>Fin</span>
                <span>Cargador</span>
                <span>Duración</span>
                <span>Energía</span>
                <span>Estado</span>
                <span aria-hidden="true" />
              </div>

              {cargasOrdenadas.map((carga) => {
                const datosCargador = obtenerDatosCargador(carga);

                const duracionReal = calcularDuracionReal(carga);

                const fechaFin =
                  carga.fechaHoraFinReal ?? carga.fechaHoraFinPrevista;

                return (
                  <article key={carga.id} className="mis-cargas__registro">
                    <div className="mis-cargas__fila">
                      <div className="mis-cargas__celda">
                        <span>Inicio</span>

                        <strong>
                          {formatearFechaHora(carga.fechaHoraInicio)}
                        </strong>
                      </div>

                      <div className="mis-cargas__celda">
                        <span>Fin</span>

                        <strong>
                          {carga.estado === "activa"
                            ? "En curso"
                            : formatearFechaHora(fechaFin)}
                        </strong>
                      </div>

                      <div className="mis-cargas__celda mis-cargas__celda--cargador">
                        <span>Cargador</span>

                        <strong>{datosCargador.nombreCargador}</strong>

                        <small>
                          {datosCargador.nombreToma}
                          {" · "}
                          {datosCargador.direccion}
                        </small>
                      </div>

                      <div className="mis-cargas__celda">
                        <span>Duración</span>

                        <strong>{formatearTiempoTotal(duracionReal)}</strong>
                      </div>

                      <div className="mis-cargas__celda mis-cargas__celda--energia">
                        <span>Energía</span>

                        <strong>
                          {formatearEnergia(carga.energiaConsumidaKwh)} kWh
                        </strong>
                      </div>

                      <div className="mis-cargas__celda">
                        <span>Estado</span>

                        <strong
                          className={`mis-cargas__estado mis-cargas__estado--${carga.estado}`}
                        >
                          {obtenerTextoEstado(carga.estado)}
                        </strong>
                      </div>

                      <div className="mis-cargas__acciones">
                        {carga.estado === "activa" ? (
                          <Link
                            to={`/panel/cargas/${carga.id}`}
                            className="mis-cargas__accion mis-cargas__accion--activa"
                          >
                            Ver carga
                          </Link>
                        ) : (
                          <Link
                            to={`/panel/cargadores/${carga.cargadorId}?reservaId=${carga.reservaId}`}
                            className="mis-cargas__accion"
                          >
                            Ver cargador
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </section>
  );
}

export default CargasPage;
