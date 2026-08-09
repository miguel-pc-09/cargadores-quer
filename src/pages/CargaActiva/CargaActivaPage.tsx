import { useEffect, useMemo, useRef, useState } from "react";

import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import { cargadoresSimulados } from "../../data/cargadores";

import useAuth from "../../hooks/useAuth";

import {
  finalizarCarga,
  obtenerCargaPorId,
} from "../../services/cargasService";

import { marcarReservaComoFinalizada } from "../../services/reservationsService";

import type { Carga } from "../../types/carga";

import "../../styles/CargaActiva/CargaActivaPage.css";

const INTERVALO_ACTUALIZACION_MS = 1_000;

function formatearFechaHora(fechaIso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(fechaIso));
}

function formatearTiempo(minutosTotales: number) {
  const minutosSeguros = Math.max(0, Math.floor(minutosTotales));

  const horas = Math.floor(minutosSeguros / 60);

  const minutos = minutosSeguros % 60;

  if (horas === 0) {
    return `${minutos} min`;
  }

  if (minutos === 0) {
    return `${horas} ${horas === 1 ? "hora" : "horas"}`;
  }

  return `${horas} h ${minutos} min`;
}

function calcularMinutos(fechaInicioMs: number, fechaFinMs: number) {
  return Math.max(0, (fechaFinMs - fechaInicioMs) / 60_000);
}

function calcularEnergia(
  fechaInicioMs: number,
  fechaActualMs: number,
  potenciaKw: number,
) {
  const horasTranscurridas = Math.max(
    0,
    (fechaActualMs - fechaInicioMs) / 3_600_000,
  );

  return Number((horasTranscurridas * potenciaKw).toFixed(2));
}

function CargaActivaPage() {
  const { cargaId } = useParams();

  const navigate = useNavigate();

  const { usuario } = useAuth();

  const usuarioId = usuario?.id ?? "";

  const [carga, setCarga] = useState<Carga | null>(null);

  const [cargando, setCargando] = useState(true);

  const [ahora, setAhora] = useState(new Date());

  const [mensajeError, setMensajeError] = useState("");

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [finalizando, setFinalizando] = useState(false);

  const finalizacionAutomaticaIniciada = useRef(false);

  useEffect(() => {
    if (!cargaId || !usuarioId) {
      setCarga(null);

      setCargando(false);

      return;
    }

    const cargarSesion = async () => {
      setCargando(true);

      setMensajeError("");

      try {
        const cargaEncontrada = await obtenerCargaPorId(cargaId);

        if (!cargaEncontrada) {
          setCarga(null);

          setMensajeError("No se ha encontrado la sesión de carga.");

          return;
        }

        if (cargaEncontrada.usuarioId !== usuarioId) {
          setCarga(null);

          setMensajeError(
            "No tienes permiso para consultar esta sesión de carga.",
          );

          return;
        }

        setCarga(cargaEncontrada);
      } catch {
        setCarga(null);

        setMensajeError("No hemos podido cargar los datos de la sesión.");
      } finally {
        setCargando(false);
      }
    };

    void cargarSesion();
  }, [cargaId, usuarioId]);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setAhora(new Date());
    }, INTERVALO_ACTUALIZACION_MS);

    return () => {
      window.clearInterval(intervalo);
    };
  }, []);

  const datosCalculados = useMemo(() => {
    if (!carga) {
      return null;
    }

    const inicioMs = new Date(carga.fechaHoraInicio).getTime();

    const finPrevistoMs = new Date(carga.fechaHoraFinPrevista).getTime();

    const ahoraMs = ahora.getTime();

    const duracionPrevistaMs = Math.max(1, finPrevistoMs - inicioMs);

    const tiempoTranscurridoMs = Math.max(
      0,
      Math.min(ahoraMs - inicioMs, duracionPrevistaMs),
    );

    const porcentaje = Math.min(
      100,
      Math.max(0, (tiempoTranscurridoMs / duracionPrevistaMs) * 100),
    );

    const minutosTranscurridos = calcularMinutos(
      inicioMs,
      Math.min(ahoraMs, finPrevistoMs),
    );

    const minutosRestantes = calcularMinutos(
      Math.min(ahoraMs, finPrevistoMs),
      finPrevistoMs,
    );

    const energiaConsumidaKwh = calcularEnergia(
      inicioMs,
      Math.min(ahoraMs, finPrevistoMs),
      carga.potenciaActualKw,
    );

    return {
      inicioMs,
      finPrevistoMs,
      porcentaje,
      minutosTranscurridos,
      minutosRestantes,
      energiaConsumidaKwh,
    };
  }, [carga, ahora]);

  const terminarCarga = async (finalizacionAutomatica = false) => {
    if (
      !usuarioId ||
      !carga ||
      carga.usuarioId !== usuarioId ||
      carga.estado !== "activa" ||
      finalizando
    ) {
      return;
    }

    setFinalizando(true);

    setMensajeError("");

    try {
      await finalizarCarga(carga.id);

      await marcarReservaComoFinalizada(carga.reservaId, usuarioId);

      navigate("/panel/mis-cargas", {
        replace: finalizacionAutomatica,

        state: {
          mensaje: finalizacionAutomatica
            ? "La carga ha finalizado al alcanzar la hora prevista."
            : "La carga se ha detenido correctamente.",
        },
      });
    } catch (error) {
      finalizacionAutomaticaIniciada.current = false;

      setMensajeError(
        error instanceof Error
          ? error.message
          : "No hemos podido finalizar la carga.",
      );
    } finally {
      setFinalizando(false);

      setMostrarConfirmacion(false);
    }
  };

  useEffect(() => {
    if (!carga || !datosCalculados || carga.estado !== "activa") {
      return;
    }

    const haLlegadoAlFinal = ahora.getTime() >= datosCalculados.finPrevistoMs;

    if (haLlegadoAlFinal && !finalizacionAutomaticaIniciada.current) {
      finalizacionAutomaticaIniciada.current = true;

      void terminarCarga(true);
    }
  }, [ahora, carga, datosCalculados, usuarioId]);

  if (!cargaId) {
    return <Navigate to="/panel/mis-cargas" replace />;
  }

  if (cargando) {
    return (
      <section className="carga-activa">
        <div className="carga-activa__cargando">
          <span className="carga-activa__spinner" aria-hidden="true" />

          <p>Cargando sesión...</p>
        </div>
      </section>
    );
  }

  if (!carga || !datosCalculados) {
    return (
      <section className="carga-activa">
        <div className="carga-activa__error" role="alert">
          <h1>No se puede mostrar la carga</h1>

          <p>{mensajeError || "No se ha encontrado la sesión solicitada."}</p>

          <Link to="/panel/mis-cargas">Volver a Mis cargas</Link>
        </div>
      </section>
    );
  }

  const cargador = cargadoresSimulados.find(
    (cargadorActual) => cargadorActual.id === carga.cargadorId,
  );

  const toma = cargador?.tomas.find(
    (tomaActual) => tomaActual.id === carga.tomaId,
  );

  const cargaEstaActiva = carga.estado === "activa";

  return (
    <section className="carga-activa">
      <Link
        to={`/panel/cargadores/${carga.cargadorId}?reservaId=${carga.reservaId}`}
        className="carga-activa__volver"
      >
        <span aria-hidden="true">←</span>

        <span>Volver al cargador</span>
      </Link>

      <header className="carga-activa__cabecera">
        <span className="carga-activa__etiqueta">Sesión de carga</span>

        <h1>{cargaEstaActiva ? "Carga en curso" : "Carga finalizada"}</h1>

        <p>Consulta el estado de la carga de tu vehículo.</p>
      </header>

      {mensajeError && (
        <div className="carga-activa__mensaje-error" role="alert">
          <span aria-hidden="true">!</span>

          <p>{mensajeError}</p>
        </div>
      )}

      <div className="carga-activa__panel">
        <div className="carga-activa__estado">
          <span className="carga-activa__estado-icono">⚡</span>

          <div>
            <strong>
              {cargaEstaActiva ? "Vehículo cargando" : "Carga completada"}
            </strong>

            <p>
              {cargador?.nombre ?? "Cargador"} · {toma?.nombre ?? "Toma"}
            </p>
          </div>

          <span
            className={`carga-activa__estado-badge${
              cargaEstaActiva ? " carga-activa__estado-badge--activa" : ""
            }`}
          >
            {cargaEstaActiva ? "En curso" : "Finalizada"}
          </span>
        </div>

        <div className="carga-activa__datos">
          <div>
            <span>Inicio real</span>

            <strong>{formatearFechaHora(carga.fechaHoraInicio)}</strong>
          </div>

          <div>
            <span>Fin previsto</span>

            <strong>{formatearFechaHora(carga.fechaHoraFinPrevista)}</strong>
          </div>

          <div>
            <span>Potencia actual</span>

            <strong>{carga.potenciaActualKw.toLocaleString("es-ES")} kW</strong>
          </div>

          <div>
            <span>Energía suministrada</span>

            <strong>
              {datosCalculados.energiaConsumidaKwh.toLocaleString("es-ES", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              kWh
            </strong>
          </div>

          <div>
            <span>Tiempo transcurrido</span>

            <strong>
              {formatearTiempo(datosCalculados.minutosTranscurridos)}
            </strong>
          </div>

          <div>
            <span>Tiempo restante</span>

            <strong>{formatearTiempo(datosCalculados.minutosRestantes)}</strong>
          </div>
        </div>

        <div className="carga-activa__progreso">
          <div className="carga-activa__progreso-cabecera">
            <span>Progreso de la reserva</span>

            <strong>{Math.round(datosCalculados.porcentaje)}%</strong>
          </div>

          <div
            className="carga-activa__barra"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(datosCalculados.porcentaje)}
          >
            <span
              style={{
                width: `${datosCalculados.porcentaje}%`,
              }}
            />
          </div>
        </div>

        {cargaEstaActiva && (
          <>
            {!mostrarConfirmacion ? (
              <button
                type="button"
                className="carga-activa__detener"
                disabled={finalizando}
                onClick={() => setMostrarConfirmacion(true)}
              >
                Parar carga
              </button>
            ) : (
              <div
                className="carga-activa__confirmacion"
                role="alertdialog"
                aria-labelledby="titulo-parar-carga"
              >
                <div>
                  <strong id="titulo-parar-carga">
                    ¿Quieres parar la carga?
                  </strong>

                  <p>La sesión quedará finalizada y aparecerá en Mis cargas.</p>
                </div>

                <div className="carga-activa__confirmacion-acciones">
                  <button
                    type="button"
                    disabled={finalizando}
                    onClick={() => setMostrarConfirmacion(false)}
                  >
                    Continuar cargando
                  </button>

                  <button
                    type="button"
                    disabled={finalizando}
                    onClick={() => void terminarCarga(false)}
                  >
                    {finalizando ? "Finalizando..." : "Sí, parar carga"}
                  </button>
                </div>
              </div>
            )}

            <p className="carga-activa__aviso">
              Si paras la carga antes de la hora prevista, la sesión se guardará
              como finalizada.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default CargaActivaPage;
