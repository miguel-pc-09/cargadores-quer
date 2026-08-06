import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { cargadoresSimulados } from "../../data/cargadores";
import {
  cancelarReserva,
  obtenerReservasUsuario,
} from "../../services/reservationsService";
import type { EstadoReserva, Reserva } from "../../types/reservation";

import "../../styles/Reservas/ReservasPage.css";

const USUARIO_ACTUAL_ID = "usuario-demo";

type PestanaReservas = "activas" | "historico";

function crearFechaHora(fecha: string, hora: string) {
  return new Date(`${fecha}T${hora}:00`);
}

function formatearFechaHora(fecha: string, hora: string) {
  const fechaHora = crearFechaHora(fecha, hora);

  const fechaFormateada = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fechaHora);

  return `${fechaFormateada}, ${hora}`;
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

  const toma = cargador?.tomas.find(
    (tomaActual) => tomaActual.id === reserva.tomaId,
  );

  return {
    nombreCargador: cargador?.nombre ?? "Cargador no disponible",
    nombreToma: toma?.nombre ?? "Toma no disponible",
  };
}

function ReservasPage() {
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
    setCargando(true);
    setMensajeError("");

    try {
      const reservasUsuario = await obtenerReservasUsuario(USUARIO_ACTUAL_ID);

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
  }, []);

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
    setCancelandoId(reservaId);
    setMensajeError("");
    setMensajeExito("");

    try {
      await cancelarReserva(reservaId, USUARIO_ACTUAL_ID);

      const reservasActualizadas =
        await obtenerReservasUsuario(USUARIO_ACTUAL_ID);

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
        <span className="mis-reservas__etiqueta">Gestión de reservas</span>

        <h1>Mis reservas</h1>

        <p>
          Consulta tus próximas reservas y revisa el historial de reservas
          anteriores.
        </p>
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
          Próximas y activas
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
        <div className="mis-reservas__tabla">
          <div className="mis-reservas__fila mis-reservas__fila--cabecera">
            <span>Inicio</span>
            <span>Fin</span>
            <span>Cargador</span>
            <span>Duración</span>
            <span>Estado</span>
            <span aria-hidden="true" />
          </div>

          {reservasMostradas.map((reserva) => {
            const datosCargador = obtenerDatosCargador(reserva);
            const puedeCancelar = reserva.estado === "confirmada";
            const estaConfirmandoCancelacion =
              reservaPendienteCancelar === reserva.id;
            const estaCancelando = cancelandoId === reserva.id;

            return (
              <article key={reserva.id} className="mis-reservas__registro">
                <div className="mis-reservas__fila">
                  <div className="mis-reservas__celda">
                    <span>Inicio</span>
                    <strong>
                      {formatearFechaHora(reserva.fecha, reserva.horaInicio)}
                    </strong>
                  </div>

                  <div className="mis-reservas__celda">
                    <span>Fin</span>
                    <strong>
                      {formatearFechaHora(reserva.fechaFin, reserva.horaFin)}
                    </strong>
                  </div>

                  <div className="mis-reservas__celda mis-reservas__celda--cargador">
                    <span>Cargador</span>
                    <strong>{datosCargador.nombreCargador}</strong>
                    <small>{datosCargador.nombreToma}</small>
                  </div>

                  <div className="mis-reservas__celda">
                    <span>Duración</span>
                    <strong>
                      {formatearDuracion(reserva.duracionMinutos)}
                    </strong>
                  </div>

                  <div className="mis-reservas__celda">
                    <span>Estado</span>
                    <strong
                      className={`mis-reservas__estado mis-reservas__estado--${reserva.estado}`}
                    >
                      {obtenerTextoEstado(reserva.estado)}
                    </strong>
                  </div>

                  <div className="mis-reservas__acciones">
                    <Link
                      to={`/panel/cargadores/${reserva.cargadorId}`}
                      className="mis-reservas__accion mis-reservas__accion--principal"
                    >
                      Ver cargador
                    </Link>

                    {puedeCancelar && (
                      <button
                        type="button"
                        className="mis-reservas__accion mis-reservas__accion--cancelar"
                        onClick={() => solicitarCancelacion(reserva.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                {estaConfirmandoCancelacion && (
                  <div className="mis-reservas__confirmar-cancelacion">
                    <div>
                      <strong>¿Cancelar esta reserva?</strong>
                      <p>
                        La franja volverá a quedar disponible para otros
                        usuarios.
                      </p>
                    </div>

                    <div className="mis-reservas__confirmar-acciones">
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
                        onClick={() => void confirmarCancelacion(reserva.id)}
                      >
                        {estaCancelando ? "Cancelando..." : "Sí, cancelar"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ReservasPage;
