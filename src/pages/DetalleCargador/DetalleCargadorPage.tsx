import { useEffect, useMemo, useState } from "react";

import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import EstadoConexionCargador from "../../components/detalleCargador/EstadoConexionCargador";
import TarjetaTomaDetalle from "../../components/detalleCargador/TarjetaTomaDetalle";

import useAuth from "../../hooks/useAuth";

import {
  iniciarCarga,
  obtenerCargaActivaPorReserva,
} from "../../services/cargasService";

import { obtenerCargadorPorId } from "../../services/chargersService";

import {
  marcarReservaComoActiva,
  obtenerFechaHoraFin,
  obtenerFechaHoraInicio,
  obtenerReservaActivaDelCargador,
  obtenerReservaPorId,
  puedeIniciarCarga,
} from "../../services/reservationsService";

import {
  obtenerVehiculoUsuario,
  puedeUsuarioIniciarCarga,
} from "../../services/usersService";

import type { Cargador } from "../../types/charger";
import type { Reserva } from "../../types/reservation";
import type { DatosVehiculo } from "../../types/user";

import "../../styles/DetalleCargador/DetalleCargadorPage.css";

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
  const parametros = useParams<{
    cargadorId: string;
  }>();

  const cargadorId = parametros.cargadorId;

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const { usuario } = useAuth();

  const usuarioId = usuario?.id ?? "";

  const reservaId = searchParams.get("reservaId");

  const [cargador, setCargador] = useState<Cargador | null>(null);

  const [cargandoCargador, setCargandoCargador] = useState(true);

  const [errorCargador, setErrorCargador] = useState("");

  const [reservaUsuario, setReservaUsuario] = useState<Reserva | null>(null);

  const [cargandoReserva, setCargandoReserva] = useState(true);

  const [iniciandoCarga, setIniciandoCarga] = useState(false);

  const [cargaActivaId, setCargaActivaId] = useState<string | null>(null);

  const [buscandoCargaActiva, setBuscandoCargaActiva] = useState(false);

  const [mensajeError, setMensajeError] = useState("");

  const [ahora, setAhora] = useState(new Date());

  const [vehiculo, setVehiculo] = useState<DatosVehiculo | null>(null);

  const [cargandoVehiculo, setCargandoVehiculo] = useState(true);

  const [vehiculoValidado, setVehiculoValidado] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarCargador() {
      if (!cargadorId) {
        if (activo) {
          setCargador(null);
          setCargandoCargador(false);
        }

        return;
      }

      try {
        setCargandoCargador(true);

        setErrorCargador("");

        const cargadorObtenido = await obtenerCargadorPorId(cargadorId);

        if (!activo) {
          return;
        }

        setCargador(cargadorObtenido);
      } catch (error) {
        if (!activo) {
          return;
        }

        setCargador(null);

        setErrorCargador(
          error instanceof Error
            ? error.message
            : "No se ha podido cargar el cargador.",
        );
      } finally {
        if (activo) {
          setCargandoCargador(false);
        }
      }
    }

    void cargarCargador();

    return () => {
      activo = false;
    };
  }, [cargadorId]);

  useEffect(() => {
    let activo = true;

    async function cargarVehiculo() {
      if (!usuarioId) {
        if (activo) {
          setVehiculo(null);

          setVehiculoValidado(false);

          setCargandoVehiculo(false);
        }

        return;
      }

      try {
        setCargandoVehiculo(true);

        const [vehiculoObtenido, estaValidado] = await Promise.all([
          obtenerVehiculoUsuario(usuarioId),

          puedeUsuarioIniciarCarga(usuarioId),
        ]);

        if (!activo) {
          return;
        }

        setVehiculo(vehiculoObtenido);

        setVehiculoValidado(estaValidado);
      } catch {
        if (!activo) {
          return;
        }

        setVehiculo(null);

        setVehiculoValidado(false);
      } finally {
        if (activo) {
          setCargandoVehiculo(false);
        }
      }
    }

    void cargarVehiculo();

    return () => {
      activo = false;
    };
  }, [usuarioId]);

  useEffect(() => {
    if (!cargadorId || !usuarioId) {
      setReservaUsuario(null);

      setCargandoReserva(false);

      return;
    }

    const cargadorIdSeguro = cargadorId;

    let activo = true;

    async function cargarReserva() {
      try {
        setCargandoReserva(true);

        setMensajeError("");

        if (reservaId) {
          const reservaExacta = await obtenerReservaPorId(reservaId, usuarioId);

          if (!activo) {
            return;
          }

          if (!reservaExacta || reservaExacta.cargadorId !== cargadorIdSeguro) {
            setReservaUsuario(null);

            setMensajeError("No se ha encontrado la reserva seleccionada.");

            return;
          }

          setReservaUsuario(reservaExacta);

          return;
        }

        const siguienteReserva = await obtenerReservaActivaDelCargador(
          usuarioId,
          cargadorIdSeguro,
        );

        if (!activo) {
          return;
        }

        setReservaUsuario(siguienteReserva);
      } catch {
        if (!activo) {
          return;
        }

        setReservaUsuario(null);

        setMensajeError("No hemos podido consultar tus reservas.");
      } finally {
        if (activo) {
          setCargandoReserva(false);
        }
      }
    }

    void cargarReserva();

    return () => {
      activo = false;
    };
  }, [cargadorId, reservaId, usuarioId]);

  useEffect(() => {
    let activo = true;

    async function cargarCargaActiva() {
      if (!reservaUsuario || reservaUsuario.estado !== "activa") {
        if (activo) {
          setCargaActivaId(null);
          setBuscandoCargaActiva(false);
        }

        return;
      }

      try {
        setBuscandoCargaActiva(true);

        const cargaActiva = await obtenerCargaActivaPorReserva(
          reservaUsuario.id,
        );

        if (!activo) {
          return;
        }

        setCargaActivaId(cargaActiva?.id ?? null);
      } catch {
        if (!activo) {
          return;
        }

        setCargaActivaId(null);
        setMensajeError(
          "No hemos podido localizar la carga activa de esta reserva.",
        );
      } finally {
        if (activo) {
          setBuscandoCargaActiva(false);
        }
      }
    }

    void cargarCargaActiva();

    return () => {
      activo = false;
    };
  }, [reservaUsuario]);

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

  const puedeComenzarPorHorario = reservaUsuario
    ? puedeIniciarCarga(reservaUsuario, ahora)
    : false;

  const puedeComenzarCarga =
    puedeComenzarPorHorario && vehiculoValidado && !cargandoVehiculo;

  const reservaHaFinalizado =
    fechaHoraFin !== null && ahora.getTime() >= fechaHoraFin.getTime();

  const reservaCancelada = reservaUsuario?.estado === "cancelada";

  const reservaCaducada = reservaUsuario?.estado === "caducada";

  const reservaFinalizada = reservaUsuario?.estado === "finalizada";

  const reservaActiva = reservaUsuario?.estado === "activa";

  const mostrarReserva =
    reservaUsuario !== null &&
    fechaHoraInicio !== null &&
    fechaHoraFin !== null &&
    tomaReservada !== null;

  async function iniciarCargaUsuario() {
    if (
      !usuarioId ||
      !reservaUsuario ||
      !tomaReservada ||
      !fechaHoraFin ||
      !puedeComenzarCarga ||
      iniciandoCarga
    ) {
      return;
    }

    try {
      setIniciandoCarga(true);

      setMensajeError("");

      const puedeIniciar = await puedeUsuarioIniciarCarga(usuarioId);

      if (!puedeIniciar) {
        setVehiculoValidado(false);

        throw new Error(
          "El vehículo debe estar validado por el Ayuntamiento antes de iniciar una carga.",
        );
      }

      const reservaActivaActualizada = await marcarReservaComoActiva(
        reservaUsuario.id,
        usuarioId,
      );

      const nuevaCarga = await iniciarCarga({
        usuarioId,

        reservaId: reservaActivaActualizada.id,

        cargadorId: reservaActivaActualizada.cargadorId,

        tomaId: reservaActivaActualizada.tomaId,

        fechaHoraInicio: new Date().toISOString(),

        fechaHoraFinPrevista: fechaHoraFin.toISOString(),

        potenciaMaximaKw: tomaReservada.potenciaMaximaKw,
      });

      navigate(`/panel/cargas/${nuevaCarga.id}`);
    } catch (error) {
      setMensajeError(
        error instanceof Error
          ? error.message
          : "No hemos podido iniciar la carga.",
      );
    } finally {
      setIniciandoCarga(false);
    }
  }

  if (cargandoCargador) {
    return (
      <section className="detalle-cargador-page">
        <Link to="/panel/cargadores" className="detalle-cargador-page__volver">
          <span aria-hidden="true">←</span>

          <span>Volver a cargadores</span>
        </Link>

        <section
          className="detalle-cargador-page__reserva detalle-cargador-page__reserva--cargando"
          aria-live="polite"
        >
          <span className="detalle-cargador-page__reserva-spinner" />

          <p>Cargando cargador...</p>
        </section>
      </section>
    );
  }

  if (!cargador && !errorCargador) {
    return <Navigate to="/panel/cargadores" replace />;
  }

  if (!cargador) {
    return (
      <section className="detalle-cargador-page">
        <Link to="/panel/cargadores" className="detalle-cargador-page__volver">
          <span aria-hidden="true">←</span>

          <span>Volver a cargadores</span>
        </Link>

        <p className="detalle-cargador-page__reserva-error" role="alert">
          {errorCargador}
        </p>
      </section>
    );
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

      {mensajeError && (
        <p className="detalle-cargador-page__reserva-error" role="alert">
          {mensajeError}
        </p>
      )}

      {cargandoReserva ? (
        <section
          className="detalle-cargador-page__reserva detalle-cargador-page__reserva--cargando"
          aria-live="polite"
        >
          <span className="detalle-cargador-page__reserva-spinner" />

          <p>Comprobando tus reservas...</p>
        </section>
      ) : mostrarReserva ? (
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
                puedeComenzarCarga
                  ? " detalle-cargador-page__reserva-estado--disponible"
                  : ""
              }`}
            >
              {reservaCancelada
                ? "Cancelada"
                : reservaCaducada
                  ? "Caducada"
                  : reservaFinalizada
                    ? "Finalizada"
                    : reservaActiva
                      ? "Carga activa"
                      : puedeComenzarPorHorario && !vehiculoValidado
                        ? "Vehículo pendiente"
                        : puedeComenzarCarga
                          ? "Lista para iniciar"
                          : "Próxima"}
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

          {!reservaCancelada && !reservaCaducada && !reservaFinalizada && (
            <>
              {puedeComenzarPorHorario &&
                !vehiculoValidado &&
                !reservaActiva && (
                  <div className="detalle-cargador-page__vehiculo-bloqueado">
                    <div className="detalle-cargador-page__vehiculo-bloqueado-icono">
                      !
                    </div>

                    <div className="detalle-cargador-page__vehiculo-bloqueado-contenido">
                      <strong>Vehículo pendiente de validación</strong>

                      <p>
                        {vehiculo
                          ? `La matrícula ${vehiculo.matricula} debe ser validada por el Ayuntamiento antes de iniciar una carga.`
                          : "No hay ningún vehículo validado asociado a tu cuenta."}
                      </p>

                      <Link
                        to="/panel/perfil"
                        className="detalle-cargador-page__vehiculo-bloqueado-enlace"
                      >
                        Ver estado en mi perfil
                      </Link>
                    </div>
                  </div>
                )}

              <button
                type="button"
                className="detalle-cargador-page__iniciar-carga"
                disabled={
                  reservaActiva
                    ? buscandoCargaActiva || !cargaActivaId
                    : !puedeComenzarCarga || iniciandoCarga
                }
                onClick={() => {
                  if (reservaActiva && cargaActivaId) {
                    navigate(`/panel/cargas/${cargaActivaId}`);
                    return;
                  }

                  void iniciarCargaUsuario();
                }}
              >
                <span aria-hidden="true">⚡</span>

                <span>
                  {iniciandoCarga
                    ? "Iniciando carga..."
                    : reservaActiva
                      ? buscandoCargaActiva
                        ? "Buscando carga..."
                        : cargaActivaId
                          ? "Ver carga en curso"
                          : "Carga no disponible"
                      : !vehiculoValidado && puedeComenzarPorHorario
                        ? "Vehículo pendiente de validación"
                        : "Iniciar carga"}
                </span>
              </button>

              <p className="detalle-cargador-page__reserva-mensaje">
                {reservaActiva
                  ? cargaActivaId
                    ? "La carga está en curso. Puedes volver a consultar su progreso cuando quieras."
                    : "Ya existe una carga activa para esta reserva."
                  : puedeComenzarPorHorario && !vehiculoValidado
                    ? "Tu reserva sigue siendo válida, pero necesitas que la matrícula sea aprobada antes de iniciar la carga."
                    : puedeComenzarCarga
                      ? `Puedes iniciar la carga hasta las ${reservaUsuario.horaFin}.`
                      : reservaHaFinalizado
                        ? "El horario de esta reserva ya ha finalizado."
                        : `Podrás iniciar la carga el ${formatearFechaHora(
                            fechaHoraInicio,
                          )}. Faltan ${obtenerTiempoRestante(
                            fechaHoraInicio,
                            ahora,
                          )}.`}
              </p>
            </>
          )}

          {reservaCancelada && (
            <p className="detalle-cargador-page__reserva-mensaje">
              Esta reserva fue cancelada.
            </p>
          )}

          {reservaCaducada && (
            <p className="detalle-cargador-page__reserva-mensaje">
              Esta reserva terminó sin que se iniciara una carga.
            </p>
          )}

          {reservaFinalizada && (
            <p className="detalle-cargador-page__reserva-mensaje">
              La carga asociada a esta reserva ha finalizado.
            </p>
          )}
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
