import { cargadoresSimulados } from "../data/cargadores";

import { obtenerCargasUsuario } from "./cargasService";
import { obtenerReservasUsuario } from "./reservationsService";
import { obtenerVehiculoUsuario } from "./usersService";

import type { Carga } from "../types/carga";
import type {
  ActividadUsuario,
  AlertaUsuario,
  ResumenUsuario,
} from "../types/panelUsuario";
import type { Reserva } from "../types/reservation";

function crearFechaHora(fecha: string, hora: string) {
  return new Date(`${fecha}T${hora}:00`);
}

function formatearFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}

function formatearHora(fecha: Date) {
  return new Intl.DateTimeFormat("es-ES", {
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
    return `${horas} h`;
  }

  return `${horas} h ${minutos} min`;
}

function obtenerNombreCargador(cargadorId: string) {
  return (
    cargadoresSimulados.find((cargador) => cargador.id === cargadorId)
      ?.nombre ?? "Cargador"
  );
}

function obtenerNombreToma(cargadorId: string, tomaId: string) {
  const cargador = cargadoresSimulados.find(
    (cargadorActual) => cargadorActual.id === cargadorId,
  );

  return cargador?.tomas.find((toma) => toma.id === tomaId)?.nombre ?? "Toma";
}

function calcularDuracionCarga(carga: Carga) {
  const inicio = new Date(carga.fechaHoraInicio).getTime();

  const fin = carga.fechaHoraFinReal
    ? new Date(carga.fechaHoraFinReal).getTime()
    : Date.now();

  return Math.max(0, Math.round((fin - inicio) / 60_000));
}

function crearActividadReservas(reservas: Reserva[]): ActividadUsuario[] {
  return reservas.map((reserva) => {
    const fechaCreacion = new Date(reserva.creadaEn);

    const nombreCargador = obtenerNombreCargador(reserva.cargadorId);

    const nombreToma = obtenerNombreToma(reserva.cargadorId, reserva.tomaId);

    if (reserva.estado === "cancelada") {
      return {
        id: `reserva-cancelada-${reserva.id}`,
        tipo: "reserva-cancelada",
        titulo: "Reserva cancelada",
        ubicacion: nombreCargador,
        toma: nombreToma,
        fecha: formatearFecha(fechaCreacion),
        hora: formatearHora(fechaCreacion),
        detalle: `Reserva prevista para ${formatearFecha(
          crearFechaHora(reserva.fecha, reserva.horaInicio),
        )} a las ${reserva.horaInicio}`,
      };
    }

    return {
      id: `reserva-creada-${reserva.id}`,
      tipo: "reserva-creada",
      titulo: "Reserva creada",
      ubicacion: nombreCargador,
      toma: nombreToma,
      fecha: formatearFecha(fechaCreacion),
      hora: formatearHora(fechaCreacion),
      detalle: `Reserva para ${formatearFecha(
        crearFechaHora(reserva.fecha, reserva.horaInicio),
      )} de ${reserva.horaInicio} a ${reserva.horaFin}`,
    };
  });
}

function crearActividadCargas(cargas: Carga[]): ActividadUsuario[] {
  const actividades: ActividadUsuario[] = [];

  cargas.forEach((carga) => {
    const inicio = new Date(carga.fechaHoraInicio);

    const nombreCargador = obtenerNombreCargador(carga.cargadorId);

    const nombreToma = obtenerNombreToma(carga.cargadorId, carga.tomaId);

    actividades.push({
      id: `carga-iniciada-${carga.id}`,
      tipo: "carga-iniciada",
      titulo: "Carga iniciada",
      ubicacion: nombreCargador,
      toma: nombreToma,
      fecha: formatearFecha(inicio),
      hora: formatearHora(inicio),
      detalle: `Potencia actual: ${carga.potenciaActualKw.toLocaleString(
        "es-ES",
      )} kW`,
    });

    if (carga.estado !== "activa" && carga.fechaHoraFinReal) {
      const fin = new Date(carga.fechaHoraFinReal);

      actividades.push({
        id: `carga-finalizada-${carga.id}`,
        tipo: "carga-finalizada",
        titulo:
          carga.estado === "cancelada" ? "Carga detenida" : "Carga finalizada",
        ubicacion: nombreCargador,
        toma: nombreToma,
        fecha: formatearFecha(fin),
        hora: formatearHora(fin),
        detalle: `Duración: ${formatearDuracion(
          calcularDuracionCarga(carga),
        )} · ${carga.energiaConsumidaKwh.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} kWh`,
      });
    }
  });

  return actividades;
}

function obtenerFechaActividad(actividad: ActividadUsuario) {
  const partesFecha = actividad.fecha.split(" de ");

  if (partesFecha.length !== 3) {
    return 0;
  }

  const [diaTexto, mesTexto, anioTexto] = partesFecha;

  const meses: Record<string, number> = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11,
  };

  const mes = meses[mesTexto.toLowerCase()];

  if (mes === undefined) {
    return 0;
  }

  const [horaTexto, minutoTexto] = actividad.hora.split(":");

  return new Date(
    Number(anioTexto),
    mes,
    Number(diaTexto),
    Number(horaTexto),
    Number(minutoTexto),
  ).getTime();
}

function obtenerProximaReserva(reservas: Reserva[]) {
  const ahora = Date.now();

  const proxima = reservas
    .filter(
      (reserva) =>
        reserva.estado === "confirmada" || reserva.estado === "activa",
    )
    .map((reserva) => ({
      reserva,
      fechaHora: crearFechaHora(reserva.fecha, reserva.horaInicio),
    }))
    .filter(({ fechaHora }) => fechaHora.getTime() >= ahora)
    .sort(
      (reservaA, reservaB) =>
        reservaA.fechaHora.getTime() - reservaB.fechaHora.getTime(),
    )[0];

  if (!proxima) {
    return undefined;
  }

  const hoy = new Date();

  const manana = new Date();

  manana.setDate(hoy.getDate() + 1);

  const fechaReserva = proxima.fechaHora;

  const esHoy = fechaReserva.toDateString() === hoy.toDateString();

  const esManana = fechaReserva.toDateString() === manana.toDateString();

  if (esHoy) {
    return `Hoy a las ${proxima.reserva.horaInicio}`;
  }

  if (esManana) {
    return `Mañana a las ${proxima.reserva.horaInicio}`;
  }

  return `${formatearFecha(fechaReserva)} a las ${proxima.reserva.horaInicio}`;
}

export async function obtenerPanelUsuario(usuarioId: string): Promise<{
  resumen: ResumenUsuario;
  alertas: AlertaUsuario[];
  actividad: ActividadUsuario[];
}> {
  const [reservas, cargas, vehiculo] = await Promise.all([
    obtenerReservasUsuario(usuarioId),
    obtenerCargasUsuario(usuarioId),
    obtenerVehiculoUsuario(usuarioId),
  ]);

  const numeroTomas = cargadoresSimulados.reduce(
    (total, cargador) => total + cargador.tomas.length,
    0,
  );

  const energiaAcumulada = Number(
    cargas
      .reduce((total, carga) => total + carga.energiaConsumidaKwh, 0)
      .toFixed(2),
  );

  const reservasActivas = reservas.filter(
    (reserva) => reserva.estado === "confirmada" || reserva.estado === "activa",
  );

  const resumen: ResumenUsuario = {
    numeroCargadores: cargadoresSimulados.length,

    numeroTomas,

    numeroCargas: cargas.length,

    energiaAcumulada,

    reservasActivas: reservasActivas.length,

    proximaReserva: obtenerProximaReserva(reservas),

    estado: "correcto",

    numeroPenalizaciones: 0,
  };

  const alertas: AlertaUsuario[] = [];

  if (!vehiculo) {
    alertas.push({
      id: "vehiculo-no-encontrado",
      tipo: "aviso",
      titulo: "Vehículo no registrado",
      mensaje:
        "No hay ningún vehículo asociado a tu cuenta. Ponte en contacto con el Ayuntamiento.",
    });
  }

  if (vehiculo?.estadoValidacion === "pendiente") {
    alertas.push({
      id: "vehiculo-pendiente",
      tipo: "aviso",
      titulo: "Vehículo pendiente de validación",
      mensaje:
        "El Ayuntamiento debe validar la matrícula antes de permitir nuevas reservas o cargas.",
    });
  }

  if (vehiculo?.estadoValidacion === "rechazado") {
    alertas.push({
      id: "vehiculo-rechazado",
      tipo: "error",
      titulo: "Vehículo no validado",
      mensaje:
        "La validación del vehículo ha sido rechazada. Revisa la matrícula desde tu perfil.",
    });
  }

  const actividad = [
    ...crearActividadReservas(reservas),
    ...crearActividadCargas(cargas),
  ]
    .sort(
      (actividadA, actividadB) =>
        obtenerFechaActividad(actividadB) - obtenerFechaActividad(actividadA),
    )
    .slice(0, 10);

  return {
    resumen,
    alertas,
    actividad,
  };
}
