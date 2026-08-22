import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import {
  finalizarCarga,
  obtenerCargaActiva,
} from "../../services/cargasService";

import { obtenerCargadores } from "../../services/chargersService";

import type { Carga } from "../../types/carga";
import type { Cargador } from "../../types/charger";

import "../../styles/CargaActiva/CargaActivaPage.css";

// Función para formatear números.
function formatearNumero(numero: number, decimales = 2) {
  return numero.toLocaleString("es-ES", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

// Función para formatear el tiempo.
function formatearTiempo(minutos: number) {
  const minutosSeguros = Math.max(0, Math.floor(minutos));

  const horas = Math.floor(minutosSeguros / 60);

  const minutosRestantes = minutosSeguros % 60;

  if (horas === 0) {
    return `${minutosRestantes} min`;
  }

  if (minutosRestantes === 0) {
    return `${horas} h`;
  }

  return `${horas} h ${minutosRestantes} min`;
}

// Función para formatear una fecha.
function formatearFecha(fechaIso: string) {
  const fecha = new Date(fechaIso);

  if (Number.isNaN(fecha.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

// Función para formatear una hora.
function formatearHora(fechaIso: string) {
  const fecha = new Date(fechaIso);

  if (Number.isNaN(fecha.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

// Función para obtener un cargador.
function obtenerCargador(cargadores: Cargador[], cargadorId: string) {
  return cargadores.find((cargador) => cargador.id === cargadorId);
}

// Función para obtener una toma.
function obtenerToma(cargador: Cargador | undefined, tomaId: string) {
  return cargador?.tomas.find((toma) => toma.id === tomaId);
}

function CargaActivaPage() {
  const { cargaId } = useParams<{ cargaId: string }>();

  const navigate = useNavigate();

  const { usuario } = useAuth();

  const usuarioId = usuario?.id ?? "";

  // Estado para guardar la carga.
  const [carga, setCarga] = useState<Carga | null>(null);

  // Estado para guardar los cargadores.
  const [cargadores, setCargadores] = useState<Cargador[]>([]);

  // Estado para controlar la carga de datos.
  const [cargando, setCargando] = useState(true);

  // Estado para controlar la finalización.
  const [finalizando, setFinalizando] = useState(false);

  // Estado para guardar errores.
  const [error, setError] = useState("");

  // Estado para actualizar los tiempos.
  const [ahora, setAhora] = useState(() => new Date());

  // Función para cargar los datos.
  const cargarDatos = useCallback(async () => {
    if (!usuarioId || !cargaId) {
      setCarga(null);

      setCargadores([]);

      setCargando(false);

      return;
    }

    try {
      setCargando(true);

      setError("");

      const [cargaActual, cargadoresMunicipales] = await Promise.all([
        obtenerCargaActiva(usuarioId, cargaId),

        obtenerCargadores(),
      ]);

      setCarga(cargaActual);

      setCargadores(cargadoresMunicipales);
    } catch (errorCarga) {
      console.error("Error al cargar la sesión activa:", errorCarga);

      setError(
        errorCarga instanceof Error
          ? errorCarga.message
          : "No hemos podido cargar la sesión de carga.",
      );
    } finally {
      setCargando(false);
    }
  }, [cargaId, usuarioId]);

  // Carga los datos al abrir la pantalla.
  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  // Actualiza el reloj de la sesión.
  useEffect(() => {
    if (!carga) {
      return;
    }

    const intervalo = window.setInterval(() => {
      setAhora(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [carga]);

  const informacion = useMemo(() => {
    if (!carga) {
      return {
        cargador: undefined,
        toma: undefined,
      };
    }

    const cargador = obtenerCargador(cargadores, carga.cargadorId);

    const toma = obtenerToma(cargador, carga.tomaId);

    return {
      cargador,
      toma,
    };
  }, [carga, cargadores]);

  const tiempoTranscurrido = useMemo(() => {
    if (!carga) {
      return 0;
    }

    const inicio = new Date(carga.fechaHoraInicio).getTime();

    const finPrevisto = new Date(carga.fechaHoraFinPrevista).getTime();

    const momentoActual = Number.isNaN(finPrevisto)
      ? ahora.getTime()
      : Math.min(ahora.getTime(), finPrevisto);

    const diferencia = momentoActual - inicio;

    if (Number.isNaN(inicio) || diferencia <= 0) {
      return 0;
    }

    return Math.floor(diferencia / 60_000);
  }, [ahora, carga]);

  const tiempoRestante = useMemo(() => {
    if (!carga?.fechaHoraFinPrevista) {
      return null;
    }

    const fin = new Date(carga.fechaHoraFinPrevista).getTime();

    const diferencia = fin - ahora.getTime();

    if (Number.isNaN(fin) || diferencia <= 0) {
      return 0;
    }

    return Math.ceil(diferencia / 60_000);
  }, [ahora, carga]);

  const porcentajeProgreso = useMemo(() => {
    if (!carga?.fechaHoraFinPrevista) {
      return 0;
    }

    const inicio = new Date(carga.fechaHoraInicio).getTime();

    const fin = new Date(carga.fechaHoraFinPrevista).getTime();

    const duracionTotal = fin - inicio;

    if (Number.isNaN(inicio) || Number.isNaN(fin) || duracionTotal <= 0) {
      return 0;
    }

    const transcurrido = ahora.getTime() - inicio;

    const porcentaje = (transcurrido / duracionTotal) * 100;

    return Math.min(100, Math.max(0, porcentaje));
  }, [ahora, carga]);

  const potenciaActual = carga?.potenciaActualKw ?? 0;

  const energiaConsumida = useMemo(() => {
    if (!carga) {
      return 0;
    }

    if (carga.estado !== "activa") {
      return carga.energiaConsumidaKwh;
    }

    const inicio = new Date(carga.fechaHoraInicio).getTime();

    const finPrevisto = new Date(carga.fechaHoraFinPrevista).getTime();

    if (Number.isNaN(inicio)) {
      return carga.energiaConsumidaKwh;
    }

    const momentoActual = Number.isNaN(finPrevisto)
      ? ahora.getTime()
      : Math.min(ahora.getTime(), finPrevisto);

    const horasTranscurridas = Math.max(
      0,
      (momentoActual - inicio) / 3_600_000,
    );

    return Number((horasTranscurridas * carga.potenciaActualKw).toFixed(2));
  }, [ahora, carga]);

  // Función para finalizar la carga.
  const manejarFinalizarCarga = useCallback(async () => {
    if (!usuarioId || !cargaId || !carga || finalizando) {
      return;
    }

    try {
      setFinalizando(true);

      setError("");

      await finalizarCarga(cargaId, usuarioId);

      navigate("/panel/mis-cargas", {
        replace: true,

        state: {
          mensaje:
            "La carga ha finalizado correctamente y se ha añadido a Mis cargas.",
        },
      });
    } catch (errorFinalizacion) {
      console.error("Error al finalizar la carga:", errorFinalizacion);

      setError(
        errorFinalizacion instanceof Error
          ? errorFinalizacion.message
          : "No se ha podido finalizar la carga.",
      );
    } finally {
      setFinalizando(false);
    }
  }, [carga, cargaId, finalizando, navigate, usuarioId]);

  // Finaliza la carga al alcanzar su hora prevista.
  useEffect(() => {
    if (!carga?.fechaHoraFinPrevista || finalizando) {
      return;
    }

    const finPrevisto = new Date(carga.fechaHoraFinPrevista).getTime();

    if (Number.isNaN(finPrevisto) || ahora.getTime() < finPrevisto) {
      return;
    }

    void manejarFinalizarCarga();
  }, [ahora, carga, finalizando, manejarFinalizarCarga]);

  if (cargando) {
    return (
      <section className="carga-activa">
        <div className="carga-activa__cargando">
          <span className="carga-activa__spinner" aria-hidden="true" />

          <p>Cargando tu sesión de carga...</p>
        </div>
      </section>
    );
  }

  if (error && !carga) {
    return (
      <section className="carga-activa">
        <div className="carga-activa__error" role="alert">
          <h1>No se ha podido cargar la sesión</h1>

          <p>{error}</p>

          <Link to="/panel/cargadores">Volver a cargadores</Link>
        </div>
      </section>
    );
  }

  if (!carga) {
    return (
      <section className="carga-activa">
        <div className="carga-activa__error">
          <h1>No hay una carga activa</h1>

          <p>No tienes ninguna sesión de carga activa en este momento.</p>

          <Link to="/panel/cargadores">Ver cargadores</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="carga-activa">
      <Link to="/panel/cargadores" className="carga-activa__volver">
        ← Volver a cargadores
      </Link>

      <header className="carga-activa__cabecera">
        <span className="carga-activa__etiqueta">Sesión de carga</span>

        <h1>{informacion.cargador?.nombre ?? "Cargador"}</h1>

        <p>{informacion.toma?.nombre ?? "Toma"}</p>
      </header>

      {error && (
        <div className="carga-activa__mensaje-error" role="alert">
          <span aria-hidden="true">!</span>

          <p>{error}</p>
        </div>
      )}

      <section className="carga-activa__metricas" aria-label="Datos de carga">
        <article className="carga-activa__metrica carga-activa__metrica--energia">
          <div className="carga-activa__metrica-icono" aria-hidden="true">
            ⚡
          </div>

          <div>
            <span>Energía suministrada</span>

            <strong>{formatearNumero(energiaConsumida)} kWh</strong>
          </div>
        </article>

        <article className="carga-activa__metrica carga-activa__metrica--potencia">
          <div className="carga-activa__metrica-icono" aria-hidden="true">
            ϟ
          </div>

          <div>
            <span>Potencia actual</span>

            <strong>{formatearNumero(potenciaActual, 1)} kW</strong>
          </div>
        </article>

        <article className="carga-activa__metrica carga-activa__metrica--tiempo">
          <div className="carga-activa__metrica-icono" aria-hidden="true">
            ◷
          </div>

          <div>
            <span>Tiempo transcurrido</span>

            <strong>{formatearTiempo(tiempoTranscurrido)}</strong>
          </div>
        </article>

        <article className="carga-activa__metrica carga-activa__metrica--inicio">
          <div className="carga-activa__metrica-icono" aria-hidden="true">
            ◫
          </div>

          <div>
            <span>Inicio de sesión</span>

            <strong>{formatearFecha(carga.fechaHoraInicio)}</strong>

            <small>{formatearHora(carga.fechaHoraInicio)}</small>
          </div>
        </article>
      </section>

      <section className="carga-activa__tiempo-estimado">
        <h2>Tiempo estimado de sesión</h2>

        <div className="carga-activa__progreso-cabecera">
          <div>
            <span>Inicio</span>

            <strong>{formatearHora(carga.fechaHoraInicio)}</strong>
          </div>

          <div className="carga-activa__progreso-centro">
            <span>Transcurrido</span>

            <strong>{Math.round(porcentajeProgreso)}%</strong>
          </div>

          <div className="carga-activa__progreso-fin">
            <span>Fin estimado</span>

            <strong>{formatearHora(carga.fechaHoraFinPrevista)}</strong>
          </div>
        </div>

        <div
          className="carga-activa__barra"
          role="progressbar"
          aria-label="Progreso de la sesión de carga"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(porcentajeProgreso)}
        >
          <span
            style={{
              width: `${porcentajeProgreso}%`,
            }}
          />
        </div>

        <div className="carga-activa__marcas" aria-hidden="true">
          <span>0%</span>

          <span>25%</span>

          <span>50%</span>

          <span>75%</span>

          <span>100%</span>
        </div>

        <p className="carga-activa__restante">
          Tiempo restante estimado:
          <strong>
            {tiempoRestante === null
              ? " Sin límite"
              : tiempoRestante <= 0
                ? " Finalizando"
                : ` ${formatearTiempo(tiempoRestante)}`}
          </strong>
        </p>
      </section>

      <button
        type="button"
        className="carga-activa__finalizar"
        disabled={finalizando}
        onClick={() => void manejarFinalizarCarga()}
      >
        {finalizando ? "Finalizando carga..." : "Finalizar carga"}
      </button>
    </section>
  );
}

export default CargaActivaPage;
