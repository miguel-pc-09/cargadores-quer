import { Fragment, useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { cargadoresSimulados } from "../../data/cargadores";

import useAuth from "../../hooks/useAuth";

import {
  cancelarReserva,
  obtenerReservasUsuario,
} from "../../services/reservationsService";

import type { EstadoReserva, Reserva } from "../../types/reservation";

import "../../styles/Reservas/ReservasPage.css";

type PestanaReservas = "activas" | "historico";

function crearFechaHora(fecha: string, hora: string) {
  return new Date(`${fecha}T${hora}:00`);
}

function formatearFechaHora(fecha: string, hora: string) {
  const fechaHora = crearFechaHora(fecha, hora);

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fechaHora);
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

function obtenerTextoEstado(estado: EstadoReserva) {
  const textos: Record<EstadoReserva, string> = {
    confirmada: "Próxima",
    activa: "Activa",
    finalizada: "Completada",
    cancelada: "Cancelada",
    caducada: "Caducada",
  };

  return textos[estado];
}

function obtenerDatosCargador(reserva: Reserva) {
  const cargador = cargadoresSimulados.find(
    (cargadorActual) => cargadorActual.id === reserva.cargadorId,
  );

  return {
    nombreCargador: cargador?.nombre ?? "Cargador no disponible",
  };
}

function ReservasPage() {
  const { usuario } = useAuth();

  const usuarioId = usuario?.id ?? "";

  const [reservas, setReservas] = useState<Reserva[]>([]);

  const [pestanaActiva, setPestanaActiva] =
    useState<PestanaReservas>("activas");

  const [cargando, setCargando] = useState(true);

  const [mensajeError, setMensajeError] = useState("");

  const [mensajeExito, setMensajeExito] = useState("");

  const [reservaPendienteCancelar, setReservaPendienteCancelar] = useState<
    string | null
  >(null);

  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

  const cargarReservas = async () => {
    if (!usuarioId) {
      setReservas([]);
      setCargando(false);

      return;
    }

    setCargando(true);
    setMensajeError("");

    try {
      const reservasUsuario = await obtenerReservasUsuario(usuarioId);

      setReservas(reservasUsuario);
    } catch {
      setMensajeError(
        "No hemos podido cargar tus reservas. Inténtalo de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarReservas();
  }, [usuarioId]);

  const reservasActivas = useMemo(
    () =>
      reservas
        .filter(
          (reserva) =>
            reserva.estado === "confirmada" || reserva.estado === "activa",
        )
        .sort(
          (reservaA, reservaB) =>
            crearFechaHora(reservaA.fecha, reservaA.horaInicio).getTime() -
            crearFechaHora(reservaB.fecha, reservaB.horaInicio).getTime(),
        ),
    [reservas],
  );

  const reservasHistoricas = useMemo(
    () =>
      reservas
        .filter(
          (reserva) =>
            reserva.estado === "finalizada" ||
            reserva.estado === "cancelada" ||
            reserva.estado === "caducada",
        )
        .sort(
          (reservaA, reservaB) =>
            crearFechaHora(reservaB.fecha, reservaB.horaInicio).getTime() -
            crearFechaHora(reservaA.fecha, reservaA.horaInicio).getTime(),
        ),
    [reservas],
  );

  const reservasMostradas =
    pestanaActiva === "activas" ? reservasActivas : reservasHistoricas;

  const solicitarCancelacion = (reservaId: string) => {
    setReservaPendienteCancelar(reservaId);

    setMensajeExito("");
    setMensajeError("");
  };

  const cerrarConfirmacionCancelacion = () => {
    if (cancelandoId) {
      return;
    }

    setReservaPendienteCancelar(null);
  };

  const confirmarCancelacion = async (reservaId: string) => {
    if (!usuarioId) {
      setMensajeError("No se ha podido identificar al usuario.");

      return;
    }

    setCancelandoId(reservaId);

    setMensajeError("");
    setMensajeExito("");

    try {
      await cancelarReserva(reservaId, usuarioId);

      const reservasActualizadas = await obtenerReservasUsuario(usuarioId);

      setReservas(reservasActualizadas);

      setReservaPendienteCancelar(null);

      setMensajeExito("La reserva se ha cancelado correctamente.");
    } catch (error) {
      setMensajeError(
        error instanceof Error
          ? error.message
          : "No hemos podido cancelar la reserva.",
      );
    } finally {
      setCancelandoId(null);
    }
  };

  return (
    <section className="mis-reservas">
      <header className="mis-reservas__cabecera">
        <h1>Mis reservas</h1>
      </header>

      <div
        className="mis-reservas__pestanas"
        role="tablist"
        aria-label="Tipos de reservas"
      >
        <button
          type="button"
          role="tab"
          aria-selected={pestanaActiva === "activas"}
          className={`mis-reservas__pestana${
            pestanaActiva === "activas" ? " mis-reservas__pestana--activa" : ""
          }`}
          onClick={() => setPestanaActiva("activas")}
        >
          Activas
          <span>{reservasActivas.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={pestanaActiva === "historico"}
          className={`mis-reservas__pestana${
            pestanaActiva === "historico"
              ? " mis-reservas__pestana--activa"
              : ""
          }`}
          onClick={() => setPestanaActiva("historico")}
        >
          Histórico
          <span>{reservasHistoricas.length}</span>
        </button>
      </div>

      {mensajeExito && (
        <div className="mis-reservas__mensaje-exito" role="status">
          <span aria-hidden="true">✓</span>

          <p>{mensajeExito}</p>
        </div>
      )}

      {mensajeError && (
        <div className="mis-reservas__mensaje-error" role="alert">
          <span aria-hidden="true">!</span>

          <p>{mensajeError}</p>
        </div>
      )}

      {cargando ? (
        <div className="mis-reservas__cargando" role="status">
          <span className="mis-reservas__spinner" aria-hidden="true" />

          <p>Cargando tus reservas...</p>
        </div>
      ) : reservasMostradas.length === 0 ? (
        <div className="mis-reservas__vacio">
          <span className="mis-reservas__vacio-icono" aria-hidden="true">
            ◷
          </span>

          <h2>
            {pestanaActiva === "activas"
              ? "No tienes reservas próximas"
              : "Todavía no tienes historial"}
          </h2>

          <p>
            {pestanaActiva === "activas"
              ? "Cuando reserves una toma, aparecerá aquí."
              : "Las reservas completadas, canceladas o caducadas aparecerán aquí."}
          </p>

          {pestanaActiva === "activas" && (
            <Link to="/panel/cargadores" className="mis-reservas__buscar">
              Buscar cargador
            </Link>
          )}
        </div>
      ) : (
        <section
          className="mis-reservas__historial"
          aria-label={
            pestanaActiva === "activas"
              ? "Reservas próximas y activas"
              : "Histórico de reservas"
          }
        >
          <table className="mis-reservas__tabla">
            <thead>
              <tr>
                <th>Inicio</th>

                <th>Fin</th>

                <th>Cargador</th>

                <th>Duración</th>

                <th>Estado</th>

                {pestanaActiva === "activas" && <th aria-label="Acciones" />}
              </tr>
            </thead>

            <tbody>
              {reservasMostradas.map((reserva) => {
                const datosCargador = obtenerDatosCargador(reserva);

                const puedeCancelar = reserva.estado === "confirmada";

                const estaConfirmandoCancelacion =
                  reservaPendienteCancelar === reserva.id;

                const estaCancelando = cancelandoId === reserva.id;

                return (
                  <Fragment key={reserva.id}>
                    <tr>
                      <td>
                        {formatearFechaHora(reserva.fecha, reserva.horaInicio)}
                      </td>

                      <td>
                        {formatearFechaHora(reserva.fechaFin, reserva.horaFin)}
                      </td>

                      <td>
                        <Link
                          to={`/panel/cargadores/${reserva.cargadorId}?reservaId=${reserva.id}`}
                          className="mis-reservas__enlace-cargador"
                        >
                          {datosCargador.nombreCargador}
                        </Link>
                      </td>

                      <td className="mis-reservas__duracion">
                        {formatearDuracion(reserva.duracionMinutos)}
                      </td>

                      <td>
                        <span
                          className={`mis-reservas__estado mis-reservas__estado--${reserva.estado}`}
                        >
                          {obtenerTextoEstado(reserva.estado)}
                        </span>
                      </td>

                      {pestanaActiva === "activas" && (
                        <td className="mis-reservas__acciones">
                          {puedeCancelar && (
                            <button
                              type="button"
                              className="mis-reservas__cancelar"
                              onClick={() => solicitarCancelacion(reserva.id)}
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      )}
                    </tr>

                    {estaConfirmandoCancelacion && (
                      <tr className="mis-reservas__fila-confirmacion">
                        <td colSpan={pestanaActiva === "activas" ? 6 : 5}>
                          <div className="mis-reservas__confirmacion">
                            <div>
                              <strong>¿Cancelar esta reserva?</strong>

                              <p>
                                La franja volverá a quedar disponible para otros
                                usuarios.
                              </p>
                            </div>

                            <div className="mis-reservas__confirmacion-acciones">
                              <button
                                type="button"
                                disabled={estaCancelando}
                                onClick={cerrarConfirmacionCancelacion}
                              >
                                Volver
                              </button>

                              <button
                                type="button"
                                disabled={estaCancelando}
                                onClick={() =>
                                  void confirmarCancelacion(reserva.id)
                                }
                              >
                                {estaCancelando
                                  ? "Cancelando..."
                                  : "Sí, cancelar"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </section>
  );
}

export default ReservasPage;
