import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import { obtenerCargasUsuario } from "../../services/cargasService";
import { obtenerCargadores } from "../../services/chargersService";

import {
  cancelarReserva,
  obtenerReservasUsuario,
} from "../../services/reservationsService";

import type { Carga } from "../../types/carga";
import type { Cargador } from "../../types/charger";
import type { EstadoReserva, Reserva } from "../../types/reservation";

import { formatearDuracionReserva } from "../../utils/formateadores";

import "../../styles/Reservas/ReservasPage.css";

type PestanaReservas = "activas" | "historico";

// Crea una fecha completa con día y hora.
function crearFechaHora(fecha: string, hora: string) {
  return new Date(`${fecha}T${hora}:00`);
}

// Función para formatear fecha y hora.
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

// Función para obtener el texto del estado.
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

// Función para obtener los datos del cargador.
function obtenerDatosCargador(reserva: Reserva, cargadores: Cargador[]) {
  const cargador = cargadores.find(
    (cargadorActual) => cargadorActual.id === reserva.cargadorId,
  );

  const toma = cargador?.tomas.find(
    (tomaActual) => tomaActual.id === reserva.tomaId,
  );

  return {
    nombreCargador: cargador?.nombre ?? "Cargador no disponible",
    nombreToma: toma?.nombre ?? "",
  };
}

function ReservasPage() {
  const { usuario } = useAuth();

  const usuarioId = usuario?.id ?? "";

  // Estado para guardar las reservas.
  const [reservas, setReservas] = useState<Reserva[]>([]);

  // Estado para guardar los cargadores.
  const [cargadores, setCargadores] = useState<Cargador[]>([]);

  // Estado para guardar las cargas.
  const [cargas, setCargas] = useState<Carga[]>([]);

  // Estado para controlar la pestaña activa.
  const [pestanaActiva, setPestanaActiva] =
    useState<PestanaReservas>("activas");

  // Estado para controlar la carga.
  const [cargando, setCargando] = useState(true);

  // Estado para guardar errores.
  const [mensajeError, setMensajeError] = useState("");

  // Estado para guardar mensajes.
  const [mensajeExito, setMensajeExito] = useState("");

  // Estado para guardar la reserva pendiente de cancelar.
  const [reservaPendienteCancelar, setReservaPendienteCancelar] = useState<
    string | null
  >(null);

  // Estado para guardar la reserva en proceso.
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

  // Función para cargar las reservas.
  const cargarReservas = useCallback(async () => {
    if (!usuarioId) {
      setReservas([]);
      setCargadores([]);
      setCargas([]);
      setCargando(false);

      return;
    }

    setCargando(true);
    setMensajeError("");

    try {
      const [reservasUsuario, cargadoresMunicipales, cargasUsuario] =
        await Promise.all([
          obtenerReservasUsuario(usuarioId),
          obtenerCargadores(),
          obtenerCargasUsuario(usuarioId),
        ]);

      setReservas(reservasUsuario);
      setCargadores(cargadoresMunicipales);
      setCargas(cargasUsuario);
    } catch {
      setMensajeError(
        "No hemos podido cargar tus reservas. Inténtalo de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  }, [usuarioId]);

  // Carga las reservas al cambiar de usuario.
  useEffect(() => {
    void cargarReservas();
  }, [cargarReservas]);

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

  // Función para solicitar una cancelación.
  const solicitarCancelacion = (reservaId: string) => {
    setReservaPendienteCancelar(reservaId);

    setMensajeExito("");
    setMensajeError("");
  };

  // Función para cerrar la confirmación.
  const cerrarConfirmacionCancelacion = () => {
    if (cancelandoId) {
      return;
    }

    setReservaPendienteCancelar(null);
  };

  // Función para confirmar una cancelación.
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
                const datosCargador = obtenerDatosCargador(reserva, cargadores);

                const cargaActiva = cargas.find(
                  (carga) =>
                    carga.reservaId === reserva.id && carga.estado === "activa",
                );

                const destinoReserva = cargaActiva
                  ? `/panel/cargas/${cargaActiva.id}`
                  : `/panel/cargadores/${reserva.cargadorId}?reservaId=${reserva.id}`;

                // Comprueba si la reserva puede cancelarse.
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
                          to={destinoReserva}
                          className="mis-reservas__enlace-cargador"
                          title={
                            cargaActiva
                              ? "Ver carga en curso"
                              : "Ver reserva en el cargador"
                          }
                        >
                          {datosCargador.nombreCargador}
                          {datosCargador.nombreToma && (
                            <> · {datosCargador.nombreToma}</>
                          )}
                        </Link>
                      </td>

                      <td className="mis-reservas__duracion">
                        {formatearDuracionReserva(reserva.duracionMinutos)}
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
