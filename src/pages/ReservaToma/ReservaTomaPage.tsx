import { useEffect, useMemo, useState } from "react";

import { Link, Navigate, useParams } from "react-router-dom";

import ControlDuracionReserva from "../../components/reservas/ControlDuracionReserva";
import ResumenReserva from "../../components/reservas/ResumenReserva";
import SelectorDiaReserva, {
  type DiaDisponible,
} from "../../components/reservas/SelectorDiaReserva";
import SelectorHoraReserva, {
  type FranjaHoraria,
} from "../../components/reservas/SelectorHoraReserva";

import { cargadoresSimulados } from "../../data/cargadores";

import useAuth from "../../hooks/useAuth";

import {
  crearReserva,
  obtenerReservasToma,
} from "../../services/reservationsService";

import type { Reserva } from "../../types/reservation";

import "../../styles/ReservaToma/ReservaTomaPage.css";

const DURACION_MINIMA = 30;
const DURACION_MAXIMA_GENERAL = 4 * 60;
const INCREMENTO_DURACION = 30;

function convertirFechaAValor(fecha: Date) {
  const anio = fecha.getFullYear();

  const mes = String(fecha.getMonth() + 1).padStart(2, "0");

  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function crearFechaHora(fecha: string, hora: string) {
  return new Date(`${fecha}T${hora}:00`);
}

function convertirFechaAHora(fecha: Date) {
  const horas = String(fecha.getHours()).padStart(2, "0");

  const minutos = String(fecha.getMinutes()).padStart(2, "0");

  return `${horas}:${minutos}`;
}

function crearDiasDisponibles(): DiaDisponible[] {
  const hoy = new Date();

  return Array.from(
    {
      length: 3,
    },
    (_, indice) => {
      const fecha = new Date(hoy);

      fecha.setDate(hoy.getDate() + indice);

      return {
        valor: convertirFechaAValor(fecha),

        nombreDia: new Intl.DateTimeFormat("es-ES", {
          weekday: "short",
        })
          .format(fecha)
          .replace(".", "")
          .toUpperCase(),

        numeroDia: String(fecha.getDate()),

        etiqueta: indice === 0 ? "Hoy" : indice === 1 ? "Mañana" : "En 2 días",
      };
    },
  );
}

function crearTodasLasHoras() {
  const horas: string[] = [];

  for (let minutos = 0; minutos < 24 * 60; minutos += INCREMENTO_DURACION) {
    const horasParte = Math.floor(minutos / 60);

    const minutosParte = minutos % 60;

    horas.push(
      `${String(horasParte).padStart(2, "0")}:${String(minutosParte).padStart(
        2,
        "0",
      )}`,
    );
  }

  return horas;
}

function obtenerInicioReserva(reserva: Reserva) {
  return crearFechaHora(reserva.fecha, reserva.horaInicio);
}

function obtenerFinReserva(reserva: Reserva) {
  return crearFechaHora(reserva.fechaFin, reserva.horaFin);
}

function fechasSeSolapan(inicioA: Date, finA: Date, inicioB: Date, finB: Date) {
  return (
    inicioA.getTime() < finB.getTime() && finA.getTime() > inicioB.getTime()
  );
}

function franjaEstaReservada(
  fechaSeleccionada: string,
  hora: string,
  reservas: Reserva[],
) {
  const inicioFranja = crearFechaHora(fechaSeleccionada, hora);

  const finFranja = new Date(
    inicioFranja.getTime() + INCREMENTO_DURACION * 60_000,
  );

  return reservas.some((reserva) =>
    fechasSeSolapan(
      inicioFranja,
      finFranja,
      obtenerInicioReserva(reserva),
      obtenerFinReserva(reserva),
    ),
  );
}

function horaYaHaPasado(fechaSeleccionada: string, hora: string) {
  const inicioFranja = crearFechaHora(fechaSeleccionada, hora);

  return inicioFranja.getTime() < new Date().getTime();
}

function crearFranjasHorarias(
  fechaSeleccionada: string,
  reservas: Reserva[],
): FranjaHoraria[] {
  return crearTodasLasHoras().map((hora) => {
    if (horaYaHaPasado(fechaSeleccionada, hora)) {
      return {
        hora,
        estado: "pasada",
      };
    }

    if (franjaEstaReservada(fechaSeleccionada, hora, reservas)) {
      return {
        hora,
        estado: "reservada",
      };
    }

    return {
      hora,
      estado: "disponible",
    };
  });
}

function obtenerSiguienteReserva(
  fechaSeleccionada: string,
  horaInicio: string,
  reservas: Reserva[],
) {
  const inicioSeleccionado = crearFechaHora(fechaSeleccionada, horaInicio);

  return reservas
    .filter(
      (reserva) =>
        obtenerInicioReserva(reserva).getTime() >= inicioSeleccionado.getTime(),
    )
    .sort(
      (reservaA, reservaB) =>
        obtenerInicioReserva(reservaA).getTime() -
        obtenerInicioReserva(reservaB).getTime(),
    )[0];
}

function calcularDuracionMaximaDisponible(
  fechaSeleccionada: string,
  horaInicio: string,
  reservas: Reserva[],
) {
  if (!horaInicio) {
    return DURACION_MINIMA;
  }

  const inicioSeleccionado = crearFechaHora(fechaSeleccionada, horaInicio);

  const siguienteReserva = obtenerSiguienteReserva(
    fechaSeleccionada,
    horaInicio,
    reservas,
  );

  if (!siguienteReserva) {
    return DURACION_MAXIMA_GENERAL;
  }

  const minutosHastaReserva = Math.floor(
    (obtenerInicioReserva(siguienteReserva).getTime() -
      inicioSeleccionado.getTime()) /
      60_000,
  );

  return Math.max(
    DURACION_MINIMA,
    Math.min(DURACION_MAXIMA_GENERAL, minutosHastaReserva),
  );
}

function buscarReservaSolapada(
  fechaSeleccionada: string,
  horaInicio: string,
  duracionMinutos: number,
  reservas: Reserva[],
) {
  const inicioNuevaReserva = crearFechaHora(fechaSeleccionada, horaInicio);

  const finNuevaReserva = new Date(
    inicioNuevaReserva.getTime() + duracionMinutos * 60_000,
  );

  return reservas.find((reserva) =>
    fechasSeSolapan(
      inicioNuevaReserva,
      finNuevaReserva,
      obtenerInicioReserva(reserva),
      obtenerFinReserva(reserva),
    ),
  );
}

function formatearFechaCompleta(valorFecha: string) {
  const fecha = new Date(`${valorFecha}T12:00:00`);

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(fecha);
}

function ReservaTomaPage() {
  const { cargadorId, tomaId } = useParams();

  const { usuario } = useAuth();

  const usuarioId = usuario?.id ?? "";

  const diasDisponibles = useMemo(crearDiasDisponibles, []);

  const [reservasToma, setReservasToma] = useState<Reserva[]>([]);

  const [diaSeleccionado, setDiaSeleccionado] = useState(
    diasDisponibles[0].valor,
  );

  const [horaSeleccionada, setHoraSeleccionada] = useState("");

  const [duracionMinutos, setDuracionMinutos] = useState(DURACION_MINIMA);

  const [confirmando, setConfirmando] = useState(false);

  const [reservaConfirmada, setReservaConfirmada] = useState(false);

  const [mensajeError, setMensajeError] = useState("");

  const cargador = cargadoresSimulados.find(
    (cargadorActual) => cargadorActual.id === cargadorId,
  );

  const toma = cargador?.tomas.find((tomaActual) => tomaActual.id === tomaId);

  useEffect(() => {
    if (!cargadorId || !tomaId) {
      return;
    }

    const cargarReservas = async () => {
      try {
        const reservas = await obtenerReservasToma(cargadorId, tomaId);

        setReservasToma(reservas);
      } catch {
        setMensajeError("No hemos podido consultar las reservas de esta toma.");
      }
    };

    void cargarReservas();
  }, [cargadorId, tomaId]);

  const franjasHorarias = useMemo(
    () => crearFranjasHorarias(diaSeleccionado, reservasToma),
    [diaSeleccionado, reservasToma],
  );

  const primeraHoraDisponible = useMemo(
    () =>
      franjasHorarias.find((franja) => franja.estado === "disponible")?.hora ??
      "",
    [franjasHorarias],
  );

  const duracionMaximaDisponible = useMemo(
    () =>
      calcularDuracionMaximaDisponible(
        diaSeleccionado,
        horaSeleccionada,
        reservasToma,
      ),
    [diaSeleccionado, horaSeleccionada, reservasToma],
  );

  useEffect(() => {
    const horaContinuaDisponible = franjasHorarias.some(
      (franja) =>
        franja.hora === horaSeleccionada && franja.estado === "disponible",
    );

    if (!horaContinuaDisponible) {
      setHoraSeleccionada(primeraHoraDisponible);
    }
  }, [franjasHorarias, horaSeleccionada, primeraHoraDisponible]);

  useEffect(() => {
    if (duracionMinutos > duracionMaximaDisponible) {
      setDuracionMinutos(duracionMaximaDisponible);
    }
  }, [duracionMinutos, duracionMaximaDisponible]);

  const fechaHoraFin = useMemo(() => {
    if (!horaSeleccionada) {
      return null;
    }

    const fechaFin = crearFechaHora(diaSeleccionado, horaSeleccionada);

    fechaFin.setMinutes(fechaFin.getMinutes() + duracionMinutos);

    return fechaFin;
  }, [diaSeleccionado, horaSeleccionada, duracionMinutos]);

  const horaFin = fechaHoraFin ? convertirFechaAHora(fechaHoraFin) : "--:--";

  const terminaAlDiaSiguiente = fechaHoraFin
    ? convertirFechaAValor(fechaHoraFin) !== diaSeleccionado
    : false;

  const horaFinResumen = terminaAlDiaSiguiente
    ? `${horaFin} (día siguiente)`
    : horaFin;

  if (!cargador || !toma || !cargadorId || !tomaId) {
    return <Navigate to="/panel/cargadores" replace />;
  }

  const seleccionarDia = (dia: string) => {
    setDiaSeleccionado(dia);

    setHoraSeleccionada("");

    setDuracionMinutos(DURACION_MINIMA);

    setReservaConfirmada(false);

    setMensajeError("");
  };

  const seleccionarHora = (hora: string) => {
    setHoraSeleccionada(hora);

    setDuracionMinutos(DURACION_MINIMA);

    setReservaConfirmada(false);

    setMensajeError("");
  };

  const cambiarDuracion = (duracion: number) => {
    if (duracion > duracionMaximaDisponible) {
      return;
    }

    setDuracionMinutos(duracion);

    setReservaConfirmada(false);

    setMensajeError("");
  };

  const confirmarReserva = async () => {
    if (!usuarioId) {
      setMensajeError("No se ha podido identificar al usuario.");

      return;
    }

    if (!horaSeleccionada) {
      setMensajeError("Selecciona una hora disponible antes de confirmar.");

      return;
    }

    const reservaSolapada = buscarReservaSolapada(
      diaSeleccionado,
      horaSeleccionada,
      duracionMinutos,
      reservasToma,
    );

    if (reservaSolapada) {
      setMensajeError(
        `No se puede realizar la reserva porque la toma ya está ocupada desde las ${reservaSolapada.horaInicio} hasta las ${reservaSolapada.horaFin}.`,
      );

      return;
    }

    setConfirmando(true);

    setMensajeError("");

    try {
      await crearReserva({
        usuarioId,
        cargadorId,
        tomaId,
        fecha: diaSeleccionado,
        horaInicio: horaSeleccionada,
        duracionMinutos,
      });

      const reservasActualizadas = await obtenerReservasToma(
        cargadorId,
        tomaId,
      );

      setReservasToma(reservasActualizadas);

      setReservaConfirmada(true);
    } catch (error) {
      setMensajeError(
        error instanceof Error
          ? error.message
          : "No hemos podido confirmar la reserva.",
      );
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <section className="reserva-toma">
      <Link
        to={`/panel/cargadores/${cargador.id}`}
        className="reserva-toma__volver"
      >
        <span aria-hidden="true">←</span>

        <span>Volver al cargador</span>
      </Link>

      <header className="reserva-toma__cabecera">
        <span className="reserva-toma__etiqueta">Reserva de carga</span>

        <h1>Reserva {toma.nombre.toLowerCase()}</h1>

        <p>
          Elige el día, la hora de inicio y el tiempo que necesitas para cargar
          tu vehículo.
        </p>
      </header>

      <div className="reserva-toma__contenido">
        <div className="reserva-toma__formulario">
          <section className="reserva-toma__bloque">
            <header className="reserva-toma__bloque-cabecera">
              <span className="reserva-toma__paso">1</span>

              <div>
                <h2>Elige el día</h2>

                <p>Puedes reservar para hoy y los dos próximos días.</p>
              </div>
            </header>

            <SelectorDiaReserva
              dias={diasDisponibles}
              diaSeleccionado={diaSeleccionado}
              onSeleccionar={seleccionarDia}
            />
          </section>

          <section className="reserva-toma__bloque">
            <header className="reserva-toma__bloque-cabecera">
              <span className="reserva-toma__paso">2</span>

              <div>
                <h2>Elige la hora de inicio</h2>

                <p>
                  Se muestran las 24 horas del día en intervalos de 30 minutos.
                </p>
              </div>
            </header>

            <SelectorHoraReserva
              horas={franjasHorarias}
              horaSeleccionada={horaSeleccionada}
              onSeleccionar={seleccionarHora}
            />
          </section>

          <section className="reserva-toma__bloque">
            <header className="reserva-toma__bloque-cabecera">
              <span className="reserva-toma__paso">3</span>

              <div>
                <h2>Indica la duración</h2>

                <p>Añade el tiempo en bloques de 30 minutos.</p>
              </div>
            </header>

            <ControlDuracionReserva
              duracionMinutos={duracionMinutos}
              minimoMinutos={DURACION_MINIMA}
              maximoMinutos={duracionMaximaDisponible}
              incrementoMinutos={INCREMENTO_DURACION}
              onCambiar={cambiarDuracion}
            />
          </section>
        </div>

        <div className="reserva-toma__lateral">
          <ResumenReserva
            nombreCargador={cargador.nombre}
            direccion={cargador.direccion}
            nombreToma={toma.nombre}
            potenciaMaximaKw={toma.potenciaMaximaKw}
            fechaFormateada={formatearFechaCompleta(diaSeleccionado)}
            horaInicio={horaSeleccionada || "--:--"}
            horaFin={horaFinResumen}
            duracionMinutos={duracionMinutos}
          />

          {reservaConfirmada && (
            <div className="reserva-toma__confirmacion" role="status">
              <span aria-hidden="true">✓</span>

              <div>
                <strong>Reserva confirmada</strong>

                <p>Ya puedes consultarla desde “Mis reservas”.</p>
              </div>
            </div>
          )}

          {mensajeError && (
            <p className="reserva-toma__error" role="alert">
              {mensajeError}
            </p>
          )}

          <button
            type="button"
            className="reserva-toma__confirmar"
            disabled={confirmando || !horaSeleccionada || reservaConfirmada}
            onClick={confirmarReserva}
          >
            {confirmando
              ? "Confirmando..."
              : reservaConfirmada
                ? "Reserva confirmada"
                : "Confirmar reserva"}
          </button>

          <p className="reserva-toma__condiciones">
            La reserva puede continuar durante el día siguiente.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ReservaTomaPage;
