import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import EstadoConexionCargador from "../../components/detalleCargador/EstadoConexionCargador";
import TarjetaTomaDetalle from "../../components/detalleCargador/TarjetaTomaDetalle";

import { cargadoresSimulados } from "../../data/cargadores";
import {
  obtenerFechaHoraFin,
  obtenerFechaHoraInicio,
  obtenerReservaActivaDelCargador,
  puedeIniciarCarga,
} from "../../services/reservationsService";
import type { Reserva } from "../../types/reservation";

import "../../styles/DetalleCargador/DetalleCargadorPage.css";

const USUARIO_ACTUAL_ID = "usuario-demo";
const INTERVALO_ACTUALIZACION_MS = 1_000;

function formatearFechaHora(fecha: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

function formatearDuracion(minutosTotales: number) {
  const horas = Math.floor(minutosTotales / 60);
  const minutos = minutosTotales % 60;

  if (horas === 0) {
    return `${minutos} min`;
  }

  if (minutos === 0) {
    return `${horas} ${horas === 1 ? "hora" : "horas"}`;
  }

  return `${horas} h ${minutos} min`;
}

function obtenerTiempoRestante(fechaObjetivo: Date, ahora: Date) {
  const diferenciaMs = fechaObjetivo.getTime() - ahora.getTime();

  if (diferenciaMs <= 0) {
    return "Disponible ahora";
  }

  const minutosTotales = Math.ceil(diferenciaMs / 60_000);

  const dias = Math.floor(minutosTotales / (24 * 60));
  const horas = Math.floor((minutosTotales % (24 * 60)) / 60);
  const minutos = minutosTotales % 60;

  if (dias > 0) {
    return `${dias} ${dias === 1 ? "día" : "días"} y ${horas} h`;
  }

  if (horas > 0) {
    return `${horas} h ${minutos} min`;
  }

  return `${minutos} min`;
}

function DetalleCargadorPage() {
  const { cargadorId } = useParams();

  const [reservaUsuario, setReservaUsuario] = useState<Reserva | null>(null);

  const [cargandoReserva, setCargandoReserva] = useState(true);

  const [ahora, setAhora] = useState(new Date());

  const cargador = cargadoresSimulados.find(
    (cargadorActual) => cargadorActual.id === cargadorId,
  );

  useEffect(() => {
    if (!cargadorId) {
      return;
    }

    const cargarReserva = async () => {
      setCargandoReserva(true);

      try {
        const reserva = await obtenerReservaActivaDelCargador(
          USUARIO_ACTUAL_ID,
          cargadorId,
        );

        setReservaUsuario(reserva);
      } finally {
        setCargandoReserva(false);
      }
    };

    void cargarReserva();
  }, [cargadorId]);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setAhora(new Date());
    }, INTERVALO_ACTUALIZACION_MS);

    return () => {
      window.clearInterval(intervalo);
    };
  }, []);

  const tomaReservada = useMemo(() => {
    if (!cargador || !reservaUsuario) {
      return null;
    }

    return (
      cargador.tomas.find((toma) => toma.id === reservaUsuario.tomaId) ?? null
    );
  }, [cargador, reservaUsuario]);

  const fechaHoraInicio = reservaUsuario
    ? obtenerFechaHoraInicio(reservaUsuario)
    : null;

  const fechaHoraFin = reservaUsuario
    ? obtenerFechaHoraFin(reservaUsuario)
    : null;

  const puedeComenzar = reservaUsuario
    ? puedeIniciarCarga(reservaUsuario, ahora)
    : false;

  const reservaHaFinalizado =
    fechaHoraFin !== null && ahora.getTime() >= fechaHoraFin.getTime();

  if (!cargador) {
    return <Navigate to="/panel/cargadores" replace />;
  }

  return (
    <section className="detalle-cargador-page">
      <Link to="/panel/cargadores" className="detalle-cargador-page__volver">
        <span aria-hidden="true">←</span>
        <span>Volver a cargadores</span>
      </Link>

      <header className="detalle-cargador-page__cabecera">
        <span className="detalle-cargador-page__etiqueta">
          Punto de carga municipal
        </span>

        <h1>{cargador.nombre}</h1>

        <p>{cargador.direccion}</p>
      </header>

      <EstadoConexionCargador
        estado={cargador.estado}
        fabricante={cargador.fabricante}
        gestor={cargador.gestor}
      />

      {cargandoReserva ? (
        <section
          className="detalle-cargador-page__reserva detalle-cargador-page__reserva--cargando"
          aria-live="polite"
        >
          <span className="detalle-cargador-page__reserva-spinner" />

          <p>Comprobando tus reservas...</p>
        </section>
      ) : reservaUsuario &&
        fechaHoraInicio &&
        fechaHoraFin &&
        tomaReservada &&
        !reservaHaFinalizado ? (
        <section className="detalle-cargador-page__reserva">
          <header className="detalle-cargador-page__reserva-cabecera">
            <div>
              <span className="detalle-cargador-page__etiqueta">
                Tu reserva
              </span>

              <h2>{tomaReservada.nombre} reservada</h2>
            </div>

            <span
              className={`detalle-cargador-page__reserva-estado${
                puedeComenzar
                  ? " detalle-cargador-page__reserva-estado--disponible"
                  : ""
              }`}
            >
              {puedeComenzar ? "Lista para iniciar" : "Próxima"}
            </span>
          </header>

          <div className="detalle-cargador-page__reserva-datos">
            <div>
              <span>Inicio</span>

              <strong>{formatearFechaHora(fechaHoraInicio)}</strong>
            </div>

            <div>
              <span>Fin</span>

              <strong>{formatearFechaHora(fechaHoraFin)}</strong>
            </div>

            <div>
              <span>Duración</span>

              <strong>
                {formatearDuracion(reservaUsuario.duracionMinutos)}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="detalle-cargador-page__iniciar-carga"
            disabled={!puedeComenzar}
          >
            <span aria-hidden="true">⚡</span>

            <span>Iniciar carga</span>
          </button>

          <p className="detalle-cargador-page__reserva-mensaje">
            {puedeComenzar
              ? `Puedes iniciar la carga hasta las ${reservaUsuario.horaFin}.`
              : `Podrás iniciar la carga el ${formatearFechaHora(
                  fechaHoraInicio,
                )}. Faltan ${obtenerTiempoRestante(fechaHoraInicio, ahora)}.`}
          </p>
        </section>
      ) : null}

      <section className="detalle-cargador-page__tomas">
        <header className="detalle-cargador-page__tomas-cabecera">
          <div>
            <span className="detalle-cargador-page__etiqueta">
              Tomas del cargador
            </span>

            <h2>Selecciona una toma</h2>
          </div>

          <span className="detalle-cargador-page__contador">
            {cargador.tomas.length}{" "}
            {cargador.tomas.length === 1 ? "toma" : "tomas"}
          </span>
        </header>

        <div className="detalle-cargador-page__tomas-listado">
          {cargador.tomas.map((toma) => (
            <TarjetaTomaDetalle
              key={toma.id}
              cargadorId={cargador.id}
              toma={toma}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

export default DetalleCargadorPage;
